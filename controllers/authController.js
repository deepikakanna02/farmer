const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { name, email, password, role, contactNumber } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'name, email, password and role are required', data: null });
        }

        if (!['farmer', 'buyer', 'representative'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role', data: null });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists', data: null });
        }

        const user = await User.create({ name, email, password, role, contactNumber });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.login = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'email and password are required', data: null });
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role)
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid email or password', data: null });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required', data: null });
        }

        const user = await User.findOne({ email });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a reset link has been sent.',
                data: null
            });
        }

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Store hashed token + expiry (1 hour) on user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        // Send email (raw token goes in the URL, not the hashed one)
        await sendPasswordResetEmail(user.email, user.name, token);

        return res.status(200).json({
            success: true,
            message: 'If that email exists, a reset link has been sent.',
            data: null
        });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and new password are required', data: null });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters', data: null });
        }

        // Hash the incoming token to compare with the stored hashed version
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired', data: null });
        }

        // Update password and clear reset fields
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in.',
            data: null
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};
