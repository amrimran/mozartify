import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
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
  padding: theme.spacing(4),
  width: "60%",
  maxWidth: "400px",
  minWidth: "280px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Montserrat",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  margin: "0 auto",
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    width: "80%",
    minWidth: "240px",
    maxWidth: "320px"
  },
  
  [theme.breakpoints.between('sm', 'md')]: {
    padding: theme.spacing(3.5),
    width: "65%",
    maxWidth: "360px"
  },
  
  [theme.breakpoints.between('md', 'lg')]: {
    padding: theme.spacing(4),
    width: "55%",
    maxWidth: "400px"
  },
  
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(5),
    maxWidth: "450px",
    width: "50%"
  }
}));

const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  backgroundPosition: "center",
  minHeight: "100vh",
  width: "100vw",
  position: "relative",
  margin: 0,
  overflow: "hidden",
  fontFamily: "Montserrat",
  
  [theme.breakpoints.down('sm')]: {
    backgroundPosition: "center",
    minHeight: "100dvh" // Use dynamic viewport height for mobile
  },
  
  [theme.breakpoints.up('xl')]: {
    backgroundPosition: "center"
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  width: "180px",
  marginTop: "16px",
  padding: "10px 32px",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  border: "1px solid #8BD3E6",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#E6F8FB",
    color: "#7AB9C4",
    borderColor: "#7AB9C4",
  },
  
  [theme.breakpoints.down('sm')]: {
    width: "140px",
    padding: "8px 24px",
    fontSize: "0.875rem",
    marginTop: "8px"
  },
  
  [theme.breakpoints.between('sm', 'md')]: {
    width: "160px",
    padding: "9px 28px",
    fontSize: "0.9rem"
  },
  
  [theme.breakpoints.up('xl')]: {
    width: "200px",
    padding: "12px 36px",
    fontSize: "1rem"
  }

  
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  width: "180px",
  marginTop: "16px",
  padding: "10px 32px",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
    color: "#FFFFFF",
  },
  
  [theme.breakpoints.down('sm')]: {
    width: "140px",
    padding: "8px 24px",
    fontSize: "0.875rem",
    marginTop: "8px"
  },
  
  [theme.breakpoints.between('sm', 'md')]: {
    width: "160px",
    padding: "9px 28px",
    fontSize: "0.9rem"
  },
  
  [theme.breakpoints.up('xl')]: {
    width: "200px",
    padding: "12px 36px",
    fontSize: "1rem"
  }

  

}));

const getTextFieldStyles = (theme) => ({
  "& label.Mui-focused": {
    color: "#8BD3E6",
    fontWeight: "bold",
  },
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
    borderRadius: "12px",
    boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    [theme.breakpoints.down('sm')]: {
      fontSize: "0.875rem",
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: "1.1rem",
    }
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: "15px",
    color: "#467B89",
    [theme.breakpoints.down('sm')]: {
      fontSize: "0.875rem",
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: "1.1rem",
    }
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
    }
  }
});

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function ForgotPassword() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isXLScreen = useMediaQuery(theme.breakpoints.up('xl'));
  
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const timeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || disabled) return;

    setLoading(true);
    setMessage("");

    axios
      .post("http://localhost:3000/forgot-password", { email })
      .then((response) => {
        setMessage({
          text: "We have sent you an email to reset your password.",
          type: "success",
        });
        setDisabled(true);
        timeoutRef.current = setTimeout(() => {
          setDisabled(false);
        }, 60000);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          setMessage({ text: error.response.data.message, type: "error" });
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDisabled(false);
    }
  };

  const getLogoSize = () => {
    if (isMobile) return "60px";
    if (isTablet) return "75px";
    if (isXLScreen) return "120px";
    return "90px";
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
      <BackgroundContainer>
        <img
          src={SidebarMozartifyLogo}
          alt="MozartifyIcon"
          style={{
            position: "fixed",
            top: isMobile ? 5 : 10,
            left: isMobile ? 5 : 10,
            maxHeight: getLogoSize(),
            zIndex: 10,
            animation: "rotateLogo 5s linear infinite",
            cursor: "pointer"
          }}
          onClick={() => window.location.replace("http://localhost:5173")}
        />
        <FormContainer component="form" onSubmit={handleSubmit}>
          <Typography
            variant={isMobile ? "h6" : isXLScreen ? "h4" : "h5"}
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ 
              fontFamily: "Montserrat", 
              marginBottom: isMobile ? 0.5 : 1 
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant={isMobile ? "body2" : isXLScreen ? "h6" : "body1"}
            align="center"
            color="textSecondary"
            sx={{ 
              fontFamily: "Montserrat", 
              marginBottom: isMobile ? 2 : 3,
              padding: isMobile ? "0 10px" : 0
            }}
          >
            Enter your email to request a password reset link
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            variant="outlined"
            required
            value={email}
            onChange={handleEmailChange}
            sx={getTextFieldStyles(theme)}
          />
          <Typography
            color={message.type === "error" ? "error" : "black"}
            variant={isMobile ? "body2" : "body1"}
            sx={{
              mt: 2,
              fontFamily: "Montserrat",
              textAlign: "center",
              minHeight: "24px",
              fontSize: isMobile ? "0.75rem" : isXLScreen ? "1.1rem" : "0.875rem"
            }}
          >
            {message.text || " "}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: isMobile ? 1 : 2,
              mt: 0,
              flexDirection: "row"
            }}
          >
            <LoginButton to="/login" component={Link}>
              Login
            </LoginButton>
            <SubmitButton type="submit" disabled={loading || disabled}>
              {loading ? (
                <CircularProgress 
                  size={isMobile ? 20 : 24} 
                  sx={{ color: "#FFFFFF" }} 
                />
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