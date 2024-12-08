import numpy as np
import librosa
import torch
import openunmix
import torchaudio
import tensorflow as tf
from skimage.transform import resize
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ProcessPoolExecutor
import functools
from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
import asyncio
import tempfile
import warnings
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce TensorFlow logging
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning)

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Timeout Middleware
# class TimeoutMiddleware(BaseHTTPMiddleware):
#     async def dispatch(self, request: Request, call_next):
#         try:
#             response = await asyncio.wait_for(call_next(request), timeout=60.0)  # 30 seconds timeout
#             return response
#         except asyncio.TimeoutError:
#             raise HTTPException(status_code=504, detail="Request timeout")

# app.add_middleware(TimeoutMiddleware)

# When loading the model, add compilation
@functools.lru_cache(maxsize=1)
def load_model(model_path):
    model = tf.keras.models.load_model(model_path)
    model.compile()  # Add this line to resolve the compilation warning
    return model

# Load the pre-trained model
model = load_model("C:/Users/ADMIN/OneDrive/Documents/GitHub/mozartify/fastapi-server/model/instrument/Trained_model.h5")

# Define instrument classes
classes = [
    'Accordion', 'Acoustic Guitar', 'Banjo', 'Bass Guitar', 'Clarinet', 'Cowbell', 'Cymbals',
    'Dobro', 'Drum Set', 'Electric Guitar', 'Floor Tom', 'Flute', 'Harmonica', 'Harmonium',
    'Hi Hats', 'Horn', 'Keyboard', 'Mandolin', 'Organ', 'Piano', 'Saxophone', 'Shakers',
    'Tambourine', 'Trombone', 'Trumpet', 'Ukulele', 'Vibraphone', 'Violin'
]

# Chunk Processing Function
def process_chunk(chunk_data, sample_rate, target_shape):
    mel_spectrogram = librosa.feature.melspectrogram(y=chunk_data, sr=sample_rate)
    mel_spectrogram = librosa.power_to_db(mel_spectrogram, ref=np.max)
    mel_spectrogram = resize(np.expand_dims(mel_spectrogram, axis=-1), target_shape)
    return mel_spectrogram

def load_and_preprocess_data_parallel(audio_data, sample_rate, target_shape=(128, 128), max_chunks=5):
    print("Preprocessing audio data...")
    chunk_duration = 4  # seconds
    overlap_duration = 2  # seconds

    chunk_samples = chunk_duration * sample_rate
    overlap_samples = overlap_duration * sample_rate

    num_chunks = min(int(np.ceil((len(audio_data) - chunk_samples) / (chunk_samples - overlap_samples))) + 1, max_chunks)

    chunks = []
    with ProcessPoolExecutor() as executor:
        chunk_futures = []
        for i in range(num_chunks):
            start = i * (chunk_samples - overlap_samples)
            end = start + chunk_samples

            if end > len(audio_data):
                end = len(audio_data)
                start = end - chunk_samples

            chunk_data = audio_data[start:end]
            chunk_futures.append(executor.submit(process_chunk, chunk_data, sample_rate, target_shape))

        chunks = [future.result() for future in chunk_futures]

    print(f"Extracted {len(chunks)} chunks with shape {chunks[0].shape}")
    return np.array(chunks)

def separate_audio(audio_content: BytesIO, max_duration=60):
    print("Starting audio separation...")
    separator = openunmix.umxl()

    try:
        # Load only a portion of the audio to reduce processing time
        audio, sample_rate = torchaudio.load(audio_content)
        
        # Trim audio to max_duration if necessary
        if audio.shape[1] > max_duration * sample_rate:
            audio = audio[:, :int(max_duration * sample_rate)]
        
        print(f"Audio loaded with shape {audio.shape} and sample rate {sample_rate}")
    except Exception as e:
        print(f"Error loading audio file: {e}")
        return None

    if audio.dim() == 1:
        audio = audio.unsqueeze(0).unsqueeze(0)
    elif audio.dim() == 2:
        audio = audio.unsqueeze(0)

    with torch.no_grad():
        estimates = separator(audio)
    print("Separation complete.")

    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
            torchaudio.save(tmpfile.name, estimates[0, 1], sample_rate)
            print(f"Accompaniment saved to {tmpfile.name}")
            return tmpfile.name
    except Exception as e:
        print(f"Error saving accompaniment to file: {e}")
        return None

def model_prediction(chunks):
    print(f"Input shape to model: {chunks.shape}")
    y_pred = model.predict(chunks)
    return y_pred

# Request and Response Models
class FileUrlRequest(BaseModel):
    fileUrl: str

class PredictionResponse(BaseModel):
    top_instruments: str

# Function to list top instruments based on predictions
def list_top_instruments(y_pred, classes, top_n=6):
    mean_probabilities = np.mean(y_pred, axis=0)
    
    instrument_probabilities = [(classes[i], mean_probabilities[i]) for i in range(len(classes))]
    sorted_instruments = sorted(instrument_probabilities, key=lambda x: x[1], reverse=True)
    
    print("Top instruments with probabilities:", sorted_instruments[:top_n])

    top_instruments = [instrument for instrument, _ in sorted_instruments[:top_n]]
    top_instruments = ", ".join(top_instruments)
    
    return top_instruments

@app.post("/predict-instrument", response_model=PredictionResponse)
async def process_audio_from_url(request: FileUrlRequest):
    print("Received file URL:", request.fileUrl)
    if not request.fileUrl:
        raise HTTPException(status_code=400, detail="No file URL provided.")
    
    try:
        # Download the file from Firebase URL
        response = requests.get(request.fileUrl)
        response.raise_for_status()

        # Use BytesIO to simulate a file-like object for librosa
        audio_file = BytesIO(response.content)
        
        # Process the audio
        print("Processing audio file...")
        accompaniment_file = separate_audio(audio_file)

        if accompaniment_file is not None:
            # Preprocess the audio content
            audio_data, sample_rate = librosa.load(accompaniment_file, sr=None)
            print(f"Audio loaded with shape {audio_data.shape} and sample rate {sample_rate}")

            # Process the accompaniment audio to get features and predictions
            chunks = load_and_preprocess_data_parallel(audio_data, sample_rate)
            y_pred = model_prediction(chunks)
            top_instruments = list_top_instruments(y_pred, classes)
            print("Top instruments:", top_instruments)
            return PredictionResponse(top_instruments=top_instruments)
        else:
            raise HTTPException(status_code=500, detail="Audio separation failed")
    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# For running the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)