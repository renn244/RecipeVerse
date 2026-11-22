import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { API_URL } from '@/lib/api'

type ResendCodeProps = {
    userId: string
}

const ResendCode = ({
    userId
} : ResendCodeProps) => {

    const { mutate: resendOtp, isPending } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/api/auth/resendOtp`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    userId: userId
                })
            })
            const data = await res.json()
            if(data.error) throw new Error(data.error)
            return data
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            if(data.success === true) {
                toast.success(data.message)
            }   
        },
    })

    return (
        <div>
            <h2>
                Didn't receive a code? {" "}
                <span 
                onClick={() => !isPending && resendOtp()}
                className="text-blue-600 underline-offset-2 hover:underline cursor-pointer">
                    Resend
                </span>
            </h2>
        </div>
    )
}

export default ResendCode