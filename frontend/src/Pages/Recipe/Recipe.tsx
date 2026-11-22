import AuthorProfile from "@/PageComponents/Recipe/AuthorProfile"
import RecipeBody from "@/PageComponents/Recipe/RecipeBody"
import SideBar from "@/PageComponents/Recipe/SideBar"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { API_URL } from '@/lib/api'
import { useAuthContext } from "@/context/authContext"
import StarRating from "@/PageComponents/Recipe/StarRating"
import AuthorActions from "@/PageComponents/Recipe/AuthorActions"
import ReportButton from "@/PageComponents/Recipe/ReportButton"

const Recipe = () => {
    const { id } = useParams()
    const { user } = useAuthContext()

    const { data, isLoading } = useQuery({
        queryKey: ['Viewrecipe', id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/post/getPost/${id}`, {
                credentials: 'include'
            })
            return res.json()
        },
        refetchOnWindowFocus: false
    })

    if(isLoading) return

    if(data.error) window.location.assign('/explore')

    const isAuthor = !!user && user.id === data.author?.id

    return (
        <div className="min-h-screen">
            <div className="mx-auto p-4 flex gap-4 w-[1348px]">
                
                <SideBar 
                isFavorited={data.isFavorited}
                isLiked={!!data.isLiked}
                postId={data.id}
                likesCount={data.likes}
                commentsCount={data.comments.length}
                favoritesCount={data.favoriteCount}
                />

                <RecipeBody
                postId={data.id}
                createdAt={data.createdAt}
                recipe={data.recipe}
                author={data.author}
                comments={data.comments}
                headerExtra={
                    <>
                        <StarRating
                        postId={data.id}
                        averageRating={data.averageRating ?? 0}
                        ratingCount={data.ratingCount ?? 0}
                        myRating={data.myRating ?? 0}
                        isLoggedIn={!!user}
                        isAuthor={isAuthor} />
                        {isAuthor
                            ? <AuthorActions postId={data.id} title={data.recipe?.title} />
                            : <div className="ml-3 mt-1"><ReportButton postId={data.id} isLoggedIn={!!user} /></div>}
                    </>
                }
                />

                <AuthorProfile 
                postId={data.id}
                author={data.author}
                />

            </div>
        </div>
    )
}

export default Recipe