const Offer = require('../models/Offer');
const Advertisement = require('../models/Advertisement');

exports.createOffer = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { adId, offerPrice } = req.body;
        if (!adId || offerPrice === undefined || offerPrice === null) {
            return res.status(400).json({ success: false, message: 'adId and offerPrice are required', data: null });
        }

        if (req.user.role !== 'buyer') {
            return res.status(403).json({ success: false, message: 'Only buyers can make offers', data: null });
        }

        const offer = await Offer.create({
            adId,
            buyerId: req.user._id,
            offerPrice
        });

        return res.status(201).json({ success: true, message: 'Offer created successfully', data: offer });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getOffersForAd = async (req, res) => {
    try {
        if (!req.params.adId) {
            return res.status(400).json({ success: false, message: 'adId is required', data: null });
        }

        const offers = await Offer.find({ adId: req.params.adId })
            .populate('buyerId', 'name email contactNumber');

        return res.status(200).json({ success: true, message: 'Offers fetched successfully', data: offers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getMyOffers = async (req, res) => {
    try {
        // For buyers: offers they made. For farmers: offers on their ads.
        let offers = [];
        if (req.user.role === 'buyer') {
            offers = await Offer.find({ buyerId: req.user._id })
                .populate('adId', 'cropName pricePerKg farmLocation');
        } else if (req.user.role === 'farmer') {
            const myAds = await Advertisement.find({ farmerId: req.user._id }).select('_id');
            const adIds = myAds.map((a) => a._id);
            offers = await Offer.find({ adId: { $in: adIds } })
                .populate('adId', 'cropName pricePerKg')
                .populate('buyerId', 'name email contactNumber');
        }

        return res.status(200).json({ success: true, message: 'Offers fetched successfully', data: offers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.respondToOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accept' or 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: "action must be 'accept' or 'reject'", data: null });
        }

        const offer = await Offer.findById(id).populate('adId');
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found', data: null });
        }

        // Only the farmer who owns the ad can respond
        if (req.user.role !== 'farmer' || offer.adId.farmerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the farmer who owns this ad can respond to offers', data: null });
        }

        offer.status = action === 'accept' ? 'accepted' : 'rejected';
        await offer.save();

        return res.status(200).json({ success: true, message: `Offer ${offer.status}`, data: offer });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};
