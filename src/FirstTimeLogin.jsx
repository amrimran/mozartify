import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import styled from "styled-components";

axios.defaults.withCredentials = true;

const PreferencePageContainer = styled(Box)`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
`;

const PreferenceFormContainer = styled(Box)`
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const options = {
  composers: ["Beethoven", "Mozart", "Bach", "Chopin", "Vivaldi"],
  genres: ["Classical", "Jazz", "Pop", "Rock", "Hip-Hop"],
  emotions: ["Happy", "Sad", "Relaxed", "Energetic"],
};

export default function FirstTimeLogin() {
  const [composerPreferences, setComposerPreferences] = useState([]);
  const [genrePreferences, setGenrePreferences] = useState([]);
  const [emotionPreferences, setEmotionPreferences] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleCheckboxChange = (event, type) => {
    const { value, checked } = event.target;
    if (type === "composer") {
      setComposerPreferences((prev) =>
        checked ? [...prev, value] : prev.filter((item) => item !== value)
      );
    } else if (type === "genre") {
      setGenrePreferences((prev) =>
        checked ? [...prev, value] : prev.filter((item) => item !== value)
      );
    } else if (type === "emotion") {
      setEmotionPreferences((prev) =>
        checked ? [...prev, value] : prev.filter((item) => item !== value)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      composerPreferences.length === 0 ||
      genrePreferences.length === 0 ||
      emotionPreferences.length === 0
    ) {
      setErrorMessage("Please select at least one option from each category.");
      return;
    }

    const preferences = {
      composer_preferences: composerPreferences,
      genre_preferences: genrePreferences,
      emotion_preferences: emotionPreferences,
    };

    try {
      await axios.post("http://localhost:3000/preferences", preferences);
      navigate("/customer-homepage");
    } catch (error) {
      console.error("Failed to save preferences", error);
      setErrorMessage("Failed to save preferences. Please try again.");
    }
  };

  return (
    <PreferencePageContainer>
      <PreferenceFormContainer>
        <Typography variant="h4" gutterBottom align="center">
          Set Your Preferences
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          paragraph
        >
          Choose your favorite composers, genres, and emotions to personalize
          your experience.
        </Typography>
        {errorMessage && (
          <Typography color="error" variant="body2" align="center" paragraph>
            {errorMessage}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Favorite Composers
          </Typography>
          {options.composers.map((composer) => (
            <FormControlLabel
              key={composer}
              control={
                <Checkbox
                  value={composer}
                  onChange={(e) => handleCheckboxChange(e, "composer")}
                />
              }
              label={composer}
            />
          ))}

          <Typography variant="h6" gutterBottom>
            Favorite Genres
          </Typography>
          {options.genres.map((genre) => (
            <FormControlLabel
              key={genre}
              control={
                <Checkbox
                  value={genre}
                  onChange={(e) => handleCheckboxChange(e, "genre")}
                />
              }
              label={genre}
            />
          ))}

          <Typography variant="h6" gutterBottom>
            Preferred Emotions
          </Typography>
          {options.emotions.map((emotion) => (
            <FormControlLabel
              key={emotion}
              control={
                <Checkbox
                  value={emotion}
                  onChange={(e) => handleCheckboxChange(e, "emotion")}
                />
              }
              label={emotion}
            />
          ))}

          <Button variant="contained" color="primary" type="submit" fullWidth>
            Save Preferences
          </Button>
        </form>
      </PreferenceFormContainer>
    </PreferencePageContainer>
  );
}
