import { FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/PageComponents/LoadingSpinner"
import { API_URL } from '@/lib/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!email) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if(data.error) throw new Error(data.error)
      setSent(true)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[863px] w-full overflow-hidden flex justify-center items-center">
      <Card className="shadow-md dark:shadow-slate-800">
        <form onSubmit={onSubmit} className="p-5 px-7 flex flex-col gap-4 w-[400px]">
          <CardTitle className="text-4xl">Forgot password</CardTitle>

          {sent ? (
            <CardContent className="px-0 pb-0">
              <p>If an account uses <span className="font-medium">{email}</span>, we've sent it a link to reset the password. The link expires in 1 hour.</p>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col gap-2 my-3 pb-0 px-0">
              <CardDescription>Enter the email on your account and we'll send you a reset link.</CardDescription>
              <Input
              name="email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
            </CardContent>
          )}

          <CardFooter className="flex flex-col gap-3 items-start">
            {!sent && (
              <Button className="w-[300px]" disabled={loading} type="submit">
                {loading ? <div className="w-full flex justify-center"><LoadingSpinner className="h-7 w-7" /></div> : 'Send reset link'}
              </Button>
            )}
            <Link className="text-sm text-blue-700 underline-offset-4 hover:underline" to={'/login'}>Back to login</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ForgotPassword
