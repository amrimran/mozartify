import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  IconButton,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import backgroundImage from "./assets/signupBG.png";
import SidebarMozartifyLogo from "./assets/mozartify.png";

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

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: theme.spacing(4, 10),
  width: "50%",
  maxWidth: "450px", // Made the form smaller
  height: "600px", // Allow height to adjust based on content
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
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

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1, 23), // Adjusted padding for width
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
}));

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

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Validate password format
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long and include both letters and numbers"
      );
      return;
    }

    // Check if role is selected
    if (!role) {
      setErrorMessage("Please select a role");
      return;
    }

    // Clear any error messages
    setErrorMessage("");

    // Make the API request
    axios
      .post("http://localhost:3000/signup", { username, email, password, role })
      .then((result) => {
        console.log(result);
        setIsDialogOpen(true);
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          setErrorMessage(err.response.data.message);
          console.log(err.response.data.message);
        } else {
          setErrorMessage("An error occurred. Please try again.");
          console.log("An error occurred. Please try again.");
        }
      });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    navigate("/login");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getDialogContent = () => {
    if (role === "customer") {
      return {
        title: "Sign-Up Successful!",
        content:
          "Your account has been created successfully. Please check your email for the verification link.",
        buttonText: "OK",
      };
    } else {
      return {
        title: "Sign-Up Pending Approval",
        content:
          "Your account has been created successfully. However, you will need admin approval before you can login.",
        buttonText: "OK",
      };
    }
  };

  const dialogContent = getDialogContent();

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
            fontFamily="Montserrat"
            fontWeight="bold"
            gutterBottom
            sx={{ marginBottom: 2 }}
          >
            Sign up to <span style={{ color: "#8BD3E6" }}>N.A.S.I.R</span>
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            fontFamily="Montserrat"
            gutterBottom
            sx={{ marginBottom: 2 }}
          >
            Please fill this form to create an account
          </Typography>

          <TextField
            fullWidth
            label="Username"
            margin="normal"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={textFieldStyles}
          />

          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            variant="outlined"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            margin="normal"
            variant="outlined"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />

          <Typography sx={{ fontFamily: "Montserrat", mt: 2 }}>
            Choose one:
          </Typography>

          <FormControl component="fieldset" sx={{ mt: 0 }}>
            <RadioGroup
              aria-label="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              row
            >
              <FormControlLabel
                value="customer"
                control={
                  <Radio
                    required
                    sx={{
                      color: "#8BD3E6",
                      "&.Mui-checked": { color: "#8BD3E6" },
                    }}
                  />
                }
                label="Customer"
                componentsProps={{
                  typography: {
                    sx: { fontFamily: "Montserrat" },
                  },
                }}
              />
              <FormControlLabel
                value="music_entry_clerk"
                control={
                  <Radio
                    required
                    sx={{
                      color: "#8BD3E6",
                      "&.Mui-checked": { color: "#8BD3E6" },
                    }}
                  />
                }
                label="Music Entry Clerk"
                componentsProps={{
                  typography: {
                    sx: { fontFamily: "Montserrat" },
                  },
                }}
              />
            </RadioGroup>
          </FormControl>

          {errorMessage && (
            <Typography
              color="error"
              variant="body2"
              align="center"
              sx={{ fontFamily: "Montserrat" }}
            >
              {errorMessage}
            </Typography>
          )}

          <CustomButton size="large" type="submit">
            SIGN UP
          </CustomButton>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, fontFamily: "Montserrat", color: "#000000" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "#8BD3E6",
                fontWeight: "bold",
              }}
            >
              LOGIN
            </Link>
          </Typography>
        </FormContainer>
      </BackgroundContainer>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{ sx: dialogStyles.dialogPaper }}
      >
        <DialogTitle sx={dialogStyles.title}>{dialogContent.title}</DialogTitle>
        <DialogContent sx={dialogStyles.content}>
          <DialogContentText sx={dialogStyles.contentText}>
            {dialogContent.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={dialogStyles.actions}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={dialogStyles.button}
          >
            {dialogContent.buttonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
