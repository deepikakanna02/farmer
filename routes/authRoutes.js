const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);       // POST /api/auth/forgot-password
router.post('/reset-password/:token', resetPassword);  // POST /api/auth/reset-password/:token

module.exports = router;
