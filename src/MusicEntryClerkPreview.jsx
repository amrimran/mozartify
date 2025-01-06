import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Avatar, Pagination, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import ABCJS from "abcjs";
import axios from "axios";
import { Divider } from "@mui/material";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const buttonStyles = {
  px: 10,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  borderColor: "#8BD3E6",
  "&:hover": {
    backgroundColor: "#3B3183",
    color: "#FFFFFF",
    border: "1px solid #3B3183",
    borderColor: "#3B3183",
  },
};

export default function MusicEntryClerkPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state || {};
  const [abcContent, setAbcContent] = useState('');
  const [splitContent, setSplitContent] = useState([]);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch ABC file content
  useEffect(() => {
    if (fileName) {
      const fetchABCFileContent = async () => {
        try {
          const response = await fetch(`http://localhost:3001/abc-file/${fileName}`);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setAbcContent(data.content);
        } catch (error) {
          console.error("Error fetching ABC file content:", error);
        }
      };

      fetchABCFileContent();
    }
  }, [fileName]);

  // Split ABC content into pages
  useEffect(() => {
    if (abcContent) {
      const lines = abcContent.split("\n");
      const maxLinesPerPage = 20; // Adjust this value as needed
      const pages = [];
      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pages.push(lines.slice(i, i + maxLinesPerPage).join("\n"));
      }
      setSplitContent(pages);
    }
  }, [abcContent]);

  // Render ABC content for the current page
  useEffect(() => {
    if (splitContent.length > 0) {
      const currentPageContent = splitContent[page - 1] || "";
      if (currentPageContent.trim() !== "") {
        ABCJS.renderAbc("abc-render", currentPageContent);
      }
    }
  }, [splitContent, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = () => {
    navigate("/clerk-edit", { state: { fileName } });
  };

  const handleProceed = () => {
    navigate("/clerk-catalog", { state: { fileName } });
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Box
          sx={{
            width: 225,
            bgcolor: "#3B3183",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          <ClerkSidebar active="upload" />
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, pl: 5, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontFamily: "Montserrat", fontWeight: "bold", mt: 4, ml: 1 }}
            >
              Preview Music Scores
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
                {user ? user.username : "Loading..."}
              </Typography>
              <Avatar>{user ? user.username[0] : "U"}</Avatar>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {splitContent[page - 1] && splitContent[page - 1].trim() !== "" ? (
            <Paper
              elevation={3}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 4,
                bgcolor: "#ffffff",
                textAlign: "center",
                maxWidth: "800px",
                margin: "0 auto",
                minHeight: "300px",
                mb: 3,
              }}
            >
              <div id="abc-render"></div>
            </Paper>
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 3, fontFamily: "Montserrat" }}>
              No content on this page.
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>

          <Pagination
            count={splitContent.length}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 2,
                fontFamily: "Montserrat",
                backgroundColor: "primary",
                color: "#000",
                "&.Mui-selected": {
                  backgroundColor: "#8BD3E6",
                  color: "#fff",
                },
                "&:hover": {
                  backgroundColor: "#FFEE8C",
                },
              },
            }}
          />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{ flexGrow: 1, mx: 1, ...buttonStyles }}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ flexGrow: 1, mx: 1, ...buttonStyles }}
              onClick={handleProceed}
            >
              Proceed
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
