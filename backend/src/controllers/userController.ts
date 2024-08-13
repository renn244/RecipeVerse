import { Request, Response } from 'express'
import { prisma } from '../db/db'
import { getSocketId, io } from '../socket/socket'

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

// make sure to have get all notification that is based on pagination