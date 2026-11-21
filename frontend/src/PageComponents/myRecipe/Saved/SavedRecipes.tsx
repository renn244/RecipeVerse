import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import RecipeCollection from "@/PageComponents/explore/RecipeCollection"
import PaginationNav from "@/PageComponents/explore/Pagination"
import { API_URL } from '@/lib/api'

// recipes you bookmarked with the Save button on a recipe page
const SavedRecipes = () => {
    const [page, setPage] = useState(1)

    const { data, isLoading } = useQuery({
        queryKey: ['savedRecipes', page],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/user/favorites?page=${page}`, { credentials: 'include' })
            return res.json()
        },
    })

    return (
        <div>
            <h1 className="ml-12 mb-5 font-bold text-5xl">Saved</h1>
            {!isLoading && data?.posts?.length === 0 ? (
                <p className="ml-12 text-muted-foreground">
                    No saved recipes yet. Tap the bookmark on any recipe to save it here. <Link className="underline" to="/explore">Explore recipes</Link>
                </p>
            ) : (
                <RecipeCollection
                className="grid-cols-3 h-auto"
                loading={isLoading}
                recipeCollection={data?.posts ?? []} />
            )}
            <div className="mt-7">
                <PaginationNav page={data?.page ?? page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
            </div>
        </div>
    )
}

export default SavedRecipes
