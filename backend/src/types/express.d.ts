import type { User as PrismaUser, UserInfo } from '@prisma/client'

declare global {
    namespace Express {
        interface User extends Pick<PrismaUser, 'id' | 'name' | 'username' | 'profile'> {
            userInfo: UserInfo | null
        }
    }
}

declare module 'passport-local' {
    interface IVerifyOptions {
        userId?: string
        email?: string | null
    }
}

declare module 'express-session' {
    interface SessionData {
        viewedPosts?: string[]
    }
}

export {}
