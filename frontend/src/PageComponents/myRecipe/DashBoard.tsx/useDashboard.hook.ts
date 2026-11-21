import { useEffect, useState } from "react"
import { PostDataType } from "./Dashboard"
import { API_URL } from '@/lib/api'


const useDashboard = () => {
    const [post, setPost] = useState<PostDataType []>([])
    const [page, setPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)

    const getpostDashboard = async (pageToLoad: number = page) => {
        try {
            const res: Response = await fetch(`${API_URL}/api/dashboard/getPostDashboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page: pageToLoad }),
                credentials: 'include'
            })

            const data = await res.json()

            if(data.error) throw new Error(data.error)

            // deleting the last post on a page: step back a page
            if(data.posts.length === 0 && pageToLoad > 1) return getpostDashboard(pageToLoad - 1)

            setPost(data.posts)
            setPage(data.page)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getpostDashboard(1)
    }, [])

    return { post, page, totalPages, getpostDashboard }
}

export default useDashboard
