import { Router } from 'express'
import { createRecipe, editRecipe, getRecipe, getRecipeId } from '../controllers/recipeController'
import { ensureAuthenticated } from '../utils/ensureAuthenticated'
import multer from 'multer'
import diskStorage from '../utils/multerStorage'
import { getAllPost } from '../controllers/DashboardContoller'

const router = Router()
// all tested
router.post('/getAllPost/:page', ensureAuthenticated, getAllPost)

router.post('/getRecipe', getRecipe) // endpoint for explore

router.get('/getRecipe/:postId', ensureAuthenticated, getRecipeId)

const uploads = multer({ storage: diskStorage('uploads/RecipePhotos')})

router.post('/edit/:postId', ensureAuthenticated, uploads.array('image', 5), editRecipe)

router.post('/create', ensureAuthenticated, uploads.array('image', 5), createRecipe)

export default router