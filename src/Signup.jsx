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
  useMediaQuery,
  useTheme,
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
  width: "90%", // Default for mobile
  maxWidth: "450px",
  height: "fit-content", // Changed to fit-content
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  margin: "20px",
  padding: "20px",
  boxSizing: "border-box",
  gap: "15px", // Add consistent spacing between elements

  "& > *:last-child": {
    marginBottom: "0", // Ensure last element doesn't add extra space
  },

  // Mobile screens and small height
  [theme.breakpoints.down("sm")]: {
    width: "95%",
    padding: theme.spacing(2),
    margin: "10px",
    "& .MuiTypography-h5": {
      fontSize: "1.2rem",
    },
    "& .MuiTypography-body1": {
      fontSize: "0.9rem",
    },
  },

  // Tablet screens
  [theme.breakpoints.between("sm", "md")]: {
    width: "70%",
    padding: theme.spacing(3),
  },

  // Laptop screens
  [theme.breakpoints.between("md", "lg")]: {
    width: "60%",
    padding: theme.spacing(3, 4),
  },

  // Desktop screens
  [theme.breakpoints.up("lg")]: {
    width: "50%",
    padding: theme.spacing(4),
  },

  // Landscape mode adjustments
  "@media (orientation: landscape) and (max-height: 600px)": {
    padding: theme.spacing(2),
    "& .MuiTextField-root": {
      marginTop: "4px",
      marginBottom: "4px",
    },
  },

  // Small height screens
  "@media (max-height: 700px)": {
    "& .MuiTypography-root": {
      marginBottom: "8px",
    },
    "& .MuiTextField-root": {
      marginTop: "4px",
      marginBottom: "4px",
    },
  },

  // Large height screens
  "@media (min-height: 1000px)": {
    padding: theme.spacing(6),
    justifyContent: "space-around",
  },

  // Add padding to the parent container that holds the form elements
  "& > .MuiBox-root": {
    width: "100%",
    padding: "0 16px",
    boxSizing: "border-box",
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
  padding: "10px",
  boxSizing: "border-box",
  overflowX: "hidden",
  overflowY: "auto",
  fontFamily: "Montserrat",

  // Add responsive padding
  [theme.breakpoints.down("sm")]: {
    padding: "5px",
  },

  [theme.breakpoints.up("sm")]: {
    padding: "10px",
  },

  [theme.breakpoints.up("md")]: {
    padding: "15px",
  },

  // Handle landscape mode
  "@media (orientation: landscape) and (max-height: 600px)": {
    padding: "5px",
  },
}));

const FormElementSpacer = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),

  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1),
  },

  "@media (max-height: 700px)": {
    marginBottom: theme.spacing(1),
  },
}));

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden;
    overflow-y: hidden;
  }
`;

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: "100%",
  maxWidth: "300px",
  padding: theme.spacing(1.5),
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

const ResponsiveLogo = styled("img")(({ theme }) => ({
  position: "fixed",
  top: "10px",
  left: "10px",
  zIndex: 10,
  cursor: "pointer",
  animation: "rotateLogo 5s linear infinite",
  width: "60px", // Default size for mobile
  height: "60px",

  [theme.breakpoints.up("sm")]: {
    width: "70px",
    height: "70px",
  },

  [theme.breakpoints.up("md")]: {
    width: "80px",
    height: "80px",
  },

  [theme.breakpoints.up("lg")]: {
    width: "90px",
    height: "90px",
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
    height: { xs: "40px", sm: "45px" }, // Reduced height
    padding: "0 14px", // Adjusted padding
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: "15px",
    color: "#467B89",
    transform: "translate(14px, 8px) scale(1)", // Adjusted label position
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.75)", // Adjusted shrunk label position
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
  marginTop: "8px", // Reduced margin
  marginBottom: "8px", // Reduced margin
};

const getTextFieldStyles = (theme) => ({
  ...textFieldStyles,
  "& .MuiInputBase-root": {
    ...textFieldStyles["& .MuiInputBase-root"],
    fontSize: {
      xs: "14px",
      sm: "15px",
      md: "16px",
    },
    height: {
      xs: "40px",
      sm: "45px",
      md: "45px",
    },
  },
  "& .MuiFormLabel-root": {
    ...textFieldStyles["& .MuiFormLabel-root"],
    fontSize: {
      xs: "14px",
      sm: "14px",
      md: "15px",
    },
  },
});

export default function Signup() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long and include both letters and numbers"
      );
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
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #8BD3E6;
            border-radius: 3px;
          }
        `}
      </style>
      <GlobalStyle />
      <BackgroundContainer>
        <ResponsiveLogo
          src={SidebarMozartifyLogo}
          alt="MozartifyIcon"
          onClick={() => window.location.replace("http://localhost:5173")}
        />
        <FormContainer component="form" onSubmit={handleSubmit}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            align="center"
            fontFamily="Montserrat"
            fontWeight="bold"
            sx={{
              fontSize: {
                xs: "1.25rem",
                sm: "1.5rem",
                md: "1.75rem",
              },
            }}
          >
            Sign up to <span style={{ color: "#8BD3E6" }}>N.A.S.I.R</span>
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            fontFamily="Montserrat"
            sx={{
              fontSize: {
                xs: "0.875rem",
                sm: "0.9rem",
                md: "1rem",
              },
            }}
          >
            Please fill this form to create an account
          </Typography>

          <Box sx={{ width: "100%", mt: { xs: 1, sm: 2 } }}>
            <FormElementSpacer>
              <TextField
                fullWidth
                label="Username"
                margin="dense"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={getTextFieldStyles(theme)}
              />
            </FormElementSpacer>

            <FormElementSpacer>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={getTextFieldStyles(theme)}
              />
            </FormElementSpacer>

            <FormElementSpacer>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{
                          padding: { xs: "4px", sm: "8px" },
                          "& svg": {
                            fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          },
                        }}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={getTextFieldStyles(theme)}
              />
            </FormElementSpacer>

            <FormElementSpacer>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                margin="normal"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        sx={{
                          padding: { xs: "4px", sm: "8px" },
                          "& svg": {
                            fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          },
                        }}
                      >
                        {showConfirmPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={getTextFieldStyles(theme)}
              />
            </FormElementSpacer>

            <FormControl
              component="fieldset"
              sx={{
                mt: { xs: 1, sm: 2 },
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Montserrat",
                  fontSize: {
                    xs: "0.875rem",
                    sm: "0.9rem",
                    md: "1rem",
                  },
                }}
              >
                Choose one:
              </Typography>

              <RadioGroup
                aria-label="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                row={!isMobile}
                sx={{
                  justifyContent: "center",
                  mt: { xs: 0.5, sm: 1 },
                }}
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
                      sx: {
                        fontFamily: "Montserrat",
                        fontSize: {
                          xs: "0.875rem",
                          sm: "0.9rem",
                          md: "1rem",
                        },
                      },
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
                      sx: {
                        fontFamily: "Montserrat",
                        fontSize: {
                          xs: "0.875rem",
                          sm: "0.9rem",
                          md: "1rem",
                        },
                      },
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
                sx={{
                  fontFamily: "Montserrat",
                  mt: 1,
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.8rem",
                    md: "0.875rem",
                  },
                }}
              >
                {errorMessage}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: { xs: 2, sm: 3 },
              }}
            >
              <CustomButton size={isMobile ? "medium" : "large"} type="submit">
                SIGN UP
              </CustomButton>

              <Typography
                variant="body2"
                align="center"
                sx={{
                  mt: { xs: 1.5, sm: 2 },
                  fontFamily: "Montserrat",
                  color: "#000000",
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.8rem",
                    md: "0.875rem",
                  },
                }}
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
            </Box>
          </Box>
        </FormContainer>
      </BackgroundContainer>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            ...dialogStyles.dialogPaper,
            width: {
              xs: "90%",
              sm: "80%",
              md: "60%",
              lg: "50%",
            },
            maxWidth: "450px",
          },
        }}
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
