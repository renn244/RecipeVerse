import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { prisma } from '../db/db'
import { MultiFactorSendCode } from '../controllers/authController.'

dotenv.config()
// not tested
passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

passport.deserializeUser(async (id, cb) => {
    try {
        if(!id) return cb(null, false)

        const user = await prisma.user.findUnique({
            where: { 
                id: id as string
            },
            select: {
                id: true,
                name: true,
                username: true,
                profile: true,
                createAt: true,
                updatedAt: true,
                userInfo: true
            } // this is where you control the data that is being send
        })
        
        if(!user || !user.userInfo) return cb('User not found')

        cb(null, user)
    } catch (error) {
        console.log('error in the deserializeUser in the local passport' + error)
        cb(error)
    }
})

passport.use(new LocalStrategy(async function(username, password, cb) {
    try {
        if(!username || !password) throw new Error('fill in required fields')

        const getUser = await prisma.user.findUnique({
            where: {
                username: username
            },
            include: {
                userInfo: true
            }
        })


        if(!getUser || !getUser.password) throw new Error('wrong username')
            
        const verifyPassword = await bcrypt.compare(password, getUser.password)

        if(!verifyPassword) throw new Error('Wrong password')

        if(getUser?.MultiFactor && getUser.userInfo?.email && getUser.secret) {
            const getOTPCode = await MultiFactorSendCode(getUser.userInfo?.email, getUser.secret)
            if(!getOTPCode) throw new Error('failed to generate otpCode')
            return cb(null, false, { message : 'otp_required', userId: getUser.id, email: getUser.userInfo.email})
        }

        return cb(null, getUser)

    } catch (error: any) {
        cb(error.message)
    }
}))