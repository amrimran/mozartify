import React, { useState } from "react";
import axios from "axios";

const Predict = () => {
    const [file, setFile] = useState(null);
    const [genre, setGenre] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handlePredict = async () => {
        if (!file) {
            setError("Please upload a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:8000/predict-genre", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setGenre(response.data.genre);
            setError("");
        } catch (err) {
            setError("Error predicting genre. Try again.");
            console.error(err);
        }
    };

    return (
        <div className="predict-container">
            <h1>Music Genre Predictor</h1>
            <input type="file" onChange={handleFileChange} accept=".wav, .mp3" />
            <button onClick={handlePredict}>Predict Genre</button>
            {genre && <h2>Predicted Genre: {genre}</h2>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Predict;
