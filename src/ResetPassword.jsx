import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/system";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const FormContainer = styled(Box)(({ theme }) => ({
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
}));

const PageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#F3F4F6",
  padding: "16px",
}));

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
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setMessage("");
    setPasswordError("");

    // Validate passwords match
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
      setOpenDialog(true); // Open dialog after successful reset

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login"); // Use navigate to redirect
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <PageContainer>
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
          fontWeight="bold"
          mb={2}
          sx={{ fontFamily: "Montserrat, sans-serif", color: "#333" }}
        >
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? "text" : "password"} // Toggle password visibility
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="outlined"
            margin="normal"
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "Montserrat, sans-serif",
              },
              "& .MuiFormLabel-root": {
                fontFamily: "Montserrat, sans-serif",
              },
            }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ padding: 0 }}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"} // Toggle password visibility
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            variant="outlined"
            margin="normal"
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "Montserrat, sans-serif",
              },
              "& .MuiFormLabel-root": {
                fontFamily: "Montserrat, sans-serif",
              },
            }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  sx={{ padding: 0 }}
                >
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
              ),
            }}
          />
          {passwordError && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: 1,
                fontFamily: "Montserrat, sans-serif",
                textAlign: "center",
              }}
            >
              {passwordError}
            </Typography>
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: "bold",
              mt: 2,
              py: 1.2,
              backgroundColor: "#3B3183",
              "&:hover": {
                backgroundColor: "#2B2565",
              },
            }}
          >
            Reset Password
          </Button>
        </form>
      </FormContainer>

      {/* Dialog for success message */}
      <Dialog open={openDialog} sx={{ borderRadius: "16px" }}>
        <DialogContent
          sx={{
            textAlign: "center",
            fontFamily: "Montserrat, sans-serif",
            padding: "32px",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Password reset successfully!
          </Typography>
          <Typography variant="h6" sx={{ marginTop: 2, fontSize: "1.25rem" }}>
            We will redirect you to the login page shortly.
          </Typography>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default ResetPassword;
