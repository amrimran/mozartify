import numpy as np
import librosa
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
import os

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_directory = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_directory, "model", "genre", "Trained_model.h5")
model = tf.keras.models.load_model(model_path)

classes = ['Blues', 'Classical', 'Country', 'Disco', 'Hiphop', 'Jazz', 'Metal', 'Pop', 'Reggae', 'Rock']

def load_and_preprocess_data(audio_data: np.ndarray, sample_rate: int, target_shape=(128, 128)):
    data = []
    
    # Normalize audio data
    audio_data = librosa.util.normalize(audio_data)
    
    chunk_duration = 4
    overlap_duration = 2
    chunk_samples = chunk_duration * sample_rate
    overlap_samples = overlap_duration * sample_rate
    
    num_chunks = int(np.ceil((len(audio_data) - chunk_samples) / (chunk_samples - overlap_samples))) + 1
    
    for i in range(num_chunks):
        start = i * (chunk_samples - overlap_samples)
        end = start + chunk_samples
        
        if end > len(audio_data):
            end = len(audio_data)
            start = end - chunk_samples
        
        chunk = audio_data[start:end]
        
        # Enhanced feature extraction
        mel_spectrogram = librosa.feature.melspectrogram(
            y=chunk, 
            sr=sample_rate,
            n_mels=128,
            fmax=8000,  # Limit maximum frequency
            n_fft=2048,
            hop_length=512
        )
        
        # Apply log-scaling and normalization
        mel_spectrogram = librosa.power_to_db(mel_spectrogram, ref=np.max)
        mel_spectrogram = (mel_spectrogram - mel_spectrogram.mean()) / (mel_spectrogram.std() + 1e-6)
        
        mel_spectrogram = np.resize(mel_spectrogram, target_shape)
        data.append(mel_spectrogram)
    
    data = np.array(data)
    data = data[..., np.newaxis]
    return data

def model_prediction(X_test: np.ndarray) -> list:
    # Apply temperature scaling to soften predictions
    temperature = 1.5
    
    y_pred = model.predict(X_test)
    
    # Apply softmax with temperature scaling
    scaled_predictions = []
    for pred in y_pred:
        # Apply temperature scaling
        scaled_logits = pred / temperature
        # Apply softmax
        exp_preds = np.exp(scaled_logits - np.max(scaled_logits))
        scaled_pred = exp_preds / exp_preds.sum()
        scaled_predictions.append(scaled_pred)
    
    # Average predictions across chunks
    avg_pred = np.mean(scaled_predictions, axis=0)
    
    # Get top 3 genres with adjusted probabilities
    top_indices = np.argsort(avg_pred)[-3:][::-1]
    top_genres = [(classes[i], float(avg_pred[i])) for i in top_indices]
    
    print("Top 3 Predicted Genres:")
    for genre, prob in top_genres:
        print(f"{genre}: {prob:.4f}")
    
    top_genre = top_genres[0][0]
    return top_genre, top_genres

class FileUrlRequest(BaseModel):
    fileUrl: str

class PredictionResponse(BaseModel):
    genre: str
    top_genres: list

@app.post("/predict-genre", response_model=PredictionResponse)
async def predict_genre(request: FileUrlRequest) -> PredictionResponse:
    if not request.fileUrl:
        raise HTTPException(status_code=400, detail="No file URL provided.")
    
    try:
        response = requests.get(request.fileUrl)
        response.raise_for_status()
        
        audio_file = BytesIO(response.content)
        audio_data, sample_rate = librosa.load(audio_file, sr=None)
        
        X_test = load_and_preprocess_data(audio_data, sample_rate)
        top_genre, top_genres = model_prediction(X_test)
        
        return PredictionResponse(genre=top_genre, top_genres=top_genres)

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")