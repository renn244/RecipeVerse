import { Router } from 'express' 
import { ensureAuthenticated } from '../utils/ensureAuthenticated'
import { changeAvatar, changePassword, changeUserInfo, changeUsername, deleteAccount, enable2FA, followUser, 
getNotification, getUserInfo, isFollowing, Notification, unfollowUser } from '../controllers/userController'
import multer from 'multer'
import diskStorage from '../utils/multerStorage'

const router = Router()

router.get('/isFollowing/:userId', ensureAuthenticated, isFollowing)

router.post('/followUser/:toFollowedId', ensureAuthenticated, followUser)

router.post('/unfollowUser/:toUnfollowId', ensureAuthenticated, unfollowUser)

router.get('/getNotification', ensureAuthenticated, getNotification)

router.get('/Notification/:type', ensureAuthenticated, Notification)

//SETTINGS

//GET

router.get('/getUserInfo', ensureAuthenticated, getUserInfo)

//CHANGE
router.post('/changeUserInfo', ensureAuthenticated, changeUserInfo)

router.post('/changeusername', ensureAuthenticated, changeUsername)

const uploads = multer({ storage: diskStorage('uploads/Avatars')})
router.post('/changeAvatar', ensureAuthenticated, uploads.single('avatar'), changeAvatar)

router.post('/changePassword', ensureAuthenticated, changePassword)

router.post('/enable2FA', ensureAuthenticated, enable2FA)

router.post('/deleteAccount', ensureAuthenticated, deleteAccount)

export default router