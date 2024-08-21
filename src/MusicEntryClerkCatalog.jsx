import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios"; // Import axios for session handling

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const formStyles = {
  mb: 2,
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
  },
};

const buttonStyles = {
  px: 10,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#3B3183",
  borderColor: "#3B3183",
  "&:hover": {
    backgroundColor: "#3B3183",
    color: "#FFFFFF",
    borderColor: "#3B3183",
  },
};

export default function MusicEntryClerkCatalog() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState("No information available");
  const [catalogData, setCatalogData] = useState({
    filename: "",
    title: "",
    albums: "",
    alternativeTitle: "",
    artist: "",
    backgroundResources: "",
    callNumber: "",
    composer: "",
    composerTimePeriod: "",
    contributor: "",
    copyright: "",
    cosmeticsAndProp: "",
    county: "",
    creator: "",
    dateAccessioned: "",
    dateAvailable: "",
    dateIssued: "",
    dateOfBirth: "",
    dateOfCreation: "",
    dateOfRecording: "",
    description: "",
    digitalCollection: "",
    edition: "",
    editor: "",
    ethnicGroup: "",
    firstPublication: "",
    format: "",
    gamutScale: "",
    genre: "",
    historicalContext: "",
    identifier: "",
    instrumentation: "",
    intention: "",
    key: "",
    language: "",
    lastModified: "",
    length: "",
    librettist: "",
    lyrics: "",
    melodicClassification: "",
    melodyDescriptions: "",
    methodOfImplementation: "",
    miscNotes: "",
    movementsSections: "",
    notation: "",
    numberInPublication: "",
    objectCollections: "",
    occasionOfPerforming: "",
    performingSkills: "",
    permalink: "",
    pieceStyle: "",
    placeOfBirth: "",
    placeOfOrigin: "",
    placeOfProsper: "",
    placeOfResidence: "",
    position: "",
    prevalence: "",
    publisher: "",
    purposeOfCreation: "",
    recordingPerson: "",
    region: "",
    relatedArtists: "",
    relatedWork: "",
    rights: "",
    sheetMusic: "",
    sponsor: "",
    stagePerformance: "",
    subject: "",
    targetAudience: "",
    temperament: "",
    timeOfOrigin: "",
    timeOfProsper: "",
    trackFunction: "",
    tracks: "",
    type: "",
    uri: "",
    vocalStyle: "",
    westernParallel: "",
    workTitle: "",
    yearDateOfComposition: "",
    coverImageUrl: "", // New attribute for cover image URL
  });
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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatalogData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (tabIndex < 7) {
      setTabIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleCoverImageChange = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleCoverImageUpload = () => {
    if (coverImage) {
      const storageRef = ref(storage, `cover_images/${coverImage.name}`);
      uploadBytes(storageRef, coverImage)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            setCoverImageUrl(url);
            setCatalogData((prevData) => ({
              ...prevData,
              coverImageUrl: url,
            }));
            alert("Cover image uploaded successfully!");
          });
        })
        .catch((error) => {
          console.error("Error uploading cover image:", error);
          alert("Error uploading cover image");
        });
    } else {
      alert("Please select a cover image to upload.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set default value "No information available" for empty fields
    const filledCatalogData = { ...catalogData };
    for (const key in filledCatalogData) {
      if (!filledCatalogData[key]) {
        filledCatalogData[key] = "No information available";
      }
    }

    try {
      const response = await fetch("http://localhost:3001/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filledCatalogData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      alert("Data saved successfully");
      navigate("/clerk-homepage");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
    }
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex" }}>
        <Box 
          sx={{ 
            width: "225px", 
            height: "100vh", 
            position: "fixed", 
            top: 0, 
            left: 0, 
            backgroundColor: "#3B3183",
            overflowY: "auto" 
          }}>
          <ClerkSidebar active="upload" />
        </Box>
        <Box sx={{ flexGrow: 1, ml: "225px", p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, ml:1 }}>
              Catalog Metadata
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
                {user ? user.username : 'User'}
              </Typography>
              <Avatar>{user ? user.username[0] : 'U'}</Avatar>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="catalog tabs"
            sx={{ mb: 3, fontFamily: "Montserrat" }}
          >
            <Tab label="Identification" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Details" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Dates" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Publication" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Description" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Performance" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Location" sx={{ fontFamily: "Montserrat" }} />
            <Tab label="Related Work" sx={{ fontFamily: "Montserrat" }} />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {tabIndex === 0 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="filename"
                      label="Filename"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.filename}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="title"
                      label="Title"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.title}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="alternativeTitle"
                      label="Alternative Title"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.alternativeTitle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="identifier"
                      label="Identifier"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.identifier}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="uri"
                      label="URI"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.uri}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="permalink"
                      label="Permalink"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.permalink}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="artist"
                      label="Artist(s)"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.artist}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="composer"
                      label="Composer"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.composer}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="coverImage"
                      label="Cover Image"
                      type="file"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      sx={formStyles}
                      onChange={handleCoverImageChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="contributor"
                      label="Contributor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.contributor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 1 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="albums"
                      label="Albums"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.albums}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="backgroundResources"
                      label="Background Resources"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.backgroundResources}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="callNumber"
                      label="Call Number"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.callNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="composerTimePeriod"
                      label="Composer Time Period"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.composerTimePeriod}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="copyright"
                      label="Copyright"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.copyright}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="cosmeticsAndProp"
                      label="Cosmetics and Prop"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.cosmeticsAndProp}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="county"
                      label="County"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.county}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="creator"
                      label="Creator"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.creator}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="digitalCollection"
                      label="Digital Collection"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.digitalCollection}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="edition"
                      label="Edition"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.edition}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="editor"
                      label="Editor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.editor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="ethnicGroup"
                      label="Ethnic Group"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.ethnicGroup}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="firstPublication"
                      label="First Publication"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.firstPublication}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="format"
                      label="Format"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.format}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="gamutScale"
                      label="Gamut Scale"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.gamutScale}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="genre"
                      label="Genre"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.genre}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="historicalContext"
                      label="Historical Context"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.historicalContext}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="identifier"
                      label="Identifier"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.identifier}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="instrumentation"
                      label="Instrumentation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.instrumentation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="intention"
                      label="Intention"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.intention}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="key"
                      label="Key"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.key}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="language"
                      label="Language"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.language}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="lyrics"
                      label="Lyrics"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.lyrics}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 2 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dateAccessioned"
                      label="Date Accessioned"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.dateAccessioned}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dateAvailable"
                      label="Date Available"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.dateAvailable}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dateIssued"
                      label="Date Issued"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.dateIssued}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dateOfBirth"
                      label="Date of Birth"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dateOfCreation"
                      label="Date of Creation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.dateOfCreation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="dateOfRecording"
                      label="Date of Recording"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.dateOfRecording}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 3 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="firstPublication"
                      label="First Publication"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.firstPublication}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="edition"
                      label="Edition"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.edition}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="publisher"
                      label="Publisher"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.publisher}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="rights"
                      label="Rights"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.rights}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 4 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="description"
                      label="Description"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.description}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="genre"
                      label="Genre"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.genre}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="format"
                      label="Format"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.format}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="subject"
                      label="Subject"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.subject}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="language"
                      label="Language"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.language}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="notation"
                      label="Notation"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.notation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="key"
                      label="Key"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.key}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 5 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="performingSkills"
                      label="Performing Skills"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.performingSkills}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="pieceStyle"
                      label="Piece Style"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.pieceStyle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="occasionOfPerforming"
                      label="Occasion of Performing"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.occasionOfPerforming}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="targetAudience"
                      label="Target Audience"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.targetAudience}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 6 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfOrigin"
                      label="Place of Origin"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfOrigin}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfBirth"
                      label="Place of Birth"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfBirth}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfResidence"
                      label="Place of Residence"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfResidence}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="placeOfProsper"
                      label="Place of Prosper"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.placeOfProsper}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="timeOfOrigin"
                      label="Time of Origin"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.timeOfOrigin}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="timeOfProsper"
                      label="Time of Prosper"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.timeOfProsper}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
              {tabIndex === 7 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="relatedArtists"
                      label="Related Artists"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.relatedArtists}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="relatedWork"
                      label="Related Work"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.relatedWork}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="contributor"
                      label="Contributor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.contributor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="cosmeticsAndProp"
                      label="Cosmetics and Prop"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.cosmeticsAndProp}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="sponsor"
                      label="Sponsor"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.sponsor}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="miscNotes"
                      label="Misc Notes"
                      variant="outlined"
                      fullWidth
                      sx={formStyles}
                      value={catalogData.miscNotes}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            {tabIndex === 0 && (
              <Button
                variant="outlined"
                sx={buttonStyles}
                onClick={handleCoverImageUpload}
              >
                Upload Cover Image
              </Button>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={buttonStyles}
              >
                Save Metadata
              </Button>
              {tabIndex < 7 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNext}
                  sx={{ ...buttonStyles, ml: 2 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
