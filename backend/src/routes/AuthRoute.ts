import { NextFunction, Router }  from 'express'
import { check, forgotPassword, resetPassword, logout, VerifyOtpCode, signup, ResendOtpCode } from '../controllers/authController';
import passport from 'passport';

const router = Router();

router.post('/login', (req, res, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
  
      if (err) {
        return res.status(400).json({ error: err });
      }
  
      if (info && info.message === 'otp_required') {
        return res.status(200).json({ 
            otpRequired: true, 
            userId: info.userId,
            email: info.email,
            message: 'OTP required. Please verify.'
        });
      }
  
      if (!user) {
        return res.status(400).json({ error: info?.message || 'Authentication failed' });
      }

      // login the user if the he does not use otp
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(400).json({ error: 'Failed to log in' });
        }
  
        return res.status(200).json({ message: 'Successfully logged in' });
      });
    })(req, res, next); // this is important for passport auth
});
  

router.post('/signup', signup)

// not tested
router.post('/forgotPassword', forgotPassword)

router.post('/resetPassword', resetPassword)

router.post('/verifyOtpCode', VerifyOtpCode)

router.post('/resendOtp', ResendOtpCode)

router.get('/logout', logout)

router.get('/check', check)

export default router