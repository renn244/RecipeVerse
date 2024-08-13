import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../db/db'
import { User as PrismaUser } from '@prisma/client'

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
        // do later
    } catch (error: any) {
        console.log('Error in the forgotPassword in the authControllers Error: ' + error.message)
        return res.status(400).json({ error : error.message})
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