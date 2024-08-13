import { Router } from 'express' 
import { ensureAuthenticated } from '../utils/ensureAuthenticated'
import { followUser, getNotification, isFollowing, unfollowUser } from '../controllers/userController'

const router = Router()

router.get('/isFollowing/:userId', ensureAuthenticated, isFollowing)

router.post('/followUser/:toFollowedId', ensureAuthenticated, followUser)

router.post('/unfollowUser/:toUnfollowId', ensureAuthenticated, unfollowUser)

router.get('/getNotification', ensureAuthenticated, getNotification)

export default router