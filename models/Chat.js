const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    representativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' },
    messages: [messageSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
