const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    attachment: { type: Buffer, required: false }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);


module.exports = Feedback;
