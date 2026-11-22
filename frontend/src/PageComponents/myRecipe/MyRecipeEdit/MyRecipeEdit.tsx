import { FormEvent, useEffect, useState } from 'react'
import MyRecipeForm, { recipeInfoType } from '../MyRecipeForm/MyRecipeCreate'
import EditRecipe from './EditRecipe.hook'
import LoadingSpinner from '@/PageComponents/LoadingSpinner'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'


const MyRecipeEdit = () => {
    const { postId } = useParams()
    const [recipeData, setRecipeData] = useState<recipeInfoType>()
    const [status, setStatus] = useState<string>('post')
    const navigate = useNavigate()

    if(!postId) return <Navigate to='/error' replace />

    const { saveEdit, getData } = EditRecipe()

    const callbackFunction = async (e: FormEvent<HTMLFormElement>, recipeData: recipeInfoType) => {
        e.preventDefault()
        const result = await saveEdit.SaveEdit(postId, recipeData)
        if(result && typeof result === 'object' && 'error' in result) return toast.error(result.error as string)

        toast.success('Recipe updated')
        navigate(status === 'post' ? `/recipe/${postId}` : '/myrecipe/draft')
    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await getData.getData(postId)

            if(!data || data.error) {
                toast.error('You can only edit your own recipes')
                return navigate('/myrecipe/dashboard')
            }

            setStatus(data.status ?? 'post')
            setRecipeData(data.recipe)
        }
        fetchData()
    }, [])

    if(getData.loading) return (
        <div className='h-full'>
            <LoadingSpinner className='h-9 w-9 mt-32' />
        </div>
    )

    return (
        <MyRecipeForm
        recipeData={recipeData}
        loading={saveEdit.loading}
        callbackFunction={callbackFunction} />
    )
}

export default MyRecipeEdit
