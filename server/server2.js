const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// CORS setup to allow multiple origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware setup
app.use(express.json());

// Endpoint to handle prediction request based on Firebase URL
app.post('/predictFromURL', async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    console.error("No file URL provided");
    return res.status(400).send("No file URL provided.");
  }

  try {
    console.log("Sending Firebase file URL to FastAPI server:", fileUrl);
    const response = await axios.post('http://127.0.0.1:5173/predictFromURL', { fileUrl: fileUrl });
    res.json(response.data);
  } catch (error) {
    console.error("Error while sending to FastAPI:", error.message);
    console.error("Error details:", error.response ? error.response.data : error);
    res.status(500).send("Error while predicting mood");
  }
});



// Start the Express server
app.listen(3003, () => {
  console.log('Express server is running on http://localhost:3003');
});
