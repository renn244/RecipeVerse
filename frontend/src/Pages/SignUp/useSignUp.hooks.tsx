import { useState } from "react"
import { SignUpInfoType } from "./SignUp"
import { API_URL } from '@/lib/api'

const useSignUp = () => {
  const [loading, setLoading] = useState<boolean>(false)

  const signup = async (signUpInfo: SignUpInfoType) => {
    if(!signUpInfo.username || !signUpInfo.password) return
    setLoading(true)
    try {
      const res: Response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(signUpInfo),
        credentials: 'include'
      })

      const data = await res.json()

      if(data.error) throw new Error(data.error)
      
      window.location.assign('/login')
    } catch (error: any) {
      console.log(`Error in the useSignUp hook Error: ${error.message}`)
      // put toast here that says the error
    } finally {
      setLoading(false)
    }
  }

  return { loading, signup }
}

export default useSignUp