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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from "@mui/icons-material/VisibilityOff";
import VisibilityOff from "@mui/icons-material/Visibility";
import backgroundImage from "./assets/loginWP.png";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const buttonStyles = {
  px: { xs: 6, sm: 8, md: 10 }, // Reduced padding
  py: { xs: 1, sm: 1 }, // Added vertical padding
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  fontSize: { xs: "14px", sm: "15px" }, // Reduced font size
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
};

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: "40px", // Reduced base padding
  width: "90%", // Default width for mobile
  maxWidth: "400px", // Reduced from 500px
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Montserrat",
  margin: "20px",

  // Responsive adjustments
  [theme.breakpoints.down("sm")]: {
    padding: "25px",
    width: "75%",
    maxWidth: "320px",
  },

  [theme.breakpoints.up("md")]: {
    width: "50%",
    padding: "35px",
  },
}));

const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  margin: 0,
  padding: { xs: "16px", sm: "24px", md: "32px" }, // Responsive padding
  overflow: "auto",
  fontFamily: "Montserrat",
}));

const Logo = styled("img")(({ theme }) => ({
  position: "fixed", // Keeps the logo fixed at the top-left corner
  top: "10px", // Consistent positioning for all screen sizes
  left: "10px",
  width: "auto", // Maintains aspect ratio based on height
  height: "50px", // Default height for the logo
  maxWidth: "70px", // Limits maximum width for consistency
  zIndex: 10, // Ensures it stays on top of other elements
  cursor: "pointer",

  [theme.breakpoints.down("sm")]: {
    top: "10px", // Slightly adjusted for smaller screens
    left: "10px",
    height: "40px", // Slightly smaller logo for smaller screens
    maxWidth: "60px",
  },

  [theme.breakpoints.up("md")]: {
    height: "60px", // Larger size for medium and above screens
    maxWidth: "80px",
  },

  [theme.breakpoints.up("lg")]: {
    height: "70px", // Slightly larger size for large screens
    maxWidth: "90px",
  },

  [theme.breakpoints.up("xl")]: {
    height: "80px", // Largest size for extra-large screens
    maxWidth: "100px",
  },
}));

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
  
  @media (max-width: 600px) {
    html {
      font-size: 14px;
    }
  }
`;

const textFieldStyles = {
  "& label.Mui-focused": {
    color: "#8BD3E6",
    fontWeight: "bold",
  },
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
    borderRadius: "12px",
    boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)",
    backgroundColor: "rgba(235, 251, 255, 0.9)",
    // Adjust input height
    height: { xs: "45px", sm: "50px" },
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: { xs: "13px", sm: "14px" }, // Reduced font sizes
    color: "#467B89",
    transform: "translate(14px, 14px) scale(1)", // Adjust label position
    "&.Mui-focused, &.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.75)",
    },
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#C8EAF2",
    },
    "&:hover fieldset": {
      borderColor: "#8BD3E6",
      boxShadow: "0px 6px 16px rgba(139, 211, 230, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8BD3E6",
      boxShadow: "0px 8px 20px rgba(139, 211, 230, 0.6)",
    },
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  marginBottom: { xs: 1, sm: 1.5 }, // Reduced margins
  "& .MuiInputBase-input": {
    padding: { xs: "10px 14px", sm: "12px 14px" }, // Reduced padding
    fontSize: { xs: "14px", sm: "15px" }, // Reduced font size
  },
};

export default function Login() {
  const [username_or_email, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a session cookie by making a request to the login endpoint
    axios
      .get("http://localhost:3000/login", { withCredentials: true })
      .then((response) => {
        const { message, role, first_timer, approval } = response.data;

        if (message === "Success") {
          // Handle navigation based on role and approval status
          if (role === "music_entry_clerk" && approval === "pending") {
            setErrorMessage(
              "Your account is awaiting approval. Please contact the admin."
            );
          } else if (first_timer && role === "customer") {
            navigate("/first-time-login");
          } else if (role === "customer") {
            navigate("/customer-homepage");
          } else if (role === "music_entry_clerk") {
            navigate("/clerk-homepage");
          } else if (role === "admin") {
            navigate("/admin-dashboard");
          }
        }
      })
      .catch((error) => {
        // If there's an error or no active session, stay on login page
        console.log("No active session found");
      });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    // Clear any previous error message
    setErrorMessage("");

    // const loggedInUserId = localStorage.getItem("loggedInUserId");

    // if (loggedInUserId && loggedInUserId !== username_or_email) {
    //   setErrorMessage(
    //     "You cannot log in to multiple accounts on the same browser."
    //   );
    //   return; // Stop further execution of the login process
    // }

    axios
      .post("http://localhost:3000/login", { username_or_email, password })
      .then((result) => {
        const { message, role, first_timer, approval, _id } = result.data;

        if (message === "Success") {
          // localStorage.setItem("loggedInUserId", _id);
          // Check role and handle navigation
          if (role === "music_entry_clerk" && approval === "pending") {
            setErrorMessage(
              "Your account is awaiting approval. Please contact the admin."
            );
          } else if (first_timer && role === "customer") {
            navigate("/first-time-login");
          } else if (role === "customer") {
            navigate("/customer-homepage");
          } else if (role === "music_entry_clerk") {
            navigate("/clerk-homepage");
          } else if (role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/login");
          }
        } else {
          // Generic error handling if "message" is not "Success"
          setErrorMessage("Login failed. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);

        // Handle specific error responses from the backend
        if (err.response && err.response.status === 403) {
          setErrorMessage(err.response.data.message); // Display the backend error message
        } else if (err.response && err.response.status === 400) {
          setErrorMessage("Invalid username/email or password");
        } else {
          setErrorMessage(
            "An unexpected error occurred. Please try again later."
          );
        }
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
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media (max-width: 600px) {
            .rotate-animation {
              animation: none;
            }
          }
        `}
      </style>
      <GlobalStyle />

      <BackgroundContainer>
        <Logo
          src={SidebarMozartifyLogo}
          alt="MozartifyIcon"
          className={isMobile ? "" : "rotate-animation"}
          style={{
            animation: isMobile ? "none" : "rotateLogo 5s linear infinite",
          }}
          onClick={() => window.location.replace("http://localhost:5173")}
        />

        <FormContainer component="form" onSubmit={handleLogin}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontFamily: "Montserrat",
              marginBottom: { xs: 0.5, sm: 1 },
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
            }}
          >
            Hello, welcome back!
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{
              fontFamily: "Montserrat",
              marginBottom: { xs: 2, sm: 3 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              padding: { xs: "0 10px", sm: 0 },
            }}
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
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ padding: { xs: "4px", sm: "8px" } }}
                  >
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
              mt: { xs: 1, sm: 2 },
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                color: "#000000",
                fontSize: isMobile ? "0.875rem" : "1rem",
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: { xs: 1, sm: 2 },
                fontFamily: "Montserrat",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {errorMessage}
            </Typography>
          )}

          <Button
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            type="submit"
            sx={{
              mt: { xs: 2, sm: 3 },
              ...buttonStyles,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Login Now
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: { xs: 2, sm: 3 },
              fontFamily: "Montserrat",
              color: "#000000",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            Don't have an account?{" "}
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
