import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar"; // Adjust the path as needed
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase storage methods

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const formStyles = {
  mt: 2,
  mb: 2,
  fontFamily: "Montserrat",
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
  const username = "Nifail Amsyar";
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [coverImage, setCoverImage] = useState(null); // State for storing the cover image file
  const [coverImageUrl, setCoverImageUrl] = useState("No information available"); // State for storing the cover image URL
  const [catalogData, setCatalogData] = useState({
    filename: 'No information available',
    title: 'No information available',
    albums: 'No information available',
    alternativeTitle: 'No information available',
    artist: 'No information available',
    backgroundResources: 'No information available',
    callNumber: 'No information available',
    composer: 'No information available',
    composerTimePeriod: 'No information available',
    contributor: 'No information available',
    copyright: 'No information available',
    cosmeticsAndProp: 'No information available',
    county: 'No information available',
    creator: 'No information available',
    dateAccessioned: 'No information available',
    dateAvailable: 'No information available',
    dateIssued: 'No information available',
    dateOfBirth: 'No information available',
    dateOfCreation: 'No information available',
    dateOfRecording: 'No information available',
    description: 'No information available',
    digitalCollection: 'No information available',
    edition: 'No information available',
    editor: 'No information available',
    ethnicGroup: 'No information available',
    firstPublication: 'No information available',
    format: 'No information available',
    gamutScale: 'No information available',
    genre: 'No information available',
    historicalContext: 'No information available',
    identifier: 'No information available',
    instrumentation: 'No information available',
    intention: 'No information available',
    key: 'No information available',
    language: 'No information available',
    lastModified: 'No information available',
    length: 'No information available',
    librettist: 'No information available',
    lyrics: 'No information available',
    melodicClassification: 'No information available',
    melodyDescriptions: 'No information available',
    methodOfImplementation: 'No information available',
    miscNotes: 'No information available',
    movementsSections: 'No information available',
    notation: 'No information available',
    numberInPublication: 'No information available',
    objectCollections: 'No information available',
    occasionOfPerforming: 'No information available',
    performingSkills: 'No information available',
    permalink: 'No information available',
    pieceStyle: 'No information available',
    placeOfBirth: 'No information available',
    placeOfOrigin: 'No information available',
    placeOfProsper: 'No information available',
    placeOfResidence: 'No information available',
    position: 'No information available',
    prevalence: 'No information available',
    publisher: 'No information available',
    purposeOfCreation: 'No information available',
    recordingPerson: 'No information available',
    region: 'No information available',
    relatedArtists: 'No information available',
    relatedWork: 'No information available',
    rights: 'No information available',
    sheetMusic: 'No information available',
    sponsor: 'No information available',
    stagePerformance: 'No information available',
    subject: 'No information available',
    targetAudience: 'No information available',
    temperament: 'No information available',
    timeOfOrigin: 'No information available',
    timeOfProsper: 'No information available',
    trackFunction: 'No information available',
    tracks: 'No information available',
    type: 'No information available',
    uri: 'No information available',
    vocalStyle: 'No information available',
    westernParallel: 'No information available',
    workTitle: 'No information available',
    yearDateOfComposition: 'No information available',
    coverImageUrl: 'No information available', // New attribute for cover image URL
  });

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
      uploadBytes(storageRef, coverImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setCoverImageUrl(url);
          setCatalogData((prevData) => ({
            ...prevData,
            coverImageUrl: url,
          }));
          alert("Cover image uploaded successfully!");
        });
      }).catch((error) => {
        console.error("Error uploading cover image:", error);
        alert("Error uploading cover image");
      });
    } else {
      alert("Please select a cover image to upload.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catalogData.filename) {
      alert('Filename is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(catalogData),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      alert('Data saved successfully');
      navigate('/clerk-homepage');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <ClerkSidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontFamily: "Montserrat" }}>
              Catalog Metadata
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="catalog tabs">
            <Tab label="Identification" />
            <Tab label="Details" />
            <Tab label="Dates" />
            <Tab label="Publication" />
            <Tab label="Description" />
            <Tab label="Performance" />
            <Tab label="Location" />
            <Tab label="Related Work" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {tabIndex === 0 && (
              <>
                <TextField name="filename" label="Filename" variant="outlined" fullWidth sx={formStyles} value={catalogData.filename} onChange={handleInputChange} required />
                <TextField name="title" label="Title" variant="outlined" fullWidth sx={formStyles} value={catalogData.title} onChange={handleInputChange} />
                <TextField name="alternativeTitle" label="Alternative Title" variant="outlined" fullWidth sx={formStyles} value={catalogData.alternativeTitle} onChange={handleInputChange} />
                <TextField name="identifier" label="Identifier" variant="outlined" fullWidth sx={formStyles} value={catalogData.identifier} onChange={handleInputChange} />
                <TextField name="uri" label="URI" variant="outlined" fullWidth sx={formStyles} value={catalogData.uri} onChange={handleInputChange} />
                <TextField name="permalink" label="Permalink" variant="outlined" fullWidth sx={formStyles} value={catalogData.permalink} onChange={handleInputChange} />
                <TextField name="artist" label="Artist(s)" variant="outlined" fullWidth sx={formStyles} value={catalogData.artist} onChange={handleInputChange} />
                <TextField name="composer" label="Composer" variant="outlined" fullWidth sx={formStyles} value={catalogData.composer} onChange={handleInputChange} />
                <TextField name="contributor" label="Contributor" variant="outlined" fullWidth sx={formStyles} value={catalogData.contributor} onChange={handleInputChange} />
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
                <Button
                  variant="outlined"
                  sx={buttonStyles}
                  onClick={handleCoverImageUpload}
                >
                  Upload Cover Image
                </Button>
              </>
            )}
            {tabIndex === 1 && (
              <>
                <TextField name="albums" label="Albums" variant="outlined" fullWidth sx={formStyles} value={catalogData.albums} onChange={handleInputChange} />
                <TextField name="backgroundResources" label="Background Resources" variant="outlined" fullWidth sx={formStyles} value={catalogData.backgroundResources} onChange={handleInputChange} />
                <TextField name="callNumber" label="Call Number" variant="outlined" fullWidth sx={formStyles} value={catalogData.callNumber} onChange={handleInputChange} />
                <TextField name="composerTimePeriod" label="Composer Time Period" variant="outlined" fullWidth sx={formStyles} value={catalogData.composerTimePeriod} onChange={handleInputChange} />
                <TextField name="copyright" label="Copyright" variant="outlined" fullWidth sx={formStyles} value={catalogData.copyright} onChange={handleInputChange} />
                <TextField name="cosmeticsAndProp" label="Cosmetics and Prop" variant="outlined" fullWidth sx={formStyles} value={catalogData.cosmeticsAndProp} onChange={handleInputChange} />
                <TextField name="county" label="County" variant="outlined" fullWidth sx={formStyles} value={catalogData.county} onChange={handleInputChange} />
                <TextField name="creator" label="Creator" variant="outlined" fullWidth sx={formStyles} value={catalogData.creator} onChange={handleInputChange} />
                <TextField name="digitalCollection" label="Digital Collection" variant="outlined" fullWidth sx={formStyles} value={catalogData.digitalCollection} onChange={handleInputChange} />
                <TextField name="edition" label="Edition" variant="outlined" fullWidth sx={formStyles} value={catalogData.edition} onChange={handleInputChange} />
                <TextField name="editor" label="Editor" variant="outlined" fullWidth sx={formStyles} value={catalogData.editor} onChange={handleInputChange} />
                <TextField name="ethnicGroup" label="Ethnic Group" variant="outlined" fullWidth sx={formStyles} value={catalogData.ethnicGroup} onChange={handleInputChange} />
                <TextField name="firstPublication" label="First Publication" variant="outlined" fullWidth sx={formStyles} value={catalogData.firstPublication} onChange={handleInputChange} />
                <TextField name="format" label="Format" variant="outlined" fullWidth sx={formStyles} value={catalogData.format} onChange={handleInputChange} />
                <TextField name="gamutScale" label="Gamut Scale" variant="outlined" fullWidth sx={formStyles} value={catalogData.gamutScale} onChange={handleInputChange} />
                <TextField name="genre" label="Genre" variant="outlined" fullWidth sx={formStyles} value={catalogData.genre} onChange={handleInputChange} />
                <TextField name="historicalContext" label="Historical Context" variant="outlined" fullWidth sx={formStyles} value={catalogData.historicalContext} onChange={handleInputChange} />
                <TextField name="identifier" label="Identifier" variant="outlined" fullWidth sx={formStyles} value={catalogData.identifier} onChange={handleInputChange} />
                <TextField name="instrumentation" label="Instrumentation" variant="outlined" fullWidth sx={formStyles} value={catalogData.instrumentation} onChange={handleInputChange} />
                <TextField name="intention" label="Intention" variant="outlined" fullWidth sx={formStyles} value={catalogData.intention} onChange={handleInputChange} />
                <TextField name="key" label="Key" variant="outlined" fullWidth sx={formStyles} value={catalogData.key} onChange={handleInputChange} />
                <TextField name="language" label="Language" variant="outlined" fullWidth sx={formStyles} value={catalogData.language} onChange={handleInputChange} />
                <TextField name="lyrics" label="Lyrics" variant="outlined" fullWidth sx={formStyles} value={catalogData.lyrics} onChange={handleInputChange} />
              </>
            )}
            {/* Add more tabs as needed */}
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
