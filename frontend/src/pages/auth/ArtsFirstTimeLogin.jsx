import React, { useState, useEffect } from "react";
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
  Stepper,
  Step,
  StepLabel,
  styled,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
  padding: "12px 24px",
  borderRadius: "8px",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: "bold",
  textTransform: "none",
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
      fontSize: "2rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.5rem",
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
    MuiStepper: {
      styleOverrides: {
        root: {
          marginBottom: 32,
        },
      },
    },
  },
});

const steps = ["Artists", "Collections"];

const FirstTimeLogin2 = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [artistPreferences, setArtistPreferences] = useState([]);
  const [collectionPreferences, setCollectionPreferences] = useState([]);
  const [options, setOptions] = useState({
    artist: [],
    collection: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add effect to scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferencesOptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/art-preferences-options"
        );
        const data = await response.json();
        const sortedArtist = data.artist.filter(Boolean).sort();
        const sortedCollection = data.collection.filter(Boolean).sort();

        // Set sorted options to state
        setOptions({
          artist: sortedArtist,
          collection: sortedCollection,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load preferences options. Please try again.");
        setLoading(false);
      }
    };

    fetchPreferencesOptions();
  }, []);

  const handleSelection = (value) => {
    const updatePreferences = (prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];

    switch (activeStep) {
      case 0:
        setArtistPreferences(updatePreferences(artistPreferences));
        break;
      case 1:
        setCollectionPreferences(updatePreferences(collectionPreferences));
        break;
    }
  };

  const handleNext = () => {
    const isValid = () => {
      switch (activeStep) {
        case 0:
          return artistPreferences.length > 0;
        case 1:
          return collectionPreferences.length > 0;
        default:
          return false;
      }
    };

    if (!isValid()) {
      setError("Please select at least one option before continuing.");
      return;
    }

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
      setError("");
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      await fetch("http://localhost:3000/art-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Add this line
        body: JSON.stringify({
          artist_preferences: artistPreferences,
          collection_preferences: collectionPreferences,
        }),
      });
      setDialogOpen(true);
      setTimeout(() => {
        navigate("/customer-homepage-2");
      }, 2000);
    } catch (err) {
      setError("Failed to save preferences. Please try again.");
    }
  };

  const getCurrentOptions = () => {
    switch (activeStep) {
      case 0:
        return {
          title: "Select Your Favorite Artist",
          subtitle: "Choose one or more artists you prefer",
          options: options.artist,
          selected: artistPreferences,
        };
      case 1:
        return {
          title: "Select Your Favorite Collection",
          subtitle: "Choose one or more collections you enjoy",
          options: options.collection,
          selected: collectionPreferences,
        };
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

  const currentStep = getCurrentOptions();

  return (
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
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box textAlign="center" mb={4}>
              <Typography variant="h2" gutterBottom>
                {currentStep.title}
              </Typography>
              <Typography variant="subtitle1">
                {currentStep.subtitle}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box mb={4}>
              {currentStep.options.map((option) => (
                <OptionButton
                  key={option}
                  onClick={() => handleSelection(option)}
                  className={
                    currentStep.selected.includes(option) ? "selected" : ""
                  }
                >
                  {option}
                </OptionButton>
              ))}
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <ActionButton
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                color="primary"
              >
                Back
              </ActionButton>
              <ActionButton
                onClick={handleNext}
                variant="contained"
                color="primary"
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </ActionButton>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Dialog
        open={dialogOpen}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            padding: "16px",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Great Taste!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            Ready to explore?
          </Typography>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default FirstTimeLogin2;
