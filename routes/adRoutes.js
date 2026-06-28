const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { createAd, getAds, getAdById, verifyAd } = require('../controllers/adController');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { files: 4 }
});

router.route('/')
    .post(protect, authorize('farmer'), upload.array('images', 4), createAd)
    .get(protect, getAds);

router.route('/:id')
    .get(protect, getAdById);

router.route('/:id/verify')
    .put(protect, authorize('representative'), verifyAd);

module.exports = router;
