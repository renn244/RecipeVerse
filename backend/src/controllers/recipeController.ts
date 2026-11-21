import { Request, Response } from 'express'
import { prisma } from '../db/db'
import { Prisma } from '@prisma/client'
import { attachRatings, parsePage } from '../utils/ratings'


type filterType = {
    search?: string,
    mealType?: string,
    cuisine?: string,
    mealPreference?: string,
    cost?: number
} & { page: number }

export const getRecipe = async (req: Request, res: Response) => {
    try {
        const { search, mealPreference, mealType, cuisine, cost, page }: filterType = req.body

        const take = 12
        const currentPage = parsePage(page)
        const skip = (currentPage - 1) * take

        // only filter on fields the user actually picked: `contains: ''` on a
        // nullable column excludes NULL rows, which hid recipes with empty dropdowns
        const recipeFilter: Prisma.RecipeWhereInput = { post: { status: 'post' } }
        if (search) recipeFilter.title = { contains: search, mode: 'insensitive' }
        if (mealPreference) recipeFilter.mealPreference = { contains: mealPreference, mode: 'insensitive' }
        if (mealType) recipeFilter.mealType = { contains: mealType, mode: 'insensitive' }
        if (cuisine) recipeFilter.cuisine = { contains: cuisine, mode: 'insensitive' }
        // cost slider = maximum budget; 0 means "any cost"
        if (Number(cost) > 0) recipeFilter.cost = { lte: Number(cost) }

        const where: Prisma.PostWhereInput = { recipe: recipeFilter }
        const [total, prismaRecipe] = await prisma.$transaction([
            prisma.post.count({ where }),
            prisma.post.findMany({
                where,
                take: take,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    recipe: true,
                }
            })
        ])

        return res.status(200).json({
            posts: await attachRatings(prismaRecipe),
            page: currentPage,
            totalPages: Math.max(1, Math.ceil(total / take))
        })
    } catch (error: any) {
        console.log('Error in the getRecipe function in recipeController Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}

export const getRecipeId = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        const user = req.user

        if(!user) throw new Error('not authenticated') 

        //get the data and also verifies if he is the owner
        const postRecipe = await prisma.post.findFirst({
            where: {
                AND: [
                    { id: postId },
                    { authorId: user.id }
                ]
            },
            select: {
                id: true,
                status: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        profile: true
                    }
                },
                views: true,
                likes: true,
                favorites: true,
                recipe: true,
                comments: true,
                createdAt: true,
            }
        }) 

        return res.status(200).json(postRecipe)
    } catch (error: any) {
        console.log('Error in the getRecipeId function in recipeController Error' + error)
        return res.status(400).json({ error : error.message })
    }
}

export const editRecipe = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params
        const filenames = req.files
        const recipe = req.body
        const user = req.user

        if(!user) throw new Error('not authenticated')
        if(!postId) throw new Error('no post id')

        // only the author may edit their recipe
        const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
        if(!post) throw new Error('recipe not found')
        if(post.authorId !== user.id) return res.status(403).json({ error: 'you can only edit your own recipes' })

        let images: string[] = [];
        if(Array.isArray(filenames)) {
            images = filenames.map((filename) => `${process.env.SERVER_URL || 'http://localhost:4000'}/recipePhoto/${filename.filename}`)
        }

        const editRecipe = await prisma.recipe.update({
            where: {
                postId: postId
            },
            data: {
                title: recipe.title,
                description: recipe.description,
                // keep the existing photos unless new ones were uploaded
                ...(images.length > 0 ? { image: images } : {}),
                cookingTime: parseInt(recipe.cookingTime) || 0,
                servings: parseInt(recipe.servings) || 0,
                cost: parseInt(recipe.cost) || 0,
                mealType: recipe.mealType || null,
                cuisine: recipe.cuisine || '',
                mealPreference: recipe.mealPreference || null,
                instruction: recipe.instruction || '',
                ingredients: recipe.ingredients || []
            }
        })

        if(!editRecipe) throw new Error('Failed to edit recipe')

        return res.status(200).json(editRecipe.id)
    } catch (error: any) {
        console.log('Error in the editRecipe function in recipeController Error' + error)
        return res.status(400).json({ error : error.message})
    }
}

export const createRecipe = async (req: Request, res: Response) => {
    try {
        const user: any = req.user
        const filenames = req.files
        const recipeData = req.body 

        if(!user) throw new Error('not authenticated')

        // clear message instead of a Prisma validation error when something required is empty
        const missing = [
            !recipeData.title && 'title',
            !recipeData.description && 'description',
            !recipeData.cuisine && 'cuisine',
            !(parseInt(recipeData.cookingTime) > 0) && 'cooking time',
            !(parseInt(recipeData.servings) > 0) && 'servings',
        ].filter(Boolean)
        if(missing.length) return res.status(400).json({ error: `please fill in ${missing.join(', ')}` })

        const createRecipe = await prisma.$transaction(async (txprisma) => {
            const createPost = await txprisma.post.create({
                data: {
                    status: 'post',
                    authorId: user.id,
                    views: 0,
                    likes: 0,
                }
            })

            const cost = parseInt(recipeData.cost) || 0
            let images: string[] = [];
            if(Array.isArray(filenames)) {
                images = filenames.map((filename) => `${process.env.SERVER_URL || 'http://localhost:4000'}/recipePhoto/${filename.filename}`)
            }

            await txprisma.recipe.create({
                data: {
                    postId: createPost.id,
                    title: recipeData.title,
                    image: images,
                    description: recipeData.description,
                    cookingTime: parseInt(recipeData.cookingTime),
                    servings: parseInt(recipeData.servings),
                    cost: cost,
                    mealType: recipeData.mealType || null,
                    cuisine: recipeData.cuisine || null,
                    mealPreference: recipeData.mealPreference || null,
                    instruction: recipeData.instruction || '',
                    ingredients: recipeData.ingredients || []
                }
            })

            return createPost.id
        })

        if(!createRecipe) throw new Error('failed to create post recipe')

        return res.status(200).json({
            postId: createRecipe
        })
    } catch (error: any) {
        console.log('Error in the createRecipe functionm in the recipeController Error: ' + error)
        return res.status(400).json({ error : error.message})
    }
}