import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../db/db'
import { totp } from 'otplib'
import { User as PrismaUser } from '@prisma/client'
import nodemailer from 'nodemailer'

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

        const getUser = await prisma.user.findFirst({
            where: {
                userInfo: {
                    email: email
                }
            }
        })

        if(!getUser) {
            return res.status(204).json({
                success: false,
                message: 'email does not exist'
            })
        }

        // send email here

    } catch (error: any) {
        console.log('Error in the forgotPassword in the authControllers Error: ' + error.message)
        return res.status(400).json({ error : error.message})
    }
}

// a function not a Route
export const MultiFactorSendCode = async (email: string, secret: string) =>  {
    try {

        const token = totp.generate(secret)  
        // Node Mailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        })

        let mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'OTP Code',
            text: 'code to login',
            html: `<h2>${token}</h2>`
        }

        // await the promise form so a failed send is caught below
        // (throwing inside the callback form crashed the whole server)
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent', info.response)

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