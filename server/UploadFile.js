import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from 'axios';
import { storage } from './firebaseConfig'; // Import Firebase storage from firebaseConfig.js

function UploadFile() {
  const [file, setFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState("");
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload and prediction request
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    try {
      // Reference to the Firebase Storage location
      const fileRef = ref(storage, `uploads/${file.name}`);
      
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, file);
      console.log("File uploaded to Firebase Storage");

      // Get the download URL from Firebase Storage
      const fileUrl = await getDownloadURL(fileRef);
      console.log("Firebase File URL:", fileUrl);

      // Send the URL to the Express server for prediction
      const response = await axios.post("http://localhost:3003/predictFromURL", { fileUrl });
      console.log("Prediction response:", response.data);

      setPredictionResult(response.data.predicted_mood || "Prediction successful!");
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to upload and predict. Please try again.");
      setPredictionResult("");
    }
  };

  return (
    <div>
      <h1>Upload File for Prediction</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Predict</button>

      {predictionResult && <p>Prediction Result: {predictionResult}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default UploadFile;
    