import numpy as np
import librosa
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests  # For downloading the file from the URL
from io import BytesIO  # For converting the raw content into a file-like object
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load the trained model with the absolute path
model = tf.keras.models.load_model("C:\\Users\\ADMIN\\OneDrive\\Documents\\GitHub\\mozartify\\fastapi-server\\model\\genre\\Trained_model.h5")

# Define the genre classes
classes = ['Blues', 'Classical', 'Country', 'Disco', 'Hiphop', 'Jazz', 'Metal', 'Pop', 'Reggae', 'Rock']

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
    print(f"First probabilities: {avg_pred}")
    np.random.shuffle(avg_pred)
    print(f"Prediction probabilities: {avg_pred}")


    top_index = np.argmax(avg_pred)  # Get index of the top genre
    return classes[top_index]

# Define request model for genre prediction (expects fileUrl in JSON format)
class FileUrlRequest(BaseModel):
    fileUrl: str  # Expecting fileUrl in the request body

class PredictionResponse(BaseModel):
    genre: str

@app.post("/predict-genre", response_model=PredictionResponse)
async def predict_genre(request: FileUrlRequest) -> PredictionResponse:
    """Receive file URL from Firebase, download the file, and predict its genre."""
    
    if not request.fileUrl:
        raise HTTPException(status_code=400, detail="No file URL provided.")
    
    try:
        # Download the file from Firebase URL
        response = requests.get(request.fileUrl)
        response.raise_for_status()  # Ensure the request was successful
        
        # Use BytesIO to simulate a file-like object for librosa
        audio_file = BytesIO(response.content)
        
        # Load audio data using librosa from the in-memory file object
        audio_data, sample_rate = librosa.load(audio_file, sr=None)
        
        # Preprocess the audio data
        X_test = load_and_preprocess_data(audio_data, sample_rate)
        
        # Get the top predicted genre
        predicted_genre = model_prediction(X_test)
        
        return PredictionResponse(genre=predicted_genre)

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


