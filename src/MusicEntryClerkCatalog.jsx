import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
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

export default function MusicEntryClerkCatalog() {
  const username = "Nifail Amsyar";
  const navigate = useNavigate();
  const location = useLocation();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleNext = () => {
    setTabIndex((prevIndex) => prevIndex + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const metadata = Object.fromEntries(formData.entries());
    metadata.filePath = location.state.file; // Add file path to metadata

    fetch("http://localhost:3002/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    })
      .then((response) => {
        if (response.ok) {
          alert("Metadata saved successfully!");
          navigate("/clerk-homepage");
        } else {
          alert("Error saving metadata");
        }
      })
      .catch((error) => {
        console.error("Error saving metadata:", error);
      });
  };

  const Identification = () => (
    <>
      <TextField name="title" label="Title" variant="outlined" required fullWidth sx={formStyles} />
      <TextField name="alternativeTitle" label="Alternative Title" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="identifier" label="Identifier" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="uri" label="URI" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="permalink" label="Permalink" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const PeopleAndContributors = () => (
    <>
      <TextField name="artist" label="Artist(s)" variant="outlined" required fullWidth sx={formStyles} />
      <TextField name="composer" label="Composer" variant="outlined" required fullWidth sx={formStyles} />
      <TextField name="contributor" label="Contributor" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="creator" label="Creator" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="editor" label="Editor" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="librettist" label="Librettist" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="recordingPerson" label="Recording Person" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="relatedArtists" label="Related Artists" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const Dates = () => (
    <>
      <TextField name="dateAccessioned" label="Date Accessioned" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="dateAvailable" label="Date Available" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="dateIssued" label="Date Issued" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="dateOfBirth" label="Date of Birth" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="dateOfCreation" label="Date of Creation" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="dateOfRecording" label="Date of Recording (medium)" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="firstPublication" label="First Publication" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="lastModified" label="Last Modified" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="yearDateOfComposition" label="Year/Date of Composition" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const PublicationAndRights = () => (
    <>
      <TextField name="callNumber" label="Call number" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="copyright" label="Copyright" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="edition" label="Edition" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="publisher" label="Publisher" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="rights" label="Rights" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const DescriptionAndContext = () => (
    <>
      <TextField name="description" label="Description" variant="outlined" fullWidth multiline rows={4} sx={formStyles} />
      <TextField name="historicalContext" label="Historical Context" variant="outlined" fullWidth multiline rows={4} sx={formStyles} />
      <TextField name="backgroundResources" label="Background Resources" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="miscNotes" label="Misc. Notes" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="methodOfImplementation" label="Method of implementation" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="cosmeticsAndProp" label="Cosmetics and Prop" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="ethnicGroup" label="Ethnic Group" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="gamutScale" label="Gamut Scale" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="melodicClassification" label="Melodic Classification" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="melodyDescriptions" label="Melody Descriptions" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="notation" label="Notation" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="purposeOfCreation" label="Purpose of Creation" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="sponsor" label="Sponsor" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const MusicSpecificDetails = () => (
    <>
      <TextField name="albums" label="Albums" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="genre" label="Genre" variant="outlined" required fullWidth sx={formStyles} />
      <TextField name="instrumentation" label="Instrumentation" variant="outlined" required fullWidth sx={formStyles} />
      <TextField name="key" label="Key" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="language" label="Language" variant="outlined" fullWidth sx={formStyles} />
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          Lyrics
        </Typography>
        <RadioGroup row name="lyricsProvided">
          <FormControlLabel value="true" control={<Radio />} label="Provided" />
          <FormControlLabel value="false" control={<Radio />} label="Not Provided" />
        </RadioGroup>
      </Box>
      <TextField name="movementsSections" label="Movements/Sections" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="pieceStyle" label="Piece Style" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="trackFunction" label="Track function" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="tracks" label="Tracks" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="type" label="Type" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="vocalStyle" label="Vocal Style" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="westernParallel" label="Western Parallel" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="workTitle" label="Work Title" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="sheetMusic" label="Sheet Music" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const Locations = () => (
    <>
      <TextField name="county" label="County" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="placeOfBirth" label="Place of Birth" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="placeOfOrigin" label="Place of Origin" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="placeOfProsper" label="Place of Prosper" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="placeOfResidence" label="Place of Residence" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="region" label="Region" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="timeOfOrigin" label="Time of Origin" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="timeOfProsper" label="Time of Prosper" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const PerformanceAndImplementation = () => (
    <>
      <TextField name="occasionOfPerforming" label="Occasion of Performing" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="performingSkills" label="Performing Skills" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="prevalence" label="Prevalence" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="stagePerformance" label="Stage Performance" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="targetAudience" label="Target Audience" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="temperament" label="Temperament" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="intonation" label="Intonation" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="length" label="Length" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

  const RelationshipsAndRelatedWork = () => (
    <>
      <TextField name="digitalCollection" label="Digital Collection" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="objectCollections" label="Object Collections" variant="outlined" fullWidth sx={formStyles} />
      <TextField name="relatedWork" label="Related Work" variant="outlined" fullWidth sx={formStyles} />
    </>
  );

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
              Catalog
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="metadata tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="1: Identification" />
            <Tab label="2: People and Contributors" />
            <Tab label="3: Dates" />
            <Tab label="4: Publication and Rights" />
            <Tab label="5: Description and Context" />
            <Tab label="6: Music Specific Details" />
            <Tab label="7: Locations" />
            <Tab label="8: Performance and Implementation" />
            <Tab label="9: Relationships and Related Work" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {tabIndex === 0 && <Identification />}
            {tabIndex === 1 && <PeopleAndContributors />}
            {tabIndex === 2 && <Dates />}
            {tabIndex === 3 && <PublicationAndRights />}
            {tabIndex === 4 && <DescriptionAndContext />}
            {tabIndex === 5 && <MusicSpecificDetails />}
            {tabIndex === 6 && <Locations />}
            {tabIndex === 7 && <PerformanceAndImplementation />}
            {tabIndex === 8 && <RelationshipsAndRelatedWork />}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              {tabIndex < 8 ? (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNext}
                  sx={{
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
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="large"
                  type="submit"
                  sx={{
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
                  }}
                >
                  Confirm & Upload
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
 