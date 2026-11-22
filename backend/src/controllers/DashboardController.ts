import { Request, Response } from 'express'
import { prisma } from '../db/db'
import { parsePage } from '../utils/ratings'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

// all tested and working
export const getPostStats = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if(!user) throw new Error('not authenticated')

        const getStat = await prisma.$transaction(async (txprisma) => {
            const currdate = new Date();
            // current month
            const startOfCurrentMonth = startOfMonth(currdate);
            const endOfCurrentMonth = endOfMonth(currdate);
            // previous month
            const startOfPreviousMonth = startOfMonth(subMonths(currdate, 1))
            const endOfPreviousMonth = endOfMonth(subMonths(currdate, 1))


            const getPostthisMonth = await txprisma.post.count({
                where: {
                    AND: [
                        {authorId: user.id},
                        {status: 'post'},
                        {createdAt: {
                            gte: startOfCurrentMonth,
                            lt: endOfCurrentMonth
                        }}
                    ]
                }
            })

            const getPostPreviousMonth = await txprisma.post.count({
                where: {
                    AND: [
                        {authorId: user.id},
                        {status: 'post'},
                        {createdAt: {
                            gte: startOfPreviousMonth,
                            lt: endOfPreviousMonth
                        }}
                    ]
                }
            })

            const viewsAndlikes = await txprisma.post.aggregate({
                where: {
                    authorId: user.id,
                },
                _sum: {
                    views: true,
                    likes: true
                }
            })
            
            return {
                monthPost: getPostthisMonth,
                previousMonth: getPostPreviousMonth,
                views: viewsAndlikes._sum.views,
                likes: viewsAndlikes._sum.likes
            }

        })    

        res.status(200).json(getStat)
    } catch (error: any) {
        console.log('Error in the getPostStats function in dashboard controller Error: ' + error)
        return res.status(400).json({ error: error.message })
    }
}

export const getAllPost = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const take = 10
        const currentPage = parsePage(req.body?.page ?? req.params.page)
        const skip = (currentPage - 1) * take

        if(!user) throw new Error('no authenticated')

        const total = await prisma.post.count({ where: { authorId: user.id } })
        const getPost = await prisma.post.findMany({
            where: {
                authorId: user.id
            },
            take: take,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                status: true,
                views: true,
                likes: true,
                favorites: true,
                _count: {
                    select: {
                        comments: true
                    }
                },
                recipe: {
                    select: {
                        title: true
                    }
                },
                createdAt: true
            }
        })
        
        return res.status(200).json({
            posts: getPost,
            page: currentPage,
            totalPages: Math.max(1, Math.ceil(total / take))
        })
    } catch (error: any) {
        console.log('Error in the getAllPost function in the dashboard Controller Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}

export const getDraft = async (req: Request, res: Response) => {
    try {
        const user = req.user

        if(!user?.id) throw new Error('user id does no exist')

        const getDrafts = await prisma.post.findMany({
            where: {
                authorId: user.id,
                status: 'draft'
            },
            take: 10,
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                recipe: {
                    select: {
                        title: true
                    }
                }
            }
        })

        return res.status(200).json(getDrafts)
    } catch (error: any) {
        console.log('Error in the getDraft function in the dashboardController Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}

export const searchDraft = async (req: Request, res: Response) => {
    try {
        const { search } = req.body

        // search for all the recipe titl but also require status of 'draft'
        const prismaSearch = await prisma.post.findMany({
            where: {
                AND: [
                { status: 'draft' },
                {
                    recipe: {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
                ]
            },
            take: 10,
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                recipe: {
                    select: {
                        title: true
                    }
                }
            }
        })

        return res.status(200).json(prismaSearch)
    } catch (error: any) {
        console.log('Error in the getDraft function in the dashboardController Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}

export const uploadDraft = async (req: Request, res: Response) => {
    try {
        const { postId } = req.body

        if(!postId) throw new Error('post Id is undefined')

        const draft = await prisma.post.findUnique({ where: { id: postId }, include: { recipe: true } })
        if(!draft || draft.authorId !== req.user?.id) return res.status(403).json({ error: 'you can only publish your own drafts' })
        const r = draft.recipe
        const missing = [
            !r?.title && 'title',
            !r?.description && 'description',
            !r?.cuisine && 'cuisine',
            !r?.cookingTime && 'cooking time',
            !r?.servings && 'servings',
        ].filter(Boolean)
        if(missing.length) return res.status(400).json({ error: `fill in ${missing.join(', ')} before publishing` })

        const updateStatus = await prisma.post.update({
            where: {
                id: postId
            }, 
            data: {
                status: 'post'
            },
            select: {
                id: true
            }
        })

        if(!updateStatus) throw new Error('failed to updateStatus of post')

        return res.status(200).json({ message : 'succesffully uploaded a draft'})
    } catch (error: any) {
        console.log('Error in the uploadDraft function in the dashboardController Error: ' + error)
        return res.status(400).json({ error : 'internal server error'})
    }
}

export const Delete = async (req: Request, res: Response) => {
    try {
        const { postId } = req.body

        if(!postId) throw new Error('post Id is undefined')

        const deletePost = await prisma.post.deleteMany({
            where: {
                id: postId,
                authorId: req.user?.id
            }
        })
        if(deletePost.count === 0) return res.status(403).json({ error: 'you can only delete your own posts' })

        res.status(200).json({ message : 'Successfully deleted a post'})
    } catch (error: any) {
        console.log('Error in the delete function in the dashboardController Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}

export const SaveDraft = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const filenames = req.files
        const recipeData = req.body

        if(!user) throw new Error('not authenticated')

        const createDraft = await prisma.$transaction(async (txprisma) => {
            const createPost = await txprisma.post.create({
                data: {
                    status: 'draft',
                    authorId: user.id,
                    views: 0,
                    likes: 0,
                }
            })

            const cost = recipeData.cost ? parseInt(recipeData.cost) : 0
            let images: string[] = [];
            if(Array.isArray(filenames)) {
                images = filenames.map((filename) => `${process.env.SERVER_URL || 'http://localhost:4000'}/recipePhoto/${filename.filename}`)
            }

            await txprisma.recipe.create({
                data: {
                    postId: createPost.id,
                    title: recipeData.title || 'Untitled draft',
                    image: images,
                    description: recipeData.description || '',
                    cookingTime: parseInt(recipeData.cookingTime) || 0,
                    servings: parseInt(recipeData.servings) || 0,
                    cost: cost || 0,
                    mealType: recipeData.mealType || null,
                    cuisine: recipeData.cuisine || '',
                    mealPreference: recipeData.mealPreference || null,
                    instruction: recipeData.instruction || '',
                    ingredients: recipeData.ingredients || []
                }
            })

            return createPost.id
        })

        if(!createDraft) throw new Error('failed to create post recipe')

        return res.status(200).json({
            postId: createDraft
        })
        
    } catch(error: any) {
        console.log('Error in the SaveDraft function in the DashboardController Error: ' + error)
        return res.status(400).json({ error : error.message })
    }
}