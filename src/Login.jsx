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

const buttonStyles = {
  px: 15,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
};

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

  // Frontend (React) - Modified handleLogin
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        { username_or_email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Important for session cookies
        }
      );

      const { message, role, first_timer, approval } = response.data;

      if (message === "Success") {
        switch (role) {
          case "music_entry_clerk":
            if (approval === "pending") {
              setErrorMessage(
                "Your account is awaiting approval. Please contact the admin."
              );
              return;
            }
            navigate("/clerk-homepage");
            break;
          case "customer":
            navigate(first_timer ? "/first-time-login" : "/customer-homepage");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          default:
            navigate("/login");
        }
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        // Server responded with error
        const errorMessage =
          err.response.data.message || "Login failed. Please try again.";
        setErrorMessage(errorMessage);
      } else if (err.request) {
        // Request made but no response
        setErrorMessage(
          "Unable to connect to server. Please check your internet connection."
        );
      } else {
        // Error in request setup
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
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
          onClick={() => window.location.replace("http://localhost:5173")} // Redirect on click
        />

        <FormContainer component="form" onSubmit={handleLogin}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ fontFamily: "Montserrat", marginBottom: 1 }}
          >
            Hello, welcome back!
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
            <Link to="/forgot-password" style={{ color: "#000000" }}>
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
              ...buttonStyles,
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
                color: "#8BD3E6",
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
