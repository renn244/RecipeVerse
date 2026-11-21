import { Router } from 'express'
import { ensureAuthenticated } from '../utils/ensureAuthenticated'
import { Delete, getAllPost, getDraft, getPostStats, SaveDraft, searchDraft, uploadDraft } from '../controllers/DashboardController'
import multer from 'multer'
import diskStorage from '../utils/multerStorage'

// tested but no photo acceptance yet
const router = Router()

router.get('/getPostStats', ensureAuthenticated, getPostStats)

router.post('/getPostDashboard', ensureAuthenticated, getAllPost)

router.get('/getDraft', ensureAuthenticated, getDraft)

router.post('/search',ensureAuthenticated, searchDraft)

router.post('/upload',ensureAuthenticated, uploadDraft)

router.post('/delete',ensureAuthenticated, Delete)

const uploads = multer({ storage: diskStorage('uploads/RecipePhotos') })
router.post('/saveDraft', ensureAuthenticated, uploads.array('image', 6), SaveDraft)

export default router