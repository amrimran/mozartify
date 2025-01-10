import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import { Link } from "react-router-dom";
import backgroundImage from "./assets/forgotPWBG.png";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: 80,
  width: "100%", // Ensure it takes full width of the screen for smaller devices
  maxWidth: 500, // Set a max width for larger screens
  minWidth: 300, // Set a minimum width for the form to prevent it from becoming too wide
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Montserrat",
}));

const BackgroundContainer = styled(Box)(() => ({
  backgroundColor: "#f5f5f5",
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  backgroundPosition: "right",
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  margin: 0,
  overflow: "hidden",
  fontFamily: "Montserrat",
}));

const LoginButton = styled(Button)({
  width: "200px",
  marginTop: "16px",
  padding: "8px 80px",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  border: "1px solid #8BD3E6",
  "&:hover": {
    backgroundColor: "#E6F8FB",
    color: "#7AB9C4",
    borderColor: "#7AB9C4",
  },
});

const SubmitButton = styled(Button)({
  width: "200px",
  marginTop: "16px",
  padding: "8px 80px",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
    color: "#FFFFFF",
  },
});

const textFieldStyles = {
  "& label.Mui-focused": {
    color: "#8BD3E6", // Primary color for focused label
    fontWeight: "bold", // Emphasis on focus
  },
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
    borderRadius: "12px", // Slightly more rounded corners
    boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)", // Subtle shadow in primary color
    backgroundColor: "rgba(235, 251, 255, 0.9)", // Complementary light cyan for background
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: "15px", // Readable font size
    color: "#467B89", // Muted teal for a clean look
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#8BD3E6", // Primary color for underline focus
    transform: "scaleX(1)", // Smooth underline animation
    borderWidth: "2px", // Enhanced visibility
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#C8EAF2", // Light complementary color for default border
    },
    "&:hover fieldset": {
      borderColor: "#8BD3E6", // Primary color for hover
      boxShadow: "0px 6px 16px rgba(139, 211, 230, 0.4)", // Glow effect on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8BD3E6", // Primary color for focus
      boxShadow: "0px 8px 20px rgba(139, 211, 230, 0.6)", // Stronger shadow for focus
    },
    borderRadius: "12px", // Consistent design with input base
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Neutral white for contrast
  },
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); // Track the email value
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false); // Track if the button should be disabled
  const timeoutRef = useRef(null); // Ref to store timeout ID

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading || disabled) {
      return;
    }

    setLoading(true);
    setMessage(""); // Clear previous messages

    axios
      .post("http://localhost:3000/forgot-password", { email })
      .then((response) => {
        setMessage({
          text: "We have sent you an email to reset your password.",
          type: "success",
        });

        // Disable the button for 1 minute
        setDisabled(true);
        timeoutRef.current = setTimeout(() => {
          setDisabled(false); // Re-enable the button after 1 minute
        }, 60000); // 60000ms = 1 minute
      })
      .catch((error) => {
        // Handle specific error messages from the backend
        if (error.response && error.response.status === 400) {
          setMessage({ text: error.response.data.message, type: "error" }); // Show error message in red
        } else {
          setMessage({
            text: "An error occurred. Please try again.",
            type: "error",
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Reset the disable timer when email changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    // Clear timeout and re-enable the button
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDisabled(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes rotateLogo {
            0% {
              transform: rotate(0deg); // Start from 0 degrees
            }
            100% {
              transform: rotate(360deg); // Rotate to 360 degrees
            }
          }
        `}
      </style>
      <GlobalStyle />
      <BackgroundContainer>
        <img
          src={SidebarMozartifyLogo}
          alt="MozartifyIcon"
          style={{
            position: "fixed", // Fix the position relative to the viewport
            top: 10, // Place it at the top of the screen
            left: 10, // Place it at the left of the screen
            maxWidth: "100%", // Ensure it scales properly
            maxHeight: "90px", // Set a fixed height for the logo
            zIndex: 10, // Ensure it's always on top of other elements
            animation: "rotateLogo 5s linear infinite", // Apply the rotation animation
          }}
          onClick={() => window.location.replace("http://localhost:5173")} // Redirect on click
        />
        <FormContainer component="form" onSubmit={handleSubmit}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ fontFamily: "Montserrat", marginBottom: 1 }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ fontFamily: "Montserrat", marginBottom: 3 }}
          >
            Enter your email to request a password reset link
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            variant="outlined"
            required
            value={email} // The value should be controlled here
            onChange={handleEmailChange} // Proper state update and reset on change
            sx={textFieldStyles}
          />
          {/* Reserve space for the error or success message */}
          <Typography
            color={message.type === "error" ? "error" : "black"} // Red for error, default for success
            variant="body2"
            sx={{
              mt: 2,
              fontFamily: "Montserrat",
              textAlign: "center", // Centers the text horizontally
              minHeight: "24px", // Reserve space for a single line of text
            }}
          >
            {message.text || " "} {/* Placeholder to maintain space */}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 0,
            }}
          >
            <LoginButton to="/login" component={Link}>
              Login
            </LoginButton>
            <SubmitButton type="submit" disabled={loading || disabled}>
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Submit"
              )}
            </SubmitButton>
          </Box>
        </FormContainer>
      </BackgroundContainer>
    </>
  );
}
