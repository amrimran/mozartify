import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from "@mui/icons-material/VisibilityOff";
import VisibilityOff from "@mui/icons-material/Visibility";
import backgroundImage from "./assets/loginWP.png";

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

const LeftContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: 20,
  fontFamily: "Montserrat",
  position: "relative",
}));

const HandMusicImage = styled("img")(({ theme }) => ({
  position: "bottom",
  bottom: 0,
  left: 0,
  width: "150%",
  maxWidth: "450px",
}));

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
    axios
      .post("http://localhost:3000/login", { username_or_email, password })
      .then((result) => {
        if (result.data.message === "Success") {

          if (result.data.first_timer === true) {
            navigate("/first-time-login");
          } else if (result.data.role === "customer") {
            navigate("/customer-homepage");
          } else if (result.data.role === "music_entry_clerk") {
            navigate("/clerk-homepage");
          }
         
        } else {
          setErrorMessage("Invalid username/email or password");
        }
      })
      .catch((err) => {
        console.log(err);
        setErrorMessage("Error accessing user database.");
      });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundContainer>
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
              {errorMessage && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Link
                  to="/forgot-password"
                  style={{ textDecoration: "none", color: "#483C32" }}
                >
                  Forgot Password?
                </Link>
              </Box>
              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={{
                  mt: 5,
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
              >
                Login Now
              </Button>
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, fontFamily: "Montserrat", color: "#483C32" }}
              >
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  style={{
                    textDecoration: "none",
                    color: "#C44131",
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
