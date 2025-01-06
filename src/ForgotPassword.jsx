import React, { useState } from "react";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("http://localhost:3000/forgot-password", { email })
      .then((response) => {
        setMessage(
          "We have sent you an email to reset your password. Please check your email."
        );
      })
      .catch((error) => {
        setMessage("An error occurred. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
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
            onChange={(e) => setEmail(e.target.value)} // Proper state update for email
            sx={{
              "& label.Mui-focused": { color: "#483C32" },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#483C32",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#483C32" },
                "&:hover fieldset": { borderColor: "#483C32" },
                "&.Mui-focused fieldset": { borderColor: "#483C32" },
              },
            }}
          />
          {message && (
            <Typography
              color="textPrimary"
              variant="body2"
              sx={{
                mt: 2,
                fontFamily: "Montserrat",
                textAlign: "center", // Centers the text horizontally
              }}
            >
              {message}
            </Typography>
          )}

          <Button
            variant="outlined"
            size="large"
            type="submit"
            sx={{
              mt: 3,
              px: 10,
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#483C32",
              borderColor: "#483C32",
              "&:hover": {
                backgroundColor: "#483C32",
                color: "#FFFFFF",
                borderColor: "#483C32",
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#483C32" }} />
            ) : (
              "Submit"
            )}
          </Button>
          <Typography
            component={Link}
            to="/login"
            sx={{
              textDecoration: "none",
              color: "#3B3183",
              fontWeight: "bold",
              marginTop: "20px",
              fontFamily: "Montserrat",
            }}
          >
            BACK TO LOGIN
          </Typography>
        </FormContainer>
      </BackgroundContainer>
    </>
  );
}
