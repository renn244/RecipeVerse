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
        if(result && 'error' in result) return toast.error(result.error)

        toast.success('Recipe updated')
        // published recipes go back to their page; drafts go back to the drafts list
        navigate(status === 'post' ? `/recipe/${postId}` : '/myrecipe/draft')
    }

    useEffect(() => {
        const fetchData = async () => {
            // the API only returns the recipe to its author
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
