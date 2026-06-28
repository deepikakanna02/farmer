const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    cropName: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    harvestTime: { type: Date, required: true },
    farmLocation: {
        village: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, required: true }
    },
    description: { type: String, required: true },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Advertisement', adSchema);
