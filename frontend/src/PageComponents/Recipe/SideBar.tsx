import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useredirect } from "@/lib/redirect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BookmarkIcon, HeartIcon, MessageSquareIcon } from "lucide-react"
import toast from "react-hot-toast"
import { API_URL } from '@/lib/api'
  
type SidebarProps = {
    postId: string,
    likesCount: number,
    isLiked: boolean,
    isFavorited: boolean,
    favoritesCount: number,
    commentsCount: number,
}

const SideBar = ({
    postId,
    likesCount,
    isLiked,
    isFavorited,
    favoritesCount,
    commentsCount
} : SidebarProps) => {

    const queryClient = useQueryClient();
    const { NavigateWithNext } = useredirect()

    const { mutate: LikePost, isPending: LikePostPending } = useMutation({
        mutationKey: ['like', postId],
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/api/post/likePost/${postId}`, {
                method: 'POST', 
                credentials: 'include'
            })
            const data = await res.json() 
            if(data.auth === false) return NavigateWithNext('/login')
            if(data.error) throw new Error(data?.error)
            toast.success(data.message)
            return data
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data, _variable, _context) => {
            if(!data) return // this means that i just return for navigate
            queryClient.setQueryData(['Viewrecipe', postId], (oldData: any) => {
                return {
                    ...oldData,
                    likes: data.likesCount,
                    isLiked: data.isLiked
                }
            })
        }
    })
    
    const { data: isFavorite, mutate: FavoritePost, isPending} = useMutation({
        mutationKey: ['Viewrecipe', postId],
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/api/post/addFavorites/${postId}`, {
                method: 'POST',
                credentials: 'include'
            })
            const data = await res.json()
            if(data.auth === false) return NavigateWithNext('/login')
            if(data.error) throw new Error(data.error)
            return data
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data, _variable, _context) => {
            if(!data) return // this means that i just return for navigate
            queryClient.setQueryData(['Viewrecipe', postId], (oldData: any) => {
                return {
                    ...oldData,
                    favoriteCount: data.favoriteCount,
                    isFavorited: data.isFavorited
                }
            })
        }
    })

    return (
        <aside className='w-[64px] min-h-screen'>
            <nav className="flex flex-col gap-4 w-[64px] sticky top-[114px]">
                <TooltipProvider>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full h-full">
                                <button
                                disabled={LikePostPending}
                                onClick={() => LikePost()}
                                className="w-full flex flex-col items-center px-[6px] py-[1px]">
                                    <div className="p-2">
                                        <HeartIcon className={`size-[24px] hover:text-red-500 ${isLiked && 'fill-red-500 text-red-500'} transition-all`} />
                                    </div>
                                    <p>{likesCount}</p>
                                </button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>{isLiked ? 'Unlike' : 'Add Like'}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full h-full">
                                <a href="#comments" className="w-full flex flex-col items-center px-[6px] py-[1px]">
                                    <div className="p-2">
                                        <MessageSquareIcon className="size-[24px]" />
                                    </div>
                                    <p>{commentsCount}</p>
                                </a>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Jump to<br/> Comments</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full h-full">
                                <button 
                                disabled={isPending}
                                onClick={() => FavoritePost()}
                                className="w-full flex flex-col items-center px-[6px] py-[1px]">
                                    <div className="p-2">

                                        <BookmarkIcon 
                                        className={`size-[24px] hover:text-violet-700 
                                        ${isFavorite?.isFavorited ? "fill-violet-700 text-violet-700" : isFavorited && 'fill-violet-700 text-violet-700'}`} />
                                        {/* isFavorite is coming from fetch there fore the most updated */}
                                    </div>
                                    <p>{favoritesCount && favoritesCount}</p>
                                </button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Save</p>
                        </TooltipContent>
                    </Tooltip>

                </TooltipProvider>
            </nav>
        </aside>
    )
}

export default SideBar