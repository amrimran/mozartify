import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import styled from "styled-components";

axios.defaults.withCredentials = true;

const PreferencePageContainer = styled(Box)`
  display: flex;
  justify-content: center; // Centers horizontally
  align-items: center; // Centers vertically
  height: 100vh; // Full viewport height
  width: 100vw; // Full viewport width
  position: absolute; // Ensures the container fills the screen
  top: 0;
  left: 0;
  padding: 0; // Remove padding to avoid extra space
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0); // Background color
  z-index: -1; // Ensure the background is behind content if necessary
`;

const PreferenceFormContainer = styled(Box)`
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column; // Stack the form content vertically
  align-items: center; // Center the form elements horizontally within the form
  z-index: 1; // Ensure the form appears above the background
`;

export default function FirstTimeLogin() {
  const [composerPreferences, setComposerPreferences] = useState([]);
  const [genrePreferences, setGenrePreferences] = useState([]);
  const [emotionPreferences, setEmotionPreferences] = useState([]);
  const [options, setOptions] = useState({
    composers: [],
    genres: [],
    emotions: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferencesOptions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/preferences-options"
        );

        // Filter out unwanted composers (e.g., "unknown", "anonymous")
        const validComposers = response.data.composers.filter(
          (composer) =>
            composer &&
            !["unknown", "anonymous"].includes(composer.toLowerCase().trim())
        );

        // Filter out invalid genres and emotions
        const validGenres = response.data.genres.filter((genre) => genre);
        const validEmotions = response.data.emotions.filter(
          (emotion) => emotion
        );

        setOptions({
          composers: validComposers,
          genres: validGenres,
          emotions: validEmotions,
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch preferences options", error);
        setErrorMessage(
          "Failed to load preferences options. Please try again."
        );
        setLoading(false);
      }
    };

    fetchPreferencesOptions();
  }, []);

  const handleCheckboxChange = (event, type) => {
    const { value, checked } = event.target;

    const parseValues = (value) => {
      // Split by comma only, keeping space as part of the value
      return value
        .split(",") // Only split by commas
        .map((item) => item.trim()) // Remove any extra spaces around the values
        .filter((item) => item); // Filter out empty strings
    };

    if (type === "composer") {
      const values = parseValues(value);
      setComposerPreferences((prev) => {
        const newPreferences = checked
          ? [...prev, ...values]
          : prev.filter((item) => !values.includes(item));
        return [...new Set(newPreferences)]; // Remove duplicates
      });
    } else if (type === "genre") {
      const values = parseValues(value);
      setGenrePreferences((prev) => {
        const newPreferences = checked
          ? [...prev, ...values]
          : prev.filter((item) => !values.includes(item));
        return [...new Set(newPreferences)]; // Remove duplicates
      });
    } else if (type === "emotion") {
      const values = parseValues(value);
      setEmotionPreferences((prev) => {
        const newPreferences = checked
          ? [...prev, ...values]
          : prev.filter((item) => !values.includes(item));
        return [...new Set(newPreferences)]; // Remove duplicates
      });
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

  if (loading) {
    return (
      <PreferencePageContainer>
        <CircularProgress />
      </PreferencePageContainer>
    );
  }

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
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          paragraph
        >
          This will help us create a personalized "For You" recommendations for
          our first-time user.
        </Typography>
        {errorMessage && (
          <Typography color="error" variant="body2" align="center" paragraph>
            {errorMessage}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" color="#3B3183" gutterBottom>
            Favorite Composers
          </Typography>

          {options.composers.map((composer) => {
            // Split by comma, but not by spaces
            const composerValues = composer
              .split(",")
              .map((item) => item.trim());
            return composerValues.map((individualComposer) => (
              <FormControlLabel
                key={individualComposer}
                control={
                  <Checkbox
                    value={individualComposer}
                    onChange={(e) => handleCheckboxChange(e, "composer")}
                  />
                }
                label={individualComposer}
              />
            ));
          })}

          <Typography
            variant="h6"
            color="#3B3183"
            gutterBottom
            sx={{ marginTop: "16px" }}
          >
            Favorite Genres
          </Typography>
          {options.genres.map((genre) => {
            const genreValues = genre.split(",").map((item) => item.trim());
            return genreValues.map((individualGenre) => (
              <FormControlLabel
                key={individualGenre}
                control={
                  <Checkbox
                    value={individualGenre}
                    onChange={(e) => handleCheckboxChange(e, "genre")}
                  />
                }
                label={individualGenre}
              />
            ));
          })}

          <Typography
            variant="h6"
            color="#3B3183"
            gutterBottom
            sx={{ marginTop: "16px" }}
          >
            Preferred Emotions
          </Typography>
          {options.emotions.map((emotion) => {
            const emotionValues = emotion.split(",").map((item) => item.trim());
            return emotionValues.map((individualEmotion) => (
              <FormControlLabel
                key={individualEmotion}
                control={
                  <Checkbox
                    value={individualEmotion}
                    onChange={(e) => handleCheckboxChange(e, "emotion")}
                  />
                }
                label={individualEmotion}
              />
            ));
          })}

          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ marginTop: "16px", bgcolor: "#3b3183" }}
          >
            Save Preferences
          </Button>
        </form>
      </PreferenceFormContainer>
    </PreferencePageContainer>
  );
}
