import { Router }  from 'express'
import { check, forgotPassword, logout, signup } from '../controllers/authController.';
import passport from 'passport';

const router = Router();

router.post('/login',
    passport.authenticate('local', { 
        failureRedirect: process.env.CLIENT_BASE_URL + '/login',
        failureMessage: true 
    }),
    function(req, res) {
        console.log('succesfully login user: ' + req.user)
        res.status(200).json({ message : 'successfully login'})
    }) // put controllers later

router.post('/signup', signup)

// not tested
router.post('/forgotPassword', forgotPassword)

router.get('/logout', logout)

router.get('/check', check)

export default router