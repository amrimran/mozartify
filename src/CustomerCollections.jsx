import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
  IconButton,
  InputBase,
  Paper,
  Drawer,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { FilterAlt, Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import bgImage1 from "./assets/collections_list_1.png";
import bgImage2 from "./assets/collections_list_2.png";
import bgImage3 from "./assets/collections_list_3.png";
import bgImage4 from "./assets/collections_list_4.png";

export default function CustomerCollections() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const CollectionsList = [
    {
      id: 1,
      title: "Lecturer Compositions and Research",
    },
    {
      id: 2,
      title: "Student Compositions and Projects",
    },
    {
      id: 3,
      title: "Ethnomusicology Treasures",
    },
    {
      id: 4,
      title: "Digital Archive of Rare and Historical Scores",
    },
  ];

  const getBackgroundImage = (id) => {
    switch (id) {
      case 1:
        return bgImage1;
      case 2:
        return bgImage2;
      case 3:
        return bgImage3;
      case 4:
        return bgImage4;
      default:
        return bgImage1;
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
      {/* Sidebar */}
      {!(isMobile || isTablet) ? (
        <Box sx={{ width: 225, flexShrink: 0, overflowY: "auto" }}>
          <CustomerSidebar active="collections" />
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          anchor="left"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 225,
              boxSizing: "border-box",
            },
          }}
        >
          <CustomerSidebar active="collections" />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          pl: { xs: 1, sm: 2, md: 5 },
          mb: 4,
          width: "100%",
          overflow: "auto",
        }}
      >
        {/* Mobile Header */}
        {(isMobile || isTablet) && (
          <Box
            sx={{
              position: "relative",
              top: 10,
              zIndex: 100,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
            }}
          >
            <IconButton onClick={handleToggleSidebar}>
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {loading ? (
                <>
                  <Skeleton
                    variant="text"
                    width={100}
                    height={24}
                    sx={{ mr: 2 }}
                  />
                  <Skeleton variant="circular" width={40} height={40} />
                </>
              ) : (
                <>
                  <Typography
                    variant="body1"
                    sx={{ mr: 2, fontFamily: "Montserrat" }}
                  >
                    {user?.username}
                  </Typography>
                  <Avatar alt={user?.username} src={user?.profile_picture}>
                    {!user?.profile_picture &&
                      user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Search Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            mb: 3,
            mt: isMobile || isTablet ? 2 : 0,
          }}
        >
          <Paper
            component="form"
            sx={{
              p: "6px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: { xs: 350, sm: 600, md: 600 },
              border: "1px solid #8BD3E6",
              borderRadius: "50px",
            }}
          >
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                fontFamily: "Montserrat",
                textAlign: "center",
              }}
              placeholder={
                isMobile ? "Search..." : "Look for all music scores here..."
              }
            />
          </Paper>
          <IconButton
            sx={{ p: "10px", ml: 1 }}
            onClick={() => setIsDrawerOpen(true)}
          >
            <FilterAlt />
          </IconButton>
        </Box>

        {/* Collections Title */}
        <Box sx={{ px: { xs: 2, sm: 1 } }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: "Montserrat",
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              textAlign: isMobile || isTablet ? "center" : "left",
            }}
          >
            Collections 🗄️
          </Typography>

          {loading ? (
            <Skeleton variant="text" width={200} height={24} />
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                textAlign: isTablet || isMobile ? "center" : "left",
              }}
            >
              Browse our collections based on these categories:
            </Typography>
          )}
        </Box>

        {/* Collections List */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: { xs: 1, sm: 2 } }}>
          <List>
            {CollectionsList.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() =>
                  navigate(
                    `/customer-library/customer-music-score-view/${item.id}`
                  )
                }
                sx={{
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  backgroundImage: `url(${getBackgroundImage(item.id)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "12px",
                  overflow: "hidden",
                  height: "120px",
                  position: "relative",
                  mb: 1.5,
                }}
              >
                <ListItemText
                  primary={
                    loading ? (
                      <Skeleton variant="text" width={150} height={24} />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          color: "white",
                          padding: "0 24px",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                        }}
                      >
                        {item.title}
                      </Typography>
                    )
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
