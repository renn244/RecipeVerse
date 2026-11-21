import { useEffect, useState } from "react"
import { PostDataType } from "./Dashboard"
import { API_URL } from '@/lib/api'


const useDashboard = () => {
    const [post, setPost] = useState<PostDataType []>([])
    
    const getpostDashboard = async () => {
        try {
            // apply pagination later
            const res: Response = await fetch(`${API_URL}/api/dashboard/getPostDashboard`, {
                method: 'POST',
                credentials: 'include'
            })

            const data = await res.json()

            if(data.error) throw new Error(data.error)

            setPost(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getpostDashboard()
    }, [])

    return { post, getpostDashboard }
}

export default useDashboard