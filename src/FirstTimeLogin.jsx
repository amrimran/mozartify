import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  styled,
} from "@mui/material";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @keyframes skeleton-wave {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }

  * {
    font-family: 'Montserrat', sans-serif;
  }
`;

const dialogStyles = {
  dialogPaper: {
    borderRadius: "16px",
    padding: "10px",
    fontFamily: "Montserrat",
  },
  title: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    fontSize: "20px",
    textAlign: "center",
  },
  content: {
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  contentText: {
    fontFamily: "Montserrat",
    fontSize: "16px",
    color: "#555",
  },
  actions: {
    justifyContent: "center",
    gap: "12px",
    marginTop: "8px",
  },
  button: {
    textTransform: "none",
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#8BD3E6",
    border: "1px solid #8BD3E6",
    borderRadius: "8px",
    padding: "8px 24px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",

      backgroundColor: "#6FBCCF",
      borderColor: "#6FBCCF",
    },
  },
  deletebutton: {
    textTransform: "none",
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#DB2226",
    border: "1px solid #DB2226",
    borderRadius: "8px",
    padding: "8px 24px",
    "&:hover": {
      backgroundColor: "#B71C1C",
      borderColor: "#B71C1C",
    },
  },
};

// Custom styled components
const OptionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: "8px 16px",
  margin: "4px",
  textTransform: "none",
  fontFamily: "Montserrat, sans-serif",
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
    boxShadow: "none",
  },
  "&.selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  width: "100%",
  padding: "16px",
  borderRadius: "8px",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: "bold",
  color: "white",
  textTransform: "uppercase",
  marginTop: theme.spacing(2),
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
}));

// Custom theme
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, sans-serif",
    h1: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: "0.875rem",
      color: "#666",
    },
  },
  palette: {
    primary: {
      main: "#8BD3E6",
      dark: "#6FBCCF",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: 32,
        },
      },
    },
  },
});

const FirstTimeLogin = () => {
  const [composerPreferences, setComposerPreferences] = useState([]);
  const [genrePreferences, setGenrePreferences] = useState([]);
  const [emotionPreferences, setEmotionPreferences] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog
  const errorRef = useRef(null); // Ref for error alert

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

        setOptions({
          composers: response.data.composers.filter(Boolean),
          genres: response.data.genres.filter(Boolean),
          emotions: response.data.emotions.filter(Boolean),
        });

        setLoading(false);
      } catch (error) {
        setErrorMessage(
          "Failed to load preferences options. Please try again."
        );
        setLoading(false);
      }
    };

    fetchPreferencesOptions();
  }, []);

  const handleCheckboxChange = (value, type) => {
    const updatePreferences = (prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];

    switch (type) {
      case "composer":
        setComposerPreferences(updatePreferences(composerPreferences));
        break;
      case "genre":
        setGenrePreferences(updatePreferences(genrePreferences));
        break;
      case "emotion":
        setEmotionPreferences(updatePreferences(emotionPreferences));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMessage, errorRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !composerPreferences.length ||
      !genrePreferences.length ||
      !emotionPreferences.length
    ) {
      setErrorMessage("Please select at least one option from each category.");
      return;
    }

    try {
      await fetch('http://localhost:3000/preferences-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          composer_preferences: composerPreferences,
          genre_preferences: genrePreferences,
          emotion_preferences: emotionPreferences,
        }),
      });
      setDialogOpen(true); // Show the dialog
      setTimeout(() => {
        navigate("/customer-homepage"); // Redirect after delay
      }, 2000);
    } catch (error) {
      setErrorMessage("Failed to save preferences. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFFFFF 0%, #B3E8F2 100%)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            py: 4,
            px: 2,
            background: "linear-gradient(135deg, #FFFFFF 0%, #B3E8F2 100%)",
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={3}>
              <Box textAlign="center" mb={3}>
                <Typography variant="h2" gutterBottom>
                  Tell Us About Your Music Taste
                </Typography>
                <Typography variant="subtitle1">
                  Select your preferences to personalize your experience.
                </Typography>
              </Box>

              {errorMessage && (
                <Alert severity="error" ref={errorRef} sx={{ mb: 3 }}>
                  {errorMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box mb={4}>
                  <Typography variant="h3" gutterBottom>
                    Favorite Composers
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    You may choose more than one
                  </Typography>
                  {options.composers.map((composer) => (
                    <OptionButton
                      key={composer}
                      onClick={() => handleCheckboxChange(composer, "composer")}
                      className={
                        composerPreferences.includes(composer) ? "selected" : ""
                      }
                    >
                      {composer}
                    </OptionButton>
                  ))}
                </Box>

                <Box mb={4}>
                  <Typography variant="h3" gutterBottom>
                    Favorite Genres
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    You may choose more than one
                  </Typography>
                  {options.genres.map((genre) => (
                    <OptionButton
                      key={genre}
                      onClick={() => handleCheckboxChange(genre, "genre")}
                      className={
                        genrePreferences.includes(genre) ? "selected" : ""
                      }
                    >
                      {genre}
                    </OptionButton>
                  ))}
                </Box>

                <Box mb={2}>
                  <Typography variant="h3" gutterBottom>
                    Preferred Emotions
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    You may choose more than one
                  </Typography>
                  {options.emotions.map((emotion) => (
                    <OptionButton
                      key={emotion}
                      onClick={() => handleCheckboxChange(emotion, "emotion")}
                      className={
                        emotionPreferences.includes(emotion) ? "selected" : ""
                      }
                    >
                      {emotion}
                    </OptionButton>
                  ))}
                </Box>

                <Box>
                  <ActionButton
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Save
                  </ActionButton>
                </Box>
              </form>
            </Paper>
          </Container>
        </Box>
        <Dialog open={dialogOpen}>
          <DialogTitle sx={dialogStyles.title}>Great Taste!</DialogTitle>
          <DialogContent sx={dialogStyles.content}>
            <Typography variant="body1">Ready to explore?</Typography>
          </DialogContent>
        </Dialog>
      </ThemeProvider>
    </>
  );
};

export default FirstTimeLogin;