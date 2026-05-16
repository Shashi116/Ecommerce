const express = require('express');
const { registerUser, verifyOtp, loginUser, getUsers, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/users', protect, admin, getUsers);

module.exports = router;
