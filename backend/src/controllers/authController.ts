import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../db/db'
import { totp } from 'otplib'
import { User as PrismaUser } from '@prisma/client'
import crypto from 'crypto'
import { sendEmail } from '../utils/mailer'

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body

        if(!token) throw new Error('reset link is invalid')
        if(!password || String(password).length < 6) throw new Error('password must be at least 6 characters')

        const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } })
        if(!record || record.expiresAt < new Date()) throw new Error('this reset link is invalid or has expired')

        const saltRounds = parseInt(process.env.BCRYPT_SALTROUNDS!) || 10
        const hashPassword = await bcrypt.hash(password, saltRounds)

        await prisma.$transaction([
            prisma.user.update({ where: { id: record.userId }, data: { password: hashPassword } }),
            prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } })
        ])

        return res.status(200).json({ success: true, message: 'password updated, you can log in now' })
    } catch (error: any) {
        console.log('Error in the resetPassword in the authControllers Error: ' + error.message)
        return res.status(400).json({ error : error.message })
    }
}

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, password, email } = req.body

        const getUser = await prisma.user.findUnique({
            where: {
                username: username
            }
        }) 

        if(getUser) throw new Error('username already exist')

        const saltRounds = parseInt(process.env.BCRYPT_SALTROUNDS!)
        const hashPassword = await bcrypt.hash(password, saltRounds)

        const createUser = await prisma.$transaction(async (txprisma) => {
            const User: PrismaUser = await txprisma.user.create({
                data: {
                    name: username,
                    username: username,
                    password: hashPassword,
                }
            })

            if(!User) throw new Error('failed to create user')

            const createuserInfo = await txprisma.userInfo.create({
                data: {
                    userId: User.id,
                    email: email || ""
                }
                
            })

            return {
                ...User,
                userInfo: createuserInfo
            }
        })

        if(!createUser) throw new Error('failed to create User')

        req.login(createUser, (err) => {
            if(err) {
                console.log('Failed to login after signup: ', err);
                return res.status(400).json('failed to login but account is created')
            }
            return res.status(200).json({ message: 'successfully log in', user: createUser })
        })
    } catch (error: any) {
        console.log('Error in the username controller Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        // same answer whether or not the email exists, so it can't be used to find accounts
        const genericResponse = { success: true, message: 'If that email is registered, a reset link has been sent.' }

        if(!email) throw new Error('email is required')

        const getUser = await prisma.user.findFirst({
            where: {
                userInfo: {
                    email: email
                }
            }
        })

        if(!getUser) return res.status(200).json(genericResponse)

        // one active link per user, valid for 1 hour; only a hash is stored
        const token = crypto.randomBytes(32).toString('hex')
        await prisma.passwordResetToken.deleteMany({ where: { userId: getUser.id } })
        await prisma.passwordResetToken.create({
            data: {
                userId: getUser.id,
                tokenHash: hashToken(token),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
        })

        const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`
        const sent = await sendEmail(email, 'Reset your RecipeVerse password',
            `<p>Click the link below to choose a new password. It expires in 1 hour.</p><p><a href="${link}">${link}</a></p><p>If you didn't ask for this, you can ignore this email.</p>`)
        if(!sent) throw new Error('failed to send the reset email, please try again')

        return res.status(200).json(genericResponse)
    } catch (error: any) {
        console.log('Error in the forgotPassword in the authControllers Error: ' + error.message)
        return res.status(400).json({ error : error.message})
    }
}

// a function not a Route
export const MultiFactorSendCode = async (email: string, secret: string) =>  {
    try {

        const token = totp.generate(secret)

        const sent = await sendEmail(email, 'OTP Code', `<p>Your RecipeVerse login code:</p><h2>${token}</h2>`)
        if(!sent) return undefined

        return token
    } catch (error: any) {
        console.log('error in the MultiFactorSendCode function in the auth Controller ' + error)
        return undefined
    }
}

export const VerifyOtpCode = async (req: Request, res: Response) => {
    try {
        const { otp, userId } = req.body
        
        const getUser = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                userInfo: true
            }
        })
  
        if(!getUser?.secret) throw new Error('secret does not exist. Contact Support')

        const verifyTOTP = totp.verify({ 
            token: otp,
            secret: getUser.secret
        })

        if(!verifyTOTP) {
            return res.status(203).json({
                success: false,
                message: 'wrong otp Code'
            })
        }

        req.logIn(getUser, (err) => {
            if(err) {
                console.log('error in the req.Login in the verifyOtp' + err)
                return res.status(400).json({ error: 'failed to log you in' })
            }

            return res.status(200).json({
                success: true,
                message: 'successfully verified OTP',
            })
        })
    } catch (error: any) {
        console.log('error in the MultiFactorVerifyCode function in the auth Controller ' + error)
        res.status(400).json({ error : error.message })
    }
}

export const ResendOtpCode = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body
        // the email is already in the search params 
        // but it can be edited so it's beeter to have the email here
        const getUserInfo = await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                userInfo: true,
                secret: true
            }
        })

        if(!getUserInfo?.userInfo?.email || !getUserInfo.secret) throw new Error('2FA is not set up for this account')

        const otpCode = await MultiFactorSendCode(getUserInfo.userInfo.email, getUserInfo.secret)
        if(!otpCode) throw new Error('failed to send the OTP email, please try again')

        res.status(200).json({
            success: true,
            message: "otp code resent"
        })
    } catch (error: any) {
        console.log('error in the ResendOtpCode function in the auth Controller' + error)
        res.status(400).json({ error: error.message })
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.logout((err) => {
            if(err) return next(err)
            res.status(200).json({ message : 'Successfully logged out' })
        })
        // This will clear the login session, regardless of the authentication method used
    } catch (error: any) {
        console.log('Error in the logout function in the authController Error: ' + error.message)
        return res.status(400).json({ error : 'internal server error' })
    }
}

export const check = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated()) {
            res.status(200).json({
                user: req.user
            })
        } else {
           
            res.status(200).json({ user: undefined })
        }
    } catch (error: any) {
        console.log('Error in the check function in the authController Error: ' + error.message)
        return res.status(400).json({ error : 'internal server error' })
    }
}