import { prisma } from '../db/db'

type PostWithRecipe = { id: string, recipe: Record<string, any> | null }

export const attachRatings = async <T extends PostWithRecipe>(posts: T[]): Promise<T[]> => {
    if(posts.length === 0) return posts

    const grouped = await prisma.rating.groupBy({
        by: ['postId'],
        where: { postId: { in: posts.map((p) => p.id) } },
        _avg: { value: true },
        _count: { value: true },
    })
    const byPost = new Map(grouped.map((g) => [g.postId, g]))

    return posts.map((post) => {
        const g = byPost.get(post.id)
        return {
            ...post,
            recipe: post.recipe && {
                ...post.recipe,
                rating: g?._avg.value ? Math.round(g._avg.value * 10) / 10 : 0,
                ratingCount: g?._count.value ?? 0,
            },
        }
    })
}

export const parsePage = (value: unknown) => Math.max(1, parseInt(String(value)) || 1)
