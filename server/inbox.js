const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Feedback = require('./models/Feedback');

const app = express();  
app.use(cors());
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


mongoose.connect('mongodb://localhost:27017/mozartify');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


app.post('/api/feedback', upload.single('attachment'), async (req, res) => {
    const { username, title, detail, user_id } = req.body;
    const attachment = req.file ? req.file.buffer : null;

    const feedback = new Feedback({ username, title, detail, attachment, user_id });
    try {
        const savedFeedback = await feedback.save();
        res.status(201).json(savedFeedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.get('/api/feedback', async (req, res) => {
  const { userId } = req.query;

  try {
    let feedbacks;
    if (userId) {
      feedbacks= await Feedback.find({ user_id: userId });
    } else {
      feedbacks = await Feedback.find();
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
