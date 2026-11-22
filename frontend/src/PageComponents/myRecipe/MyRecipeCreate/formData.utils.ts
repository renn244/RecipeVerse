import type { recipeInfoType } from '../MyRecipeForm/MyRecipeCreate'

const formData = (recipe: recipeInfoType) => {
    const formData = new FormData()

    formData.append('title', recipe.title ?? '')
    formData.append('description', recipe.description ?? '')
    formData.append('cookingTime', recipe.cookingTime ?? '')
    formData.append('servings', String(recipe.servings ?? ''))
    formData.append('cost', String(recipe.cost ?? ''))
    if (recipe.mealType) formData.append('mealType', recipe.mealType)
    if (recipe.cuisine) formData.append('cuisine', recipe.cuisine)
    if (recipe.mealPreference) formData.append('mealPreference', recipe.mealPreference)
    formData.append('instruction', recipe.instruction ?? '')

    // Append each image in the array
    if (recipe.image) {
        recipe.image.forEach((img) => {
            formData.append(`image`, img)
        })
    }

    // Append each ingredient in the array
    (recipe.ingredients ?? []).forEach((ingredient, index) => {
        formData.append(`ingredients[${index}]`, ingredient)
    })

    return formData
}

export default formData