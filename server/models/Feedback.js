const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    attachment_url: { type: String, required: false },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    feedbackDate: { type: Date, default: Date.now },
    replyMessage: { type: String, default: null },
    replyDate: { type: Date, default: null }, 
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
