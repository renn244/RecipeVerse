import { useState } from 'react'
import { LoginInfoType } from './Login'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API_URL } from '@/lib/api'


const useLogin = () => {
  const [loading, setLoading] = useState<boolean>(false)
  let [searchParams] = useSearchParams()
  const next: string = searchParams.get('next') || ''

  const login = async (loginInfo: LoginInfoType) => {
    if(!loginInfo.username || !loginInfo.password) return
    setLoading(true)
    try {
      const res: Response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(loginInfo),
        credentials: 'include'
      })

      const data = await res.json()
      if(data.error) throw new Error(data.error)
      
      if(data.otpRequired === true) {
        // when the user use otp
        const params = new URLSearchParams({ next: next || "/explore", id: data.userId, email: data.email })
        return window.location.assign(`/otp?${params.toString()}`)
      }

      // if there was next redirect then if not then just redirect to default which is /explore
      if(next) {
        return window.location.assign(`${next}`)  
      } else {
        return window.location.assign('/explore')
      }

    } catch (error: any) {
        console.log('Error in the useLogin hook Error: ' + error)
        toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return { loading, login }
}

export default useLogin