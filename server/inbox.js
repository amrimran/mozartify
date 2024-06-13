const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Feedback = require('./models/Feedback'); // Import the Feedback model

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mozartify', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


// Routes
app.post('/api/feedback', upload.single('attachment'), async (req, res) => {
    console.log("Received Data:", req.body); // Log received data
    console.log("Received File:", req.file); // Log received file if any
    
    const { username, title, detail } = req.body;
    const attachment = req.file ? req.file.buffer : null; // Store the attachment as a buffer
    
    const feedback = new Feedback({ username, title, detail, attachment });
    try {
        const savedFeedback = await feedback.save();
        res.status(201).json(savedFeedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

  

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
