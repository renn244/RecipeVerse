import type { recipeInfoType } from '../MyRecipeForm/MyRecipeCreate'
import { useState } from 'react'
import formData from './formData.utils'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '@/lib/api'
import toast from 'react-hot-toast'

const useCreateRecipe = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const create = async (recipeData: recipeInfoType) => {
    setLoading(true)
    try {
      //make form Data for photo handling
      const formdata = formData(recipeData)

      const res: Response = await fetch(`${API_URL}/api/recipe/create`, {
        method: 'POST',
        body: formdata,
        credentials: 'include'
      })

      const data = await res.json()

      if(data.error) throw new Error(data.error)

      navigate('/myrecipe/dashboard')
    } catch (error: any) {
      console.log('Error in createfunction in the useCreateRecipe hook' + 'Error: ' + error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async (recipeData: recipeInfoType) => {
    try {
      const formdata = formData(recipeData)

      const res: Response = await fetch(`${API_URL}/api/dashboard/saveDraft`, {
        method: 'POST',
        body: formdata,
        credentials: 'include'
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      navigate('/myrecipe/draft')
    } catch (error: any) {
      console.log('Error in createfunction in the useCreateRecipe hook Error: ' + error.message)
      toast.error(error.message)
    }
  }

  return { loading, create, saveDraft } 
}

export default useCreateRecipe