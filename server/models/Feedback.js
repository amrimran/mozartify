const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    attachment: { type: Buffer, required: false },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);


module.exports = Feedback;
