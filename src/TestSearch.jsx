import React, { useState } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Typography,
  Container,
  Paper,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { createGlobalStyle } from "styled-components";
import axios from "axios";

function TestSearch() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [searchCriteria, setSearchCriteria] = useState([
    { logic: "AND", category: "All", text: "" },
  ]);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAddRow = () => {
    if (searchCriteria.length < 3) {
      setSearchCriteria([
        ...searchCriteria,
        { logic: "AND", category: "All", text: "" },
      ]);
    }
  };

  const handleDeleteRow = (index) => {
    if (searchCriteria.length > 1) {
      setSearchCriteria(searchCriteria.filter((_, i) => i !== index));
    }
  };

  const handleLogicChange = (index, value) => {
    const updatedCriteria = [...searchCriteria];
    updatedCriteria[index].logic = value;
    setSearchCriteria(updatedCriteria);
  };

  const handleCategoryChange = (index, value) => {
    const updatedCriteria = [...searchCriteria];
    updatedCriteria[index].category = value;
    setSearchCriteria(updatedCriteria);
  };

  const handleTextChange = (index, value) => {
    const updatedCriteria = [...searchCriteria];
    updatedCriteria[index].text = value;
    setSearchCriteria(updatedCriteria);
  };

  const handleClear = () => {
    setSearchCriteria([{ logic: "AND", category: "All", text: "" }]);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("/api/search", {
        collection: selectedCollection,
        criteria: searchCriteria,
      });
      console.log("Search results:", response.data);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

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
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          background: "linear-gradient(90deg, #EFF0FF 21.07%, #E5F4FF 82.23%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        >
          <Paper
            elevation={3}
            sx={{ borderRadius: 4, overflow: "hidden", flex: 1 }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleChange}
              variant="fullWidth"
              TabIndicatorProps={{
                style: { display: "none" },
              }}
            >
              <Tab
                label="Documents"
                sx={{
                  backgroundColor: selectedTab === 0 ? "white" : "#a2bffe",
                  color: selectedTab === 0 ? "black" : "white",
                  fontWeight: "bold",
                  fontFamily: "Montserrat, sans-serif",
                  "&.Mui-selected": {
                    color: "#3B3183",
                  },
                  borderTopRightRadius: selectedTab === 0 ? "5px" : "0px",
                  transition: "border-radius 0.3s ease",
                }}
              />
              <Tab
                label="Composers"
                sx={{
                  backgroundColor: selectedTab === 1 ? "white" : "#a2bffe",
                  color: selectedTab === 1 ? "black" : "white",
                  fontWeight: "bold",
                  fontFamily: "Montserrat, sans-serif",
                  "&.Mui-selected": {
                    color: "#3B3183",
                  },
                }}
              />
            </Tabs>

            <Box sx={{ backgroundColor: "white", padding: 3 }}>
              {selectedTab === 0 && (
                <Box>
                  <Box
                    sx={{
                      border: "1px solid black",
                      padding: 2,
                      mt: 2,
                      ml: 2,
                      display: "inline-block",
                      borderRadius: "5px",
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="black"
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        display: "inline",
                      }}
                    >
                      Search in:
                    </Typography>

                    <Select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      variant="standard"
                      sx={{
                        marginLeft: "10px",
                        border: "none",
                        outline: "none",
                        "& .MuiSelect-select": {
                          padding: 0,
                          fontWeight: "bold",
                        },
                        "& .MuiSelect-icon": {
                          display: "none",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          display: "none",
                        },
                        "&:focus .MuiSelect-select": {
                          borderBottom: `2px solid #FFD700`,
                        },
                      }}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Lecturers">Lecturers</MenuItem>
                      <MenuItem value="Students">Students</MenuItem>
                      <MenuItem value="Freelancers">Freelancers</MenuItem>
                    </Select>
                  </Box>

                  {searchCriteria.map((criteria, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingTop: 3,
                        paddingLeft: 2,
                        paddingRight: 2,
                        mt: 2,
                        gap: 2,
                      }}
                    >
                      {/* New Logic Select Component */}
                      <Select
                        value={criteria.logic}
                        onChange={(e) =>
                          handleLogicChange(index, e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          width: "100px",
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        <MenuItem
                          value="AND"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          AND
                        </MenuItem>
                        <MenuItem
                          value="OR"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          OR
                        </MenuItem>
                        <MenuItem
                          value="NOT"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          NOT
                        </MenuItem>
                      </Select>

                      <Select
                        value={criteria.category}
                        onChange={(e) =>
                          handleCategoryChange(index, e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          width: "150px",
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        <MenuItem
                          value="All"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          All
                        </MenuItem>
                        <MenuItem
                          value="title"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          Title
                        </MenuItem>
                        <MenuItem
                          value="genre"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          Genre
                        </MenuItem>
                        <MenuItem
                          value="composer"
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          Composer
                        </MenuItem>
                      </Select>

                      <TextField
                        variant="outlined"
                        placeholder="Enter text"
                        value={criteria.text}
                        onChange={(e) =>
                          handleTextChange(index, e.target.value)
                        }
                        sx={{
                          flex: 1,
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      />

                      {searchCriteria.length > 1 && (
                        <IconButton
                          onClick={() => handleDeleteRow(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 2,
                      paddingRight: 2,
                      paddingTop: 3,
                    }}
                  >
                    {searchCriteria.length < 3 && (
                      <Button
                        onClick={handleAddRow}
                        variant="outlined"
                        sx={{
                          color: "#3B3183",
                          borderColor: "#3B3183",
                          backgroundColor: "white",
                          fontFamily: "Montserrat, sans-serif",
                          "&:hover": {
                            backgroundColor: "#3B3183",
                            color: "white",
                            borderColor: "#3B3183",
                          },
                        }}
                      >
                        Add Row
                      </Button>
                    )}

                    <Typography
                      component="a"
                      href=""
                      onClick={() => console.log("Link clicked")}
                      sx={{
                        padding: searchCriteria.length >= 3 ? 0 : 3,
                        textDecoration: "underline",
                        cursor: "pointer",
                        color: "#3B3183",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      Advanced Search
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, marginLeft: "auto" }}>
                      <Button
                        onClick={handleClear}
                        variant="outlined"
                        sx={{
                          color: "#3B3183",
                          borderColor: "#3B3183",
                          backgroundColor: "white",
                          fontFamily: "Montserrat, sans-serif",
                          "&:hover": {
                            backgroundColor: "#3B3183",
                            color: "white",
                            borderColor: "#3B3183",
                          },
                        }}
                      >
                        X Clear
                      </Button>

                      <Button
                        onClick={handleSearch}
                        variant="contained"
                        startIcon={<SearchIcon />} // Add Search icon here
                        sx={{
                          color: "white",
                          backgroundColor: "#3B3183",
                          fontFamily: "Montserrat, sans-serif",
                          "&:hover": {
                            backgroundColor: "#3B3183",
                          },
                        }}
                      >
                        Search
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default TestSearch;
