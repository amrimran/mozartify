from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import librosa
import joblib
import requests
from io import BytesIO
import sklearn

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic model to parse the incoming request body
class GenderPredictionRequest(BaseModel):
    file_url: str

# Define the response model for gender prediction
class GenderPredictionResult(BaseModel):
    gender: str  # Only return gender (male or female)

@app.post("/predict-gender/", response_model=GenderPredictionResult)
async def predict_gender(request: GenderPredictionRequest, chunk_duration: int = 30, overlap_duration: int = 2):
    file_url = request.file_url  # Get file_url from the request
    print(f"Received file URL: {file_url}")

    # Download and process the audio file
    try:
        print(f"Attempting to download file from {file_url}")
        response = requests.get(file_url)
        response.raise_for_status()  # Check if the file is accessible
        
        # Create a BytesIO object from the downloaded content (in-memory processing)
        audio_bytes = BytesIO(response.content)
        print("File downloaded successfully.")

        # Load audio file with librosa
        print("Loading audio file with librosa...")
        y, sr = librosa.load(audio_bytes, sr=None)  # Load directly from in-memory file
        print(f"Audio file loaded. Sample rate: {sr}, Number of samples: {len(y)}")

    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch the file: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch the file: {e}")
    except Exception as e:
        print(f"Error downloading or loading audio file: {e}")
        raise HTTPException(status_code=500, detail=f"Error downloading or loading audio file: {e}")

    # Load the gender classifier model
    model_path = r"C:\Users\ADMIN\OneDrive\Documents\GitHub\mozartify\fastapi-server\model\gender\gender_classifier.pkl"
    try:
        print(f"Loading gender classifier model from {model_path}...")
        model = joblib.load(model_path)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading the gender classifier model: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading the gender classifier model: {e}")

    # Perform gender prediction
    predictions = []
    step_size = chunk_duration - overlap_duration
    print(f"Processing audio in chunks (duration: {chunk_duration}s, overlap: {overlap_duration}s)...")

    for start in range(0, len(y), step_size * sr):
        end = start + chunk_duration * sr
        chunk = y[start:end]

        if len(chunk) == 0:
            continue
        
        # Extract MFCCs and perform gender prediction
        print(f"Processing chunk from sample {start} to {end}...")
        mfccs = librosa.feature.mfcc(y=chunk, sr=sr, n_mfcc=128)
        mfccs_mean = np.mean(mfccs.T, axis=0)
        mfccs_mean = mfccs_mean.reshape(1, -1)
        gender_prediction = model.predict(mfccs_mean)
        prediction = "female" if gender_prediction == 1 else "male"
        predictions.append(prediction)
        print(f"Predicted gender for this chunk: {prediction}")

    # Determine majority gender prediction
    male_count = predictions.count("male")
    female_count = predictions.count("female")
    print(f"Male predictions: {male_count}, Female predictions: {female_count}")

    # Based on the majority, return only one gender
    gender = "Male" if male_count > female_count else "Female"
    print(f"Final predicted gender: {gender}")

    return {"gender": gender}
