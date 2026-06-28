// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

// Initiate Payment
router.post('/create-order', protect, async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(500).json({ error: 'Razorpay is not configured' });
        }

        const { amount, currency = 'INR' } = req.body;

        const options = {
            amount: amount * 100, // Razorpay works with paise (1 INR = 100 paise)
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1, // Automatically capture payment
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        console.error('❌ Error creating order:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Verify Payment
router.post('/verify-payment', protect, (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ error: 'Razorpay is not configured' });
        }

        const { order_id, payment_id, signature } = req.body;

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${order_id}|${payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === signature) {
            return res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ error: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('❌ Payment verification error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
