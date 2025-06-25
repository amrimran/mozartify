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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BgImage from "./assets/drummer.jpg";
import SidebarMozartifyLogo from "./assets/mozartify.png";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-y: auto; /* Changed to auto for better mobile experience */
  }

  html {
    overflow-x: hidden;
  }
`;

const dialogStyles = {
  dialogPaper: {
    borderRadius: "16px",
    padding: {
      xs: "8px",
      sm: "10px",
    },
    width: {
      xs: "90%",
      sm: "auto",
    },
    maxWidth: {
      xs: "95%",
      sm: "400px",
    },
    fontFamily: "Montserrat",
  },
  title: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    fontSize: {
      xs: "18px",
      sm: "20px",
    },
    textAlign: "center",
  },
  content: {
    fontFamily: "Montserrat",
    textAlign: "center",
    padding: {
      xs: "12px",
      sm: "24px",
    },
  },
  contentText: {
    fontFamily: "Montserrat",
    fontSize: {
      xs: "14px",
      sm: "16px",
    },
    color: "#555",
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
  padding: "10px 24px",
  [theme.breakpoints.down("sm")]: {
    padding: "8px 16px",
    fontSize: "14px",
  },
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
}));

const textFieldStyles = (theme) => ({
  "& label.Mui-focused": {
    color: "#8BD3E6",
    fontWeight: "bold",
  },
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
    borderRadius: "12px",
    boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)",
    backgroundColor: "rgba(255, 255a, 255, 0.9)",
    [theme.breakpoints.down("sm")]: {
      fontSize: "14px",
    },
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: {
      xs: "14px",
      sm: "15px",
    },
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
  },
});

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  padding: "32px",
  width: "100%",
  maxWidth: "400px",
  margin: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Montserrat",
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
    margin: theme.spacing(1),
    maxWidth: "95%",
  },
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  height: "24px",
  marginTop: "15px",
  textAlign: "center",
  fontFamily: "Montserrat",
  [theme.breakpoints.down("sm")]: {
    height: "20px",
    marginTop: "10px",
    fontSize: "14px",
  },
}));

const PageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundImage: `url(${BgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const Logo = styled("img")(({ theme }) => ({
  position: "fixed",
  top: 10,
  left: 10,
  maxWidth: "90px",
  cursor: "pointer",
  zIndex: 10,
  animation: "rotateLogo 5s linear infinite",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "60px",
    top: 5,
    left: 5,
  },
  [theme.breakpoints.up("xl")]: {
    maxWidth: "120px",
  },
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        `${API_BASE_URL}/reset-password`,
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
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <GlobalStyle />
      <PageContainer>
        <Logo
          src={SidebarMozartifyLogo}
          alt="MozartifyIcon"
          onClick={() => navigate('/')} 
        />
        <FormContainer>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="h2"
            mb={2}
            sx={{
              fontFamily: "Montserrat",
              fontWeight: "bold",
              fontSize: {
                xs: "1.25rem",
                sm: "1.5rem",
                md: "1.75rem",
              },
            }}
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
                    sx={{
                      minWidth: 0,
                      padding: 0,
                      color: "#8BD3E6",
                      "& .MuiSvgIcon-root": {
                        fontSize: isMobile ? "1.2rem" : "1.5rem",
                      },
                    }}
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
                    sx={{
                      minWidth: 0,
                      padding: 0,
                      color: "#8BD3E6",
                      "& .MuiSvgIcon-root": {
                        fontSize: isMobile ? "1.2rem" : "1.5rem",
                      },
                    }}
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
                  sx={{
                    fontFamily: "Montserrat",
                    fontSize: {
                      xs: "12px",
                      sm: "14px",
                    },
                  }}
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
        
        <Dialog
          open={openDialog}
          PaperProps={{
            sx: dialogStyles.dialogPaper,
          }}
        >
          <DialogContent sx={dialogStyles.content}>
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