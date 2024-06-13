import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  ListItemButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddIcon from "@mui/icons-material/Add";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import { styled } from "@mui/material/styles";

// Custom styled component for the icon
const CustomAddIcon = styled(AddIcon)(({ theme }) => ({
  backgroundColor: "#c44131",
  color: "white",
  borderRadius: "50%",
  padding: theme.spacing(0.5),
}));

export default function CustomerInbox() {
  const username = "Nifail Amsyar"; // Replace with dynamic username

  const navigate = useNavigate();

  const navigationItems = [
    { path: "/customer-homepage", label: "My Dashboard", icon: <HomeIcon /> },
    {
      path: "/customer-library",
      label: "Libraries",
      icon: <LibraryBooksIcon />,
    },
    {
      path: "/customer-favourites",
      label: "Favourites",
      icon: <FavoriteIcon />,
    },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCartIcon /> },
    { path: "/customer-inbox", label: "Inbox", icon: <FeedbackIcon /> },
    {
      path: "/customer-profile",
      label: "Customer Profile",
      icon: <AccountCircleIcon />,
    },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon /> },
  ];

  const feedbackData = [
    {
      id: "IN001",
      username: "Nifail Amsyar",
      title: "Bug on payment",
      detail: "Error when purchasing...",
      attachment: "IMG_001",
    },
    {
      id: "IN002",
      username: "Wan Amaer",
      title: "Dashboard error",
      detail: "I found an error when displaying...",
      attachment: "IMG_002",
    },
    {
      id: "IN003",
      username: "Ali Rahman",
      title: "Login Issue",
      detail: "Unable to login with correct credentials...",
      attachment: "IMG_003",
    },
    {
      id: "IN004",
      username: "Sarah Lee",
      title: "Performance Lag",
      detail: "App performance is very slow...",
      attachment: "IMG_004",
    },
    {
      id: "IN005",
      username: "John Doe",
      title: "Crash on Start",
      detail: "App crashes immediately after starting...",
      attachment: "IMG_005",
    },
  ];

  const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: 225, bgcolor: "#E4DCC8", p: 2 }}>
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pt: 5,
            }}
          >
            <img
              src={SidebarMozartifyLogo}
              alt="MozartifyIcon"
              style={{ maxWidth: "100%", maxHeight: "48px" }}
            />

            <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
              Mozartify
            </Typography>
          </Box>
          <List>
            {navigationItems.map((item) => (
              <Link
                to={item.path}
                style={{ textDecoration: "none" }}
                key={item.path}
              >
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4">Inbox</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>

          <Box>
            <Divider />

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() =>
                  navigate(`/customer-inbox/customer-add-new-feedback`)
                }
                sx={{
                  backgroundColor: "#F4F7FE",
                  color: "#000", // Adjust text color if needed
                  "&:hover": {
                    backgroundColor: "#E0E5F2",
                  },
                  fontFamily: "Montserrat, sans-serif",
                  textTransform: "none",
                }}
                startIcon={<CustomAddIcon />}
              >
                Add New Feedback
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead
                    sx={{ color: "black", backgroundColor: "#E4DCC8" }}
                  >
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Detail</TableCell>
                      <TableCell>Attachment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedbackData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.id}
                        </TableCell>
                        <TableCell>{row.username}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.detail}</TableCell>
                        <TableCell>
                          <a
                            href={`#${row.attachment}`}
                            style={{ color: "red" }}
                          >
                            {row.attachment}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
