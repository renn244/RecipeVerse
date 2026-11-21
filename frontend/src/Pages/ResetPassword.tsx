import { FormEvent, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/PageComponents/LoadingSpinner"
import { API_URL } from '@/lib/api'

// opened from the link in the reset email: /reset-password?token=...
const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(password.length < 6) return toast.error('Password must be at least 6 characters')
    if(password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/resetPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if(data.error) throw new Error(data.error)
      setDone(true)
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
          <CardTitle className="text-4xl">Reset password</CardTitle>

          {!token ? (
            <CardContent className="px-0 pb-0">
              <p>This reset link is missing its token. Request a new one from the <Link className="underline" to="/forgot-password">forgot password</Link> page.</p>
            </CardContent>
          ) : done ? (
            <CardContent className="px-0 pb-0">
              <p>Your password has been updated. You can log in with it now.</p>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col gap-2 my-3 pb-0 px-0">
              <CardDescription>Choose a new password (at least 6 characters).</CardDescription>
              <Input id="new-password" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input id="confirm-password" type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </CardContent>
          )}

          <CardFooter className="flex flex-col gap-3 items-start">
            {token && !done && (
              <Button className="w-[300px]" disabled={loading} type="submit">
                {loading ? <div className="w-full flex justify-center"><LoadingSpinner className="h-7 w-7" /></div> : 'Update password'}
              </Button>
            )}
            <Link className="text-sm text-blue-700 underline-offset-4 hover:underline" to={'/login'}>{done ? 'Go to login' : 'Back to login'}</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ResetPassword
