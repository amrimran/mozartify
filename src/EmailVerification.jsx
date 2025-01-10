import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Modal,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import verifiedBackground from "./assets/verified.jpg";
import frustBackground from "./assets/frust.jpg";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const buttonStyle = {
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

  useEffect(() => {
    // Add styles to body and html to prevent scrolling
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const checkApprovalStatus = async () => {
      try {
        if (!token) {
          setStatus("error");
          setErrorMessage("No verification token found");
          return;
        }

        const response = await fetch(
          `http://localhost:3000/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setStatus("verified");
        } else {
          const errorData = await response.json();
          if (
            response.status === 400 &&
            errorData.message === "Invalid or expired token"
          ) {
            setStatus("expired");
            setErrorMessage("Link expired. Please request a new one.");
          } else {
            setStatus("error");
            setErrorMessage(errorData.message || "Unable to verify email");
          }
        }
      } catch (err) {
        console.error("Error checking approval status:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    checkApprovalStatus();

    // Cleanup function to remove styles when component unmounts
    return () => {
      document.body.style.margin = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Box>
            <CircularProgress />
            <Typography variant="h6" mt={2} sx={{ fontFamily: "Montserrat" }}>
              Verifying your email...
            </Typography>
          </Box>
        );

      case "verified":
        return (
          <Box>
            <Alert
              severity="success"
              sx={{
                marginBottom: "16px",
                fontFamily: "Montserrat",
                border: "none",
                boxShadow: "none",
              }}
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            >
              Email verified. Welcome to the team!
            </Alert>
            <Button
              sx={{ ...buttonStyle, marginTop: "10px" }}
              onClick={() => navigate("/login")}
            >
              Go to Login Page
            </Button>
          </Box>
        );

      case "expired":
        return (
          <Box>
            <Alert
              severity="warning"
              sx={{
                marginBottom: "16px",
                fontFamily: "Montserrat",
                border: "none",
                boxShadow: "none",
              }}
            >
              {errorMessage}
            </Alert>
            <Button sx={{ ...buttonStyle }} onClick={() => navigate("/signup")}>
              Request New Link
            </Button>
          </Box>
        );

      case "error":
        return (
          <Box>
            <Alert
              severity="error"
              sx={{
                marginBottom: "16px",
                fontFamily: "Montserrat",
                border: "none",
                boxShadow: "none",
              }}
            >
              {errorMessage}
            </Alert>
          </Box>
        );

      default:
        return (
          <Alert severity="warning" sx={{ fontFamily: "Montserrat" }}>
            Your account is not yet verified. Please contact support.
          </Alert>
        );
    }
  };

  const getBackgroundImage = () => {
    return status === "verified" ? verifiedBackground : frustBackground;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        margin: 0,
        padding: 0,
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          boxShadow: 6,
        }}
      >
        <Typography
          id="email-verification-title"
          variant="h5"
          sx={{
            color: "black",
            fontWeight: "bold",
            marginBottom: "16px",
            fontFamily: "Montserrat",
          }}
        >
          Email Verification
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default EmailVerification;
