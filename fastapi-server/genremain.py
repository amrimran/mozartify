import os
import numpy as np
import librosa
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Load the trained model with the absolute path
model = tf.keras.models.load_model("C:\\Users\\ADMIN\\OneDrive\\DEGREE\\FYP\\ANAND(TAG)\\genre\\Trained_model.h5")

# Define the genre classes
classes = ['blues', 'classical', 'country', 'disco', 'hiphop', 'jazz', 'metal', 'pop', 'reggae', 'rock']

# Initialize FastAPI app
app = FastAPI()

# Serve static files (for CSS and JavaScript)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define the audio processing function
def load_and_preprocess_data(audio_data: np.ndarray, sample_rate: int, target_shape=(128, 128)):
    data = []
    
    # Define chunk and overlap durations
    chunk_duration = 4  # seconds
    overlap_duration = 2  # seconds
    
    # Convert durations to samples
    chunk_samples = chunk_duration * sample_rate
    overlap_samples = overlap_duration * sample_rate
    
    # Calculate the number of chunks
    num_chunks = int(np.ceil((len(audio_data) - chunk_samples) / (chunk_samples - overlap_samples))) + 1
    
    # Process each chunk
    for i in range(num_chunks):
        start = i * (chunk_samples - overlap_samples)
        end = start + chunk_samples
        
        # Ensure chunk length does not exceed audio length
        if end > len(audio_data):
            end = len(audio_data)
            start = end - chunk_samples
        
        chunk = audio_data[start:end]
        
        # Compute the Mel spectrogram for the chunk
        mel_spectrogram = librosa.feature.melspectrogram(y=chunk, sr=sample_rate, n_mels=128)
        mel_spectrogram = librosa.power_to_db(mel_spectrogram, ref=np.max)  # Convert to decibel units
        mel_spectrogram = np.resize(mel_spectrogram, target_shape)  # Resize to target shape
        data.append(mel_spectrogram)
    
    data = np.array(data)
    data = data[..., np.newaxis]  # Add channel dimension
    return data

# Define the prediction function
def model_prediction(X_test: np.ndarray) -> str:
    y_pred = model.predict(X_test)
    avg_pred = np.mean(y_pred, axis=0)  # Average predictions across chunks
    top_index = np.argmax(avg_pred)  # Get index of the top genre
    return classes[top_index]

# Define FastAPI endpoint for genre prediction
class PredictionResponse(BaseModel):
    genre: str

@app.post("/predict-genre", response_model=PredictionResponse)
async def predict_genre(file: UploadFile = File(...)) -> PredictionResponse:
    # Load audio file
    try:
        audio_data, sample_rate = librosa.load(file.file, sr=None)
    except Exception as e:
        return {"error": str(e)}
    
    # Preprocess audio data
    X_test = load_and_preprocess_data(audio_data, sample_rate)

    # Get the top predicted genre
    predicted_genre = model_prediction(X_test)

    return PredictionResponse(genre=predicted_genre)

# HTML for the main page
@app.get("/", response_class=HTMLResponse)
async def main():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genre Predictor</title>
        <link rel="stylesheet" href="/static/styles.css">
    </head>
    <body>
        <div class="container">
            <h1>Music Genre Predictor</h1>
            <form action="/predict-genre" method="post" enctype="multipart/form-data">
                <input type="file" name="file" accept=".wav,.mp3" required>
                <button type="submit">Predict Genre</button>
            </form>
        </div>
    </body>
    </html>
    """

# Run the FastAPI application with Uvicorn
# Use the command:
# uvicorn your_script_name:app --reload