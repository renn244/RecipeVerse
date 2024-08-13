import { Router } from 'express'
import { ensureAuthenticated, optionalAuthenticated } from '../utils/ensureAuthenticated'
import { addFavorites, comment, deleteComment, getPostId, likeComment, likePost, replyComment, reportPost } from '../controllers/postController'

const router = Router()

router.get('/getPost/:postId', optionalAuthenticated, getPostId)// increase view when being visit

router.post('/report/:postId', ensureAuthenticated, reportPost)

router.post('/likePost/:postId', ensureAuthenticated, likePost)

router.post('/addFavorites/:postId', ensureAuthenticated, addFavorites) // update both the favorite user and author

router.post('/comment/:postId', ensureAuthenticated, comment)

router.post('/likeComment/:commentId', ensureAuthenticated, likeComment)

router.post('/replyComment/:commentId', ensureAuthenticated, replyComment)

router.post('/deleteComment/:commentId', ensureAuthenticated, deleteComment)


export default router