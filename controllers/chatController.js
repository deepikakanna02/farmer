const Chat = require('../models/Chat');

exports.createOrGetChat = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { otherUserId, adId } = req.body;
        if (!otherUserId) {
            return res.status(400).json({ success: false, message: 'otherUserId is required', data: null });
        }

        const myId = req.user._id;

        // Find existing chat between these two participants for this ad
        let chat = await Chat.findOne({
            participants: { $all: [myId, otherUserId] },
            adId: adId || { $exists: true }
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [myId, otherUserId],
                buyerId: req.user.role === 'buyer' ? myId : otherUserId,
                representativeId: req.user.role === 'representative' ? myId : null,
                adId: adId || null,
                messages: []
            });
        }

        return res.status(200).json({ success: true, message: 'Chat fetched successfully', data: chat });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getChat = async (req, res) => {
    try {
        if (!req.params.conversationId) {
            return res.status(400).json({ success: false, message: 'conversationId is required', data: null });
        }

        const chat = await Chat.findById(req.params.conversationId)
            .populate('participants', 'name role')
            .populate('buyerId', 'name')
            .populate('representativeId', 'name')
            .populate('messages.senderId', 'name role');

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found', data: null });
        }

        // Ensure only participants can view
        const isParticipant = chat.participants.some(
            (p) => p._id.toString() === req.user._id.toString()
        );
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Access denied', data: null });
        }

        return res.status(200).json({ success: true, message: 'Chat fetched successfully', data: chat });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.addMessage = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body is required', data: null });
        }

        const { conversationId, text } = req.body;
        if (!conversationId || !text) {
            return res.status(400).json({ success: false, message: 'conversationId and text are required', data: null });
        }

        const chat = await Chat.findById(conversationId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found', data: null });

        const isParticipant = chat.participants.some(
            (p) => p.toString() === req.user._id.toString()
        );
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Access denied', data: null });
        }

        const message = { senderId: req.user._id, text };
        chat.messages.push(message);
        chat.updatedAt = Date.now();
        await chat.save();

        // Emit via Socket.io if available
        const io = req.app.get('socketio');
        if (io) {
            io.to(conversationId).emit('receiveMessage', {
                senderId: req.user._id,
                text,
                timestamp: new Date()
            });
        }

        return res.status(201).json({ success: true, message: 'Message added successfully', data: message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

exports.getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'name role')
            .populate('adId', 'cropName')
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, message: 'Chats fetched successfully', data: chats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};
