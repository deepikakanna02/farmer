const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createOffer, getOffersForAd, getMyOffers, respondToOffer } = require('../controllers/offerController');

router.post('/', protect, authorize('buyer'), createOffer);             // Buyer: make offer
router.get('/my', protect, getMyOffers);                                // Any: get my offers (role-aware)
router.get('/:adId', protect, getOffersForAd);                         // Get offers for a specific ad
router.put('/:id/respond', protect, authorize('farmer'), respondToOffer); // Farmer: accept/reject offer

module.exports = router;
