import type { User as PrismaUser, UserInfo } from '@prisma/client'

// Shape of req.user, matching what passport.deserializeUser selects
declare global {
    namespace Express {
        interface User extends Pick<PrismaUser, 'id' | 'name' | 'username' | 'profile'> {
            userInfo: UserInfo | null
        }
    }
}

// Extra info passed back when a login needs an OTP code
declare module 'passport-local' {
    interface IVerifyOptions {
        userId?: string
        email?: string | null
    }
}

// Recipes this browser session has already been counted as viewing
declare module 'express-session' {
    interface SessionData {
        viewedPosts?: string[]
    }
}

export {}
