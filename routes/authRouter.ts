import express from 'express';
import passport from 'passport';

import * as auth from '../controllers/authController';

const router = express.Router();


router.post('/login', auth.loginUser);
router.post('/register', auth.registerUser);
router.post('/logout', auth.logoutUser);

// router.post('/forgot-password');
// router.post('/change-password');




export default router;