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
  const [catalogData, setCatalogData] = useState({
    filename: '',
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
            {tabIndex === 2 && (
              <>
                <TextField name="dateAccessioned" label="Date Accessioned" variant="outlined" fullWidth sx={formStyles} value={catalogData.dateAccessioned} onChange={handleInputChange} />
                <TextField name="dateAvailable" label="Date Available" variant="outlined" fullWidth sx={formStyles} value={catalogData.dateAvailable} onChange={handleInputChange} />
                <TextField name="dateIssued" label="Date Issued" variant="outlined" fullWidth sx={formStyles} value={catalogData.dateIssued} onChange={handleInputChange} />
                <TextField name="dateOfBirth" label="Date of Birth" variant="outlined" fullWidth sx={formStyles} value={catalogData.dateOfBirth} onChange={handleInputChange} />
                <TextField name="dateOfCreation" label="Date of Creation" variant="outlined" fullWidth sx={formStyles} value={catalogData.dateOfCreation} onChange={handleInputChange} />
                <TextField name="dateOfRecording" label="Date of Recording (medium)" variant="outlined" fullWidth sx={formStyles} value={catalogData.dateOfRecording} onChange={handleInputChange} />
                <TextField name="lastModified" label="Last Modified" variant="outlined" fullWidth sx={formStyles} value={catalogData.lastModified} onChange={handleInputChange} />
                <TextField name="yearDateOfComposition" label="Year/Date of Composition" variant="outlined" fullWidth sx={formStyles} value={catalogData.yearDateOfComposition} onChange={handleInputChange} />
              </>
            )}
            {tabIndex === 3 && (
              <>
                <TextField name="publisher" label="Publisher" variant="outlined" fullWidth sx={formStyles} value={catalogData.publisher} onChange={handleInputChange} />
                <TextField name="rights" label="Rights" variant="outlined" fullWidth sx={formStyles} value={catalogData.rights} onChange={handleInputChange} />
              </>
            )}
            {tabIndex === 4 && (
              <>
                <TextField name="description" label="Description" variant="outlined" fullWidth multiline rows={4} sx={formStyles} value={catalogData.description} onChange={handleInputChange} />
                <TextField name="historicalContext" label="Historical Context" variant="outlined" fullWidth multiline rows={4} sx={formStyles} value={catalogData.historicalContext} onChange={handleInputChange} />
                <TextField name="miscNotes" label="Misc. Notes" variant="outlined" fullWidth sx={formStyles} value={catalogData.miscNotes} onChange={handleInputChange} />
                <TextField name="methodOfImplementation" label="Method of Implementation" variant="outlined" fullWidth sx={formStyles} value={catalogData.methodOfImplementation} onChange={handleInputChange} />
              </>
            )}
            {tabIndex === 5 && (
              <>
                <TextField name="occasionOfPerforming" label="Occasion of Performing" variant="outlined" fullWidth sx={formStyles} value={catalogData.occasionOfPerforming} onChange={handleInputChange} />
                <TextField name="performingSkills" label="Performing Skills" variant="outlined" fullWidth sx={formStyles} value={catalogData.performingSkills} onChange={handleInputChange} />
                <TextField name="stagePerformance" label="Stage Performance" variant="outlined" fullWidth sx={formStyles} value={catalogData.stagePerformance} onChange={handleInputChange} />
              </>
            )}
            {tabIndex === 6 && (
              <>
                <TextField name="placeOfBirth" label="Place of Birth" variant="outlined" fullWidth sx={formStyles} value={catalogData.placeOfBirth} onChange={handleInputChange} />
                <TextField name="placeOfOrigin" label="Place of Origin" variant="outlined" fullWidth sx={formStyles} value={catalogData.placeOfOrigin} onChange={handleInputChange} />
                <TextField name="placeOfProsper" label="Place of Prosper" variant="outlined" fullWidth sx={formStyles} value={catalogData.placeOfProsper} onChange={handleInputChange} />
                <TextField name="placeOfResidence" label="Place of Residence" variant="outlined" fullWidth sx={formStyles} value={catalogData.placeOfResidence} onChange={handleInputChange} />
              </>
            )}
            {tabIndex === 7 && (
              <>
                <TextField name="relatedWork" label="Related Work" variant="outlined" fullWidth sx={formStyles} value={catalogData.relatedWork} onChange={handleInputChange} />
              </>
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
