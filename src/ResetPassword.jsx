import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BgImage from "./assets/drummer.jpg";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-y: hidden; /* Hide vertical scroll */
  }

  html {
    overflow-x: hidden; /* Ensure horizontal overflow is hidden */
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

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
}));

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
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: "15px",
    color: "#467B89",
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
};

const FormContainer = styled(Box)({
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  padding: "32px",
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Montserrat",
});

const MessageContainer = styled(Box)({
  height: "24px", // Reserve space for the message
  marginTop: "15px",
  textAlign: "center",
  fontFamily: "Montserrat",
});

const PageContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundImage: `url(${BgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  overflow: "hidden",
  fontFamily: "Montserrat",
});

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/reset-password",
        {
          token,
          newPassword: password,
        }
      );
      setMessage(response.data.message);
      setOpenDialog(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMessage = error.response?.data.message || "An error occurred";
      setMessage(
        errorMessage.includes("Token")
          ? "Your reset link has expired. Please request a new one."
          : errorMessage
      );
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
      <PageContainer>
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
        <FormContainer>
          <Typography
            variant="h5"
            component="h2"
            mb={2}
            sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
          >
            Reset Password
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={textFieldStyles}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 0, padding: 0, color: "#8BD3E6" }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </Button>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={textFieldStyles}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    sx={{ minWidth: 0, padding: 0, color: "#8BD3E6" }}
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </Button>
                ),
              }}
            />

            <MessageContainer>
              {message && (
                <Typography
                  variant="body2"
                  color={message.includes("success") ? "green" : "error"}
                  sx={{ fontFamily: "Montserrat" }} // Apply Montserrat
                >
                  {message}
                </Typography>
              )}
            </MessageContainer>

            <CustomButton fullWidth type="submit">
              Reset Password
            </CustomButton>
          </form>
        </FormContainer>
        {/* Dialog for success message */}
        <Dialog
          open={openDialog}
          PaperProps={{
            sx: dialogStyles.dialogPaper, // Apply dialogPaper styles
          }}
        >
          <DialogContent
            sx={{
              textAlign: "center",
              fontFamily: "Montserrat", // Ensure consistent font
            }}
          >
            <Typography sx={dialogStyles.title}>
              Password reset successfully!
            </Typography>
            <Typography sx={{ ...dialogStyles.contentText, mt: 2 }}>
              Redirecting to the login page shortly.
            </Typography>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
};

export default ResetPassword;
