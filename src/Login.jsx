import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from "@mui/icons-material/VisibilityOff";
import VisibilityOff from "@mui/icons-material/Visibility";
import backgroundImage from "./assets/loginWP.png";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: 80,
  width: "60%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Montserrat",
  maxWidth: 500,
}));

const BackgroundContainer = styled(Box)(() => ({
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left top",
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

const textFieldStyles = {
  "& label.Mui-focused": {
    color: "#5A67D8", // Vibrant indigo for focus
    fontWeight: "bold", // Adds emphasis to the label on focus
  },
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
    borderRadius: "12px", // Slightly more rounded corners for a modern feel
    boxShadow: "0px 4px 6px rgba(90, 103, 216, 0.2)", // Subtle indigo shadow for depth
    backgroundColor: "rgba(243, 244, 255, 0.8)", // Light gradient-inspired background
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: "15px", // Slightly larger for readability
    color: "#4A5568", // Neutral gray for a clean appearance
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#5A67D8", // Matches the focus label color
    transform: "scaleX(1)", // Smooth underline animation
    borderWidth: "2px", // Slightly thicker for better visibility
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#CBD5E0", // Soft gray for the default border
    },
    "&:hover fieldset": {
      borderColor: "#7F9CF5", // Softer indigo for hover
      boxShadow: "0px 6px 16px rgba(127, 156, 245, 0.4)", // Glow effect on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#5A67D8", // Vibrant indigo for focus
      boxShadow: "0px 8px 20px rgba(90, 103, 216, 0.6)", // Stronger shadow for focus
    },
    borderRadius: "12px", // Matches the input base for consistent design
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly opaque white for contrast
  },
};

export default function Login() {
  const [username_or_email, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/clearSession")
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error("Error clearing session:", error);
      });

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    // Clear any previous error message
    setErrorMessage("");

    axios
      .post("http://localhost:3000/login", { username_or_email, password })
      .then((result) => {
        if (result.data.message === "Success") {
          if (result.data.first_timer && result.data.role === "customer") {
            navigate("/first-time-login");
          } else if (result.data.role === "customer") {
            navigate("/customer-homepage");
          } else if (result.data.role === "music_entry_clerk") {
            navigate("/clerk-homepage");
          } else if (result.data.role === "admin") {
            navigate("/admin-dashboard");
          }
        } else {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setErrorMessage("Invalid username/email or password");
      });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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
        />

        <FormContainer component="form" onSubmit={handleLogin}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ fontFamily: "Montserrat", marginBottom: 1 }}
          >
            Hello! Welcome back.
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ fontFamily: "Montserrat", marginBottom: 3 }}
          >
            Log in using the information you provided during registration
          </Typography>
          <TextField
            fullWidth
            label="Username or Email Address"
            margin="normal"
            variant="outlined"
            required
            value={username_or_email}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            variant="outlined"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Link to="/forgot-password" style={{ color: "#483C32" }}>
              Forgot Password?
            </Link>
          </Box>
          {!errorMessage && (
            <Typography
              color="white"
              variant="body2"
              sx={{
                mt: 2,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              no error
            </Typography>
          )}
          {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: 2,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {errorMessage}
            </Typography>
          )}

          <Button
            variant="outlined"
            size="large"
            type="submit"
            sx={{
              mt: 2,
              px: 10,
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#FFFFFF",
              backgroundColor: "#8BD3E6",
              border: "1px solid #8BD3E6", // Explicitly define the border
              borderColor: "#8BD3E6",
              "&:hover": {
                backgroundColor: "#3B3183",
                color: "#FFFFFF",
                border: "1px solid #3B3183", // Ensure border remains visible on hover
              },
            }}
          >
            Login Now
          </Button>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, fontFamily: "Montserrat", color: "#00000" }}
          >
            Don’t have an account?{" "}
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "#3B3183",
                fontWeight: "bold",
              }}
            >
              REGISTER
            </Link>
          </Typography>
        </FormContainer>
      </BackgroundContainer>
    </>
  );
}
