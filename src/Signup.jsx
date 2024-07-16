import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Modal,
  InputAdornment,
  IconButton,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from '@mui/icons-material/VisibilityOff';
import VisibilityOff from '@mui/icons-material/Visibility';
import Image from "./assets/mozartify.png";
import Image2 from "./assets/handrock.png";
import backgroundImage from "./assets/signupWP.png";

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "20px 20px 200px 20px",
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: 80,
  width: "60%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const BackgroundContainer = styled(Box)(() => ({
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  backgroundPosition: "bottom",
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  flexDirection: "row",
  margin: 0,
  overflow: "hidden",
  fontFamily: 'Montserrat',
}));

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`;

const ModalContainer = styled(Box)(() => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#FFFFFF",
  border: "2px solid #483C32",
  borderRadius: 20,
  boxShadow: 24,
  padding: 32,
  width: 400,
  textAlign: "center",
}));

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage("Password must be at least 8 characters long and include both letters and numbers");
      return;
    }
    if (!role) {
      setErrorMessage("Please select a role");
      return;
    }
    setErrorMessage(""); 
    axios
      .post("http://localhost:3000/signup", { username, email, password, role })
      .then((result) => {
        console.log(result);
        setIsModalOpen(true);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundContainer>
        <Grid
          container
          spacing={2}
          sx={{ height: "100%", width: "100%", margin: 0 }}
        >
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ padding: 0 }}
          >
            <FormContainer component="form" onSubmit={handleSubmit}>
              <Typography
                variant="h5"
                align="center"
                fontFamily="Montserrat"
                fontWeight="bold"
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
                label="Email Address"
                margin="normal"
                variant="outlined"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
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
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

              <FormControl component="fieldset" sx={{ mt: 2 }}>
               
                <RadioGroup
                  aria-label="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="customer"
                    control={<Radio required />}
                    label="Customer"
                  />
                  <FormControlLabel
                    value="music_entry_clerk"
                    control={<Radio required />}
                    label="Music Entry Clerk"
                  />
                </RadioGroup>
              </FormControl>

              {errorMessage && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}

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
                Sign Up
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, fontFamily: "Montserrat", color: "#483C32" }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{ textDecoration: "none", color: "#C44131", fontWeight: "bold"}}
                >
                  LOGIN
                </Link>
              </Typography>
            </FormContainer>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "right",
              alignItems: "right",
              margin: 0,
            }}
            style={{ padding: 0 }}
          >
            <Box
              sx={{
                marginLeft: { xs: 0, md: 4 },
                textAlign: "center",
              }}
            >
              <Box sx={{ mt: 2 }} style={{ padding: 0 }}>
                <img src={Image} alt="Mozartify" style={{ width: "50%" }} />
              </Box>
              <Typography
                variant="h3"
                color="white"
                fontWeight="bold"
                align="center"
                sx={{fontFamily: "Montserrat", mt: -3 }}
              >
                Welcome to
                <br />
                Mozartify
              </Typography>
              <Box sx={{ mt: 1 }}>
                <img
                  src={Image2}
                  alt="Mozartify"
                  style={{ width: "100%", maxWidth: "403px" }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </BackgroundContainer>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalContainer>
          <Typography id="modal-title" variant="h6" component="h2">
            Sign-Up Successful!
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Your account has been created successfully. Please check your email
            for the verification link.
          </Typography>
          <Button onClick={handleCloseModal} sx={{ mt: 2 }} variant="contained">
            OK
          </Button>
        </ModalContainer>
      </Modal>
    </>
  );
}
