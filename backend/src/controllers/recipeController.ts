import { Request, Response } from 'express'
import { prisma } from '../db/db'
import { Prisma } from '@prisma/client'


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
        const skip = (page - 1) * take
        // do later cost
        // put later how much page is available

        // only filter on fields the user actually picked: `contains: ''` on a
        // nullable column excludes NULL rows, which hid recipes with empty dropdowns
        const recipeFilter: Prisma.RecipeWhereInput = { post: { status: 'post' } }
        if (search) recipeFilter.title = { contains: search, mode: 'insensitive' }
        if (mealPreference) recipeFilter.mealPreference = { contains: mealPreference, mode: 'insensitive' }
        if (mealType) recipeFilter.mealType = { contains: mealType, mode: 'insensitive' }
        if (cuisine) recipeFilter.cuisine = { contains: cuisine, mode: 'insensitive' }

        const prismaRecipe = await prisma.post.findMany({
            where: {
                recipe: recipeFilter
            },
            take: take,
            skip: skip,
            include: {
                recipe: true,
            }
        })

        

        return res.status(200).json(prismaRecipe)
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
                image: images,
                cookingTime: parseInt(recipe.cookingTime),
                servings: parseInt(recipe.servings),
                mealType: recipe.mealType || null,
                cuisine: recipe.cuisine || null,
                mealPreference: recipe.mealPreference || null,
                instruction: recipe.instruction,
                ingredients: recipe.ingredients
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

        const createRecipe = await prisma.$transaction(async (txprisma) => {
            const createPost = await txprisma.post.create({
                data: {
                    status: 'post',
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
                    title: recipeData.title,
                    image: images,
                    description: recipeData.description,
                    cookingTime: parseInt(recipeData.cookingTime),
                    servings: parseInt(recipeData.servings),
                    cost: cost,
                    mealType: recipeData.mealType || null,
                    cuisine: recipeData.cuisine || null,
                    mealPreference: recipeData.mealPreference || null,
                    instruction: recipeData.instruction,
                    ingredients: recipeData.ingredients
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