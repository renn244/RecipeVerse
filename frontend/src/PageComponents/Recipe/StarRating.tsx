import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { StarIcon } from "lucide-react"
import toast from "react-hot-toast"
import { API_URL } from '@/lib/api'
import { useredirect } from "@/lib/redirect"
import { cn } from "@/lib/utils"

type StarRatingProps = {
    postId: string,
    averageRating: number,
    ratingCount: number,
    myRating: number,
    isLoggedIn: boolean,
    isAuthor: boolean,
}

const StarRating = ({ postId, averageRating, ratingCount, myRating, isLoggedIn, isAuthor }: StarRatingProps) => {
    const [hovered, setHovered] = useState(0)
    const queryClient = useQueryClient()
    const { NavigateWithNext } = useredirect()

    const { mutate: rate, isPending } = useMutation({
        mutationKey: ['rate', postId],
        mutationFn: async (value: number) => {
            const res = await fetch(`${API_URL}/api/post/rate/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
                credentials: 'include'
            })
            const data = await res.json()
            if(data.error) throw new Error(data.error)
            return data
        },
        onSuccess: (data) => {
            toast.success(data.message)
            queryClient.setQueryData(['Viewrecipe', postId], (old: any) => ({
                ...old,
                myRating: data.myRating,
                averageRating: data.averageRating,
                ratingCount: data.ratingCount
            }))
        },
        onError: (error) => toast.error(error.message)
    })

    const canRate = isLoggedIn && !isAuthor
    const shown = hovered || myRating || Math.round(averageRating)

    const handleClick = (value: number) => {
        if(!isLoggedIn) return NavigateWithNext('/login')
        if(isAuthor) return
        rate(value)
    }

    return (
        <div aria-label="rating" className="flex items-center gap-3 ml-5 mt-3">
            <div className="flex" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                    key={value}
                    type="button"
                    aria-label={`rate ${value} star${value > 1 ? 's' : ''}`}
                    disabled={isPending || isAuthor}
                    onMouseEnter={() => canRate && setHovered(value)}
                    onClick={() => handleClick(value)}
                    className={cn("p-0.5", canRate ? "cursor-pointer" : "cursor-default")}>
                        <StarIcon className={cn("size-6 transition-colors",
                            value <= shown ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                    </button>
                ))}
            </div>
            <p className="text-sm text-muted-foreground">
                {ratingCount ? `${averageRating} average · ${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'}` : 'No ratings yet'}
                {myRating ? ` · your rating: ${myRating}` : ''}
                {isAuthor ? '' : !myRating && canRate ? ' · tap a star to rate' : ''}
            </p>
        </div>
    )
}

export default StarRating
