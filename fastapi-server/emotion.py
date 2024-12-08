import warnings
warnings.filterwarnings("ignore")

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import numpy as np
from tensorflow.keras.models import load_model
import librosa
from pydub import AudioSegment
import io
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Add both origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Load models once to avoid reloading them on every request
model_spec_path = "C:/Users/ADMIN/OneDrive/Documents/GitHub/mozartify/fastapi-server/model/emotion/Conv2D_spec_agumented.h5"
model_mfcc_path = "C:/Users/ADMIN/OneDrive/Documents/GitHub/mozartify/fastapi-server/model/emotion/Conv2D_mfcc_agumented.h5"
model_mel_path = "C:/Users/ADMIN/OneDrive/Documents/GitHub/mozartify/fastapi-server/model/emotion/Conv2D_mel_agumented.h5"

try:
    model_spec = load_model(model_spec_path)
    model_mfcc = load_model(model_mfcc_path)
    model_mel = load_model(model_mel_path)
    print("Models loaded successfully.")
except Exception as e:
    print("Error loading models:", e)
    raise

class FileUrlRequest(BaseModel):
    fileUrl: str

def audioPreprocessing(file_content):
    audio = AudioSegment.from_file(io.BytesIO(file_content), format="mp3")
    samples = np.array(audio.get_array_of_samples()).astype(np.float32) / 32768  # Normalize
    arr = librosa.core.resample(y=samples, orig_sr=audio.frame_rate, target_sr=11025)
    return arr

def moodString(f_pred):
    emotions = ["Angry", "Happy", "Relaxed", "Sad"]
    return emotions[f_pred] if f_pred < len(emotions) else "Unknown"

def feature2d(y, sr):
    stft = librosa.stft(y)
    stft_db = librosa.amplitude_to_db(abs(stft))
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mel = librosa.amplitude_to_db(librosa.feature.melspectrogram(y=y, sr=sr), ref=np.max)
    return stft_db, mfccs, mel

def majority_vote(preds):
    counts = np.bincount(preds)
    max_count = np.max(counts)
    top_classes = np.where(counts == max_count)[0]
    # Randomly select from the top classes in case of a tie
    return random.choice(top_classes)

def prediction2d(file_content):
    arr = audioPreprocessing(file_content)
    f_spec, f_mfcc, f_mel = feature2d(arr, 22050)

    # Resize features for model input
    f_spec_resized = np.resize(f_spec, (300, 300))
    f_mfcc_resized = np.resize(f_mfcc, (600, 120))
    f_mel_resized = np.resize(f_mel, (400, 300))

    # Reshape data for models
    f_spec_reshaped = f_spec_resized.reshape((1, 300, 300, 1))
    f_mfcc_reshaped = f_mfcc_resized.reshape((1, 120, 600, 1))
    f_mel_reshaped = f_mel_resized.reshape((1, 300, 400, 1))

    # Predictions from each model
    y_prob1 = model_spec.predict(f_spec_reshaped)
    y_prob2 = model_mfcc.predict(f_mfcc_reshaped)
    y_prob3 = model_mel.predict(f_mel_reshaped)

    print("Raw predictions from model_spec:", y_prob1)
    print("Raw predictions from model_mfcc:", y_prob2)
    print("Raw predictions from model_mel:", y_prob3)

    # Extract predicted classes
    y_pred1 = np.argmax(y_prob1, axis=-1)
    y_pred2 = np.argmax(y_prob2, axis=-1)
    y_pred3 = np.argmax(y_prob3, axis=-1)

    print("Predicted classes:", y_pred1, y_pred2, y_pred3)

    # Use majority vote function
    final_prediction = majority_vote([y_pred1[0], y_pred2[0], y_pred3[0]])
    return moodString(final_prediction)

@app.post("/predict-emotion")
async def predict_from_url(request: FileUrlRequest):
    try:
        fileUrl = request.fileUrl
        print("Received file URL for prediction:", fileUrl)
        
        # Download the file from Firebase using the provided URL
        response = requests.get(fileUrl)
        response.raise_for_status()  # Check if the download was successful

        # Process and predict from the downloaded content
        pred = prediction2d(response.content)
        return JSONResponse(content={
            "predicted_mood": pred
        })

    except requests.exceptions.RequestException as e:
        print("Error downloading file from Firebase:", e)
        raise HTTPException(status_code=500, detail="Error downloading file from Firebase")
    except Exception as e:
        print("Error during prediction:", e)
        raise HTTPException(status_code=500, detail="Error during prediction")
