import { Request, Response } from 'express'
import { prisma } from '../db/db'
import { getSocketId, io } from '../socket/socket'

export const getPostId = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        const user = req.user

        if(!postId) throw new Error('postId empty')
        
        //get the post info
        const post = await prisma.post.findFirst({
            where: {
                AND: [
                    {id: postId},
                    {status: 'post'}
                ]
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profile: true,
                        createAt: true,
                        userInfo: true,
                    }
                },
                recipe: true,
                comments: {
                    take: 10,
                    include: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            profile: true,
                            createAt: true  
                          }
                        },
                        childComments: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profile: true,
                                        createAt: true
                                    }
                                }
                            },
                            take: 5
                        }
                    }
                }
            }
        })

        if(!post)  return res.status(400).json({ error : 'cannot find post' })

        // get post Count of the author
        const postCount = await prisma.post.count({
            where: {
                authorId: post.author.id,
                status: 'post'
            }
        })
        // get following Count of the author
        const followingCount = await prisma.follow.count({
            where: {
                followerId: post.authorId // users the author is following
            }
        })

        // get follower Count of the author
        const followerCount = await prisma.follow.count({
            where: {
                followingId: post.authorId // users that followed author
            }
        })

        // count the how many favorites this post
        const favoriteCount = await prisma.favorites.count({
            where: {
                postId: post.id   
            }
        })

        // see if user is favorited this but return false if userInfo does not exist
        const isFavorited = user?.userInfo ? await prisma.favorites.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: post.id
                }
            }
        }) : false
        
        // has the current user liked this post?
        const isLiked = user ? !!(await prisma.postLike.findUnique({
            where: { userId_postId: { userId: user.id, postId: post.id } }
        })) : false

        const updateFavoriteCount = {
            ...post,
            favoriteCount,
            isFavorited: isFavorited ? true : false,
            isLiked
        }

        //add the post count to the author object
        const authorWithPostCount = {
            ...post.author,
            postCount,
            followerCount,
            followingCount
        }

        // count a view once per browser session, and never for the author
        const viewed = req.session.viewedPosts ?? []
        if(post.authorId !== user?.id && !viewed.includes(postId)) {
            req.session.viewedPosts = [...viewed, postId]
            await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    views: {
                        increment: 1
                    }
                }
            })
        }

        res.status(200).json({
            ...updateFavoriteCount,
            author: authorWithPostCount,
            
        })
    } catch (error: any) {
        console.log('error in the getPostId function in the postController Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}

// not tested yet
export const reportPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        
        if(!postId) throw new Error('postId empty')

        // do report later
    } catch (error: any) {
        console.log('error in the reportPost function in the postController Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}

// tested
// toggles the like: one like per user, clicking again unlikes
export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        const user = req.user

        if(!user) throw new Error('user is undefined')

        if(!postId) throw new Error('postId empty')

        const existing = await prisma.postLike.findUnique({
            where: { userId_postId: { userId: user.id, postId } }
        })

        if(existing) {
            const [, updatePost] = await prisma.$transaction([
                prisma.postLike.delete({ where: { id: existing.id } }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likes: { decrement: 1 } },
                    select: { likes: true }
                })
            ])

            return res.status(200).json({
                success: true,
                isLiked: false,
                message: 'post unliked',
                likesCount: updatePost.likes
            })
        }

        const [, updatePost] = await prisma.$transaction([
            prisma.postLike.create({ data: { userId: user.id, postId } }),
            prisma.post.update({
                where: { id: postId },
                data: { likes: { increment: 1 } },
                select: { likes: true, authorId: true }
            })
        ])

        // NOTIFICATION! (not for liking your own recipe)
        if(updatePost.authorId !== user.id) {
            const notification = await prisma.notification.create({
                data: {
                    body: `${user.name} liked your recipe post!`, // statement
                    link: `/recipe/${postId}`, //profile of the user
                    notificationFor_Id: updatePost.authorId,
                    notificationFrom_Id: user.id,
                    type: 'Posts'
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
            const socketId = await getSocketId(updatePost.authorId)
            socketId && io.to(socketId).emit('notification', notification)
        }

        return res.status(200).json({
            success: true,
            isLiked: true,
            message : 'post liked',
            likesCount: updatePost.likes
        })
    } catch (error: any) {
        console.log('error in the likePost function in the postController Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}

export const addFavorites = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        const user = req.user
        
        if(!postId) throw new Error('postId empty')
        if(!user || !user.userInfo) throw new Error('user is undefined')

        const isFavorite = await prisma.favorites.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: postId
                }
            }
        })

        let favoriteCount = await prisma.favorites.count({
            where: {
                postId: postId
            }
        }) 

        if(isFavorite) {
            //remove favorite
            await prisma.favorites.delete({
                where: {
                    userId_postId: {
                        userId: user.id,
                        postId: postId
                    }
                }
            })

            return res.status(200).json({
                isFavorited: false,
                favoriteCount: favoriteCount - 1
            })
        } else {
            // add favorite
            await prisma.favorites.create({
                data: {
                    userId: user.id,
                    postId: postId
                }
            })

            return res.status(200).json({
                isFavorited: true,
                favoriteCount: favoriteCount + 1
            })
        }
    } catch (error: any) {
        console.log('error in the addFavorites in the postController Error: ' + error)
        return res.status(200).json({ error : error.message })
    }
}

//Also handle child comment in reply delete and also like

//Comments
export const comment = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        const { comment } = req.body
        const user = req.user

        if(!postId) throw new Error('postId is empty')

        if(!user) throw new Error('user is undefined')

        if(!comment) throw new Error('No Comment')

        const createComment = await prisma.comment.create({
            data: {
                userId: user.id,
                postId: postId,
                body: comment,
            },
            include: {
                user: true
            }
        })

        const getAuthor = await prisma.post.findFirst({
            where: {
                id: postId,
            },
            select: {
                author: true
            }
        })
        
        // NOTIFICATION!
        if(getAuthor?.author.id) {
            
            const notif = await prisma.notification.create({
                data: {
                    body: `${user.name} left a comment in your post. click to view!`, // statement
                    link: `/recipe/${postId}`, //profile of the user
                    notificationFor_Id: getAuthor?.author.id,
                    notificationFrom_Id: user.id,
                    type: 'Comments'
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
            const socketId = await getSocketId(getAuthor?.author.id)
            socketId && io.to(socketId).emit('notification', notif)
        }



        if(!createComment) throw new Error('failed to create comment')

        return res.status(200).json(createComment)
    } catch (error: any) {
        console.log('error in the comment function in the postController Error: ' + error)
        return res.status(200).json({ error : error.message})
    }
}

export const likeComment = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { commentId } = req.params

        if(!user) throw new Error('user is undefined')
        if(!commentId) throw new Error('commentId is undefined')

        const updateLikeComment = await prisma.comment.update({
            where: {
                id: commentId
            },
            data: {
                likes: {
                    increment: 1
                }
            },
            select: {
                likes: true
            }
        })

        if(!updateLikeComment?.likes) return res.status(300).json({
            sucess: false,
        })

        return res.status(200).json({
            success: true,
            commentId: commentId
        })
    } catch (error: any) {
        console.log('error in the likeComment function in the postController' + error)
        return res.status(200).json({ error : error.message })
    }
}
// not tested
export const replyComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const user = req.user
        const { comment } = req.body

        if(!comment) throw new Error('comment is required')

        if(!commentId) throw new Error('commentId is empty')
        
        if(!user) throw new Error('user is undefined')

        const createReplyComment = await prisma.childComment.create({
            data: {
                userId: user.id,
                commentId: commentId,
                body: comment
            },
            select: {
                id: true,
                commentId: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile: true,
                        createAt: true
                    }
                },
                body: true,
                likes: true,
                createdAt: true
            }
        })

        // NOTIFICATION!
        const notification =  await prisma.$transaction(async (txprisma) => {
            const commentAuthor = await txprisma.comment.findFirst({
                where: {
                    id: commentId
                },
                select: {
                    userId: true,
                    postId: true
                }
            })
            // if the author comment on it's own then no nned for notification
            if(user.id === commentAuthor?.userId) return 

            if(!commentAuthor) return 
            
            const notif = await txprisma.notification.create({
                data: {
                    body: `${user.name} replied to your comment!`, // statement
                    link: `/recipe/${commentAuthor.postId}`, //profile of the user
                    notificationFor_Id: commentAuthor?.userId,
                    notificationFrom_Id: user.id,
                    type: 'Comments'
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
            const socketId = await getSocketId(commentAuthor.userId)
            socketId && io.to(socketId).emit('notification', notif)
            
            return 
        })

        if(!createReplyComment) throw new Error('failed to comment!')
        
        return res.status(200).json(createReplyComment)
    } catch (error: any) {
        console.log('error in the deleteComment function in the postController Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const user = req.user

        if(!user) throw new Error('user is undefined')

        if(!commentId) throw new Error('commentId is undefined')

        const verifyOwner = await prisma.comment.findFirst({
            where: {
                AND: [
                    { userId: user.id },
                    { id: commentId }
                ]
            },
            select: {
                id: true
            }
        })

        if(!verifyOwner) throw new Error('failed to find comment or not authorized')

        const deletecomment = await prisma.comment.delete({
            where: {
                id: verifyOwner.id 
            }
        })

        return res.status(200).json({
            success: true,
            message : 'comment deleted'
        })
    } catch (error: any) {
        console.log('error in the deleteComment function in the postController Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}   

// Child Comments
export const replyChildComment = async(req: Request, res: Response) => {
    try {
        const user = req.user!
        const { commentId } = req.params // this is parent commentId
        const { comment } = req.body
        
        const replyTocomment = await prisma.childComment.create({
            data: {
                userId: user.id,
                commentId: commentId,
                body: comment
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile: true,
                        createAt: true
                    }
                }
            }
        })

        if(!replyTocomment) throw new Error('failed to reply')

        res.status(200).json(replyTocomment)
    } catch (error: any) {
        console.log(`error in the replyChildComment function in the post Controller ${error}`)
        res.status(400).json({ error : error.message})
    }
}

export const likeChildComment = async (req: Request, res: Response) => {
    try {
        const user = req.user!
        const { commentId } = req.params
    
        const likeAChildComment = await prisma.childComment.update({
            where: {
                id: commentId
            },
            data: {
                likes: {
                    increment: 1
                }
            }
        })
    
        // implement notification here

        return res.status(200).json({
            success: true,
            commentId: commentId
        })
    } catch (error: any) {
        console.log('error in the likeChildComment function in the post Controller ' + error)
        res.status(400).json({ error : error.message })
    }
}

export const deleteChildComment = async (req: Request, res: Response) => {
    try {
        const user = req.user!
        const { commentId } = req.params

        const findChildComment = await prisma.childComment.findFirst({
            where: {
                id: commentId
            },
            select: {
                userId: true
            }
        })

        const verifyOwner = user.id === findChildComment?.userId
        
        if(!verifyOwner) throw new Error('not authorized!')

        const deleteChildComment = await prisma.childComment.delete({
            where: {
                id: commentId
            }
        })

        res.status(200).json({
            deleted: true
        })
    } catch (error: any) {
        console.log('error in the deleteChildComment function in the post Controller ' + error)
        res.status(400).json({ error: error.message })
    }
}