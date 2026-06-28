const Advertisement = require('../models/Advertisement');

exports.createAd = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { cropName, quantity, pricePerKg, harvestTime, village, district, state, description } = req.body;
        if (!cropName || !quantity || !pricePerKg || !harvestTime || !village || !district || !state || !description) {
            return res.status(400).json({
                success: false,
                message: 'cropName, quantity, pricePerKg, harvestTime, village, district, state and description are required',
                data: null
            });
        }

        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const ad = await Advertisement.create({
            cropName,
            quantity,
            pricePerKg,
            harvestTime,
            farmLocation: { village, district, state },
            description,
            images,
            farmerId: req.user._id
        });

        return res.status(201).json({ success: true, message: 'Advertisement created successfully', data: ad });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getAds = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'buyer') {
            filter.isVerified = true;
        } else if (req.user.role === 'farmer') {
            filter.farmerId = req.user._id;
        } 
        // Representative sees all ads

        const ads = await Advertisement.find(filter)
            .populate('farmerId', 'name email')
            .populate('verifiedBy', 'name email contactNumber');
            
        return res.status(200).json({ success: true, message: 'Advertisements fetched successfully', data: ads });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getAdById = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: 'Advertisement id is required', data: null });
        }

        const ad = await Advertisement.findById(req.params.id)
            .populate('farmerId', 'name')
            .populate('verifiedBy', 'name email contactNumber');

        if (!ad) {
            return res.status(404).json({ success: false, message: 'Advertisement not found', data: null });
        }

        return res.status(200).json({ success: true, message: 'Advertisement fetched successfully', data: ad });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.verifyAd = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: 'Advertisement id is required', data: null });
        }

        const ad = await Advertisement.findById(req.params.id);
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found', data: null });

        ad.isVerified = true;
        ad.verifiedBy = req.user._id;
        await ad.save();

        return res.status(200).json({ success: true, message: 'Advertisement verified successfully', data: ad });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};
