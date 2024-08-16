import { NextFunction, Request, Response } from 'express'
import { prisma } from '../db/db'
import { getSocketId, io } from '../socket/socket'
import bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'
import { removeFile } from '../utils/removeFileUploads'
import crypto from 'crypto'

export const isFollowing = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params // who we are searching for if we are following
        const user = req.user // this is the client who is asking

        if(!userId || !user?.id) throw new Error('empty variable')

        const findFollow = await prisma.follow.findFirst({
            where: {
                AND: [
                    {followerId: user.id}, // the client is the follower
                    {followingId: userId}
                ]
            }
        })

        if(!findFollow) {
            return res.status(200).json({ message : 'not following' })
        } else {
            return res.status(200).json({ message : 'following' })
        }

    } catch (error: any) {
        console.log('error in the isFollowing function in the user Controller Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}

export const followUser = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { toFollowedId } = req.params

        if(!toFollowedId) throw new Error('toFollowedId is undefined')

        if(!user) throw new Error('user id undefined')

        const followUsertx = await prisma.$transaction(async (txprisma) => {
            const isFollowing = await txprisma.follow.findFirst({
                where: {
                    AND: [
                        { followingId: toFollowedId },
                        { followerId: user.id }
                    ]
                }
            })

            if(isFollowing) return { message: 'already following' }

            const follow = await txprisma.follow.create({
                data: {
                    followerId: user.id,
                    followingId: toFollowedId
                }
            }) 

            // NOTIFICATION!
            const notification = await prisma.notification.create({
                data: {
                    body: `${user.name} started following you!`, // statement
                    link: `/profile/${user.id}`, //profile of the user
                    notificationFor_Id: toFollowedId,
                    notificationFrom_Id: user.id
                },
                include: {
                    notificationFrom: {
                        select: {
                            id: true,
                            name: true,
                            profile: true
                        }
                    }
                }
            }) 

            // check if it exist // it will only exist if he's online
            // no need to send notification if he's not online
            const socketId = await getSocketId(toFollowedId)
            socketId && io.to(socketId).emit('notification', notification)
            
            return follow
        })

        
        if('message' in followUsertx) return res.status(300).json(followUsertx)

        return res.status(200).json(followUsertx)
    } catch (error: any) {
        console.log('error in the followUser function in the user Controller ' + error)
        return res.status(400).json({ error : error.message })
    }
} 

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { toUnfollowId } = req.params
        
        if(!user) throw new Error('user is undefined')

        if(!toUnfollowId) throw new Error('toUnfollowId is undefined')

        const unFollowUsertx = await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: user.id,
                    followingId: toUnfollowId
                }
            }
        })

        if(!unFollowUsertx) return res.status(400).json({ error : 'unfollow does not exist'})

        return res.status(200).json(unFollowUsertx)
    } catch (error: any) {
        console.log('error in the unFollowUser function in the user Controller ' + error)
        return res.status(400).json({ error : error.message })
    }
}

export const getProfile = async (req: Request, res: Response) => {
    try { 
        const { userId } = req.params

        if(!userId) throw new Error('userId is empty')

        const prismaGetProfile = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                userInfo: true, 
                Posts: true
            }
        })

        if(!prismaGetProfile) return res.status(300).json({ find: false })

        res.status(200).json({
            find: true,
            data: prismaGetProfile
        })
    } catch (error: any) {
        console.log('error in the getProfile function in the user controller ' + error)
        return res.status(400).json({ error : error.message })    
    }
}

export const getNotification = async (req: Request, res: Response) => {
    try {
        const user = req.user

        if(!user) throw new Error('user is undefined')

        const notifications = await prisma.notification.findMany({
            where: {
                notificationFor_Id: user.id,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 7,
            include: {
                notificationFrom: {
                    select: {
                        id: true,
                        name: true,
                        profile: true
                    }
                }
            }
        })

        return res.status(200).json(notifications)

    } catch (error: any) {
        console.log('error in the getNotification function in the user Controller ' + error)
        return res.status(400).json({ error : error.message })
    }
}

// SETTINGS

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        
        const user = req.user!

        const getuserInfo = await prisma.user.findFirst({
            where: {
                id: user.id
            },
            select: {
                name: true,
                username: true,
                profile: true,
                MultiFactor: true,
                userInfo: {
                    select: {
                        bio: true,
                        email: true
                    }
                }
            }
        })

        res.status(200).json(getuserInfo)
    } catch (error: any) {
        console.log('error in the getUserInfo function in the user Controller ' + error)
        res.status(400).json({ error: error.message})
    }
}

export const changeUserInfo = async (req: Request, res: Response) => {
    try {
        const { name, email, bio } = req.body
        const user = req.user!

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                name: name,
                userInfo: {
                    update: {
                        where: {
                            userId: user.id
                        },
                        data: {
                            email: email,
                            bio: bio
                        }
                    }
                }
            },
        })

        res.status(200).json({
            success: true,
            message: "changed is successfull"
        })

    } catch (error: any) {
        if(error instanceof Prisma.PrismaClientKnownRequestError) {
            // handling the unique constraint for email
            if(error.code === 'P2002') {
                return res.status(400).json({ 
                    success: false,
                    error : "email already exist"
                })
            }
        }

        console.log('error in the changeUserInfo function in the user Controller ' + error)
        res.status(400).json({ error : error.message })
    }
}

export const changeUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.body
        const user = req.user!

        if(!username) throw new Error('username is undefined')

        const changeUsername = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                username: username
            }
        })

        res.status(200).json({ 
            success: true,
            message: 'successfully change username' 
        })
    } catch (error: any) {
        if(error instanceof Prisma.PrismaClientKnownRequestError) {
            // for handling unique constraints
            if(error.code === 'P2002') {
                return res.status(400).json({ error: 'username already exist' })
            }
        }
        console.log('error in the changeUsername function in the user Controller ' + error)
        res.status(400).json({ error : error.mesasge })
    }
}

export const changeAvatar = async (req: Request, res: Response) => {
    try {
        const file = req.file
        const user = req.user!

        const getuser = await prisma.user.findFirst({
            where: {
                id: user.id
            },
            select: {
                profile: true
            }
        })

        if(getuser?.profile) {
            const fileName = getuser.profile.split('/')
            // reference file names from user 'http://localhost:4000/Avatar/e55001c5f2966dff568d_INOSUKE_PROFILE.jpg'
            removeFile('uploads/Avatars', fileName[fileName.length - 1]) // just getting the last in the split
        }

        const profileName = file ?  `http://localhost:4000/Avatar/${file.filename}` : ''

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                profile: profileName
            }
        })

        res.status(200).json({
            success: true,
            avatarUrl: profileName
        })
    } catch (error: any) {
        console.log('error in the changeAvatar function in the user Controller ' + error)
        res.status(400).json({ error: error.message })
    }
}

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { password, newPassword, confirmPassword } = req.body
        const user = req.user!

        if(newPassword !== confirmPassword) throw new Error('password is not the same')

        const changePasswordTransaction = await prisma.$transaction(async (txprisma) => {
            const getUser = await txprisma.user.findUnique({
                where: {
                    id: user.id
                },
                select: {
                    password: true
                }
            })

            if(!getUser) throw new Error('failed to find User')

            const verifyPassword = await bcrypt.compare(password, getUser.password)

            if(!verifyPassword) return { 
                success : false,  
                message: 'wrong password'
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALTROUNDS!)            
            const hashnewPassword = await bcrypt.hash(newPassword, saltRounds)

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: hashnewPassword
                }
            })

            return { 
                success: true,
                message: 'password changed'
            }
        })

        if(changePasswordTransaction.success === false) {
            throw new Error(changePasswordTransaction.message)
        }

        res.status(200).json(changePasswordTransaction)
    } catch (error: any) {
        console.log('error in the changePassword function in the user Controller ' + error)
        res.status(400).json({ error : error.message})
    }
}

export const enable2FA = async (req: Request, res: Response) => {
    try {
        const user = req.user!
        const { command } = req.body // this can be enable or disable
        
        if(command === 'enable') {
            const secret = crypto.randomBytes(18).toString('hex');
            
            const update2FA = await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    MultiFactor: true,
                    secret: secret
                },
                select: {
                    MultiFactor: true
                }
            })

            res.status(200).json({
                success: true,
                MultiFactor: update2FA.MultiFactor
            })
        } else if (command === 'disable') {
            const remove2FA = await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    MultiFactor: false
                },
                select: {
                    MultiFactor: true
                }
            })

            res.status(200).json({
                success: true,
                MultiFactor: remove2FA.MultiFactor
            })
        }
    } catch (error: any) {
        console.log('error in the enable2FA function in the user Controller ' + error)
        res.status(400).json({ error : error.message})
    }
}

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password } = req.body
        const user = req.user!

        const findUser = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                password: true
            }
        })

        if(!findUser) throw new Error('failed to find User')

        const verifyPassword = await bcrypt.compare(password, findUser.password)

        if(verifyPassword) {
            const deleteUser = await prisma.user.delete({
                where: {
                    id: user.id
                }
            })

            if(!deleteUser) throw new Error('failed to delete User')

            req.logout((err) => {
                if(err){
                    console.error('Failed to log out:', err); 
                    return next(err)
                }

                // Destroy the session
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Failed to destroy session:', err);
                        return res.status(400).json({ error: 'Failed to destroy session, please log out manually.' });
                    }

                    // Clear the session cookie and send a response
                    res.clearCookie('connect.sid').status(200).json({
                        success: true,
                        message: 'User deleted and session destroyed successfully.'
                    });
                });
            })
        } else {
            res.status(302).json({ error: 'wrong password'})
        }
    } catch (error: any) {
        console.log('error in the deleteAccount function in the userController' + error)
        res.status(400).json({ error : error.message})
    }
}

// make sure to have get all notification that is based on pagination