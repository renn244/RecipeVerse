import { Router } from 'express' 
import { ensureAuthenticated } from '../utils/ensureAuthenticated'
import { changePassword, deleteAccount, followUser, getNotification, getUserInfo, isFollowing, unfollowUser } from '../controllers/userController'

const router = Router()

router.get('/isFollowing/:userId', ensureAuthenticated, isFollowing)

router.post('/followUser/:toFollowedId', ensureAuthenticated, followUser)

router.post('/unfollowUser/:toUnfollowId', ensureAuthenticated, unfollowUser)

router.get('/getNotification', ensureAuthenticated, getNotification)

//SETTINGS

//GET

router.get('/getUserInfo', ensureAuthenticated, getUserInfo)


//CHANGE
router.post('/changeUserInfo', ensureAuthenticated,)

router.post('/changeusername', ensureAuthenticated)

// put multer here later for forms
router.post('/changeAvatar', ensureAuthenticated,)

router.post('/changePassword', ensureAuthenticated, changePassword)

router.post('/enable2FA', ensureAuthenticated)

router.post('/deleteAccount', ensureAuthenticated, deleteAccount)

export default router