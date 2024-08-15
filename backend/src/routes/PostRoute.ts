import { Router } from 'express'
import { ensureAuthenticated, optionalAuthenticated } from '../utils/ensureAuthenticated'
import { addFavorites, comment, deleteChildComment, deleteComment, getPostId, likeChildComment, likeComment, likePost, replyChildComment, replyComment, reportPost } from '../controllers/postController'

const router = Router()

router.get('/getPost/:postId', optionalAuthenticated, getPostId)// increase view when being visit

router.post('/report/:postId', ensureAuthenticated, reportPost)

router.post('/likePost/:postId', ensureAuthenticated, likePost)

router.post('/addFavorites/:postId', ensureAuthenticated, addFavorites) // update both the favorite user and author

//Parent comment
router.post('/comment/:postId', ensureAuthenticated, comment)

router.post('/likeComment/:commentId', ensureAuthenticated, likeComment)

router.post('/deleteComment/:commentId', ensureAuthenticated, deleteComment)

router.post('/replyComment/:commentId', ensureAuthenticated, replyComment)
// childComment

router.post('/replyChildComment/:commentId', ensureAuthenticated, replyChildComment)

router.post('/likeChildComment/:commentId', ensureAuthenticated, likeChildComment)

router.post('/deleteChildComment/:commentId', ensureAuthenticated, deleteChildComment)

export default router