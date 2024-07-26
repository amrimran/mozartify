import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";
import ForgotPassword from "./ForgotPassword";
import CustomerHomepage from "./CustomerHomepage";
import CustomerLibrary from "./CustomerLibrary";
import CustomerFavourites from "./CustomerFavourites";
import CustomerMyCart from "./CustomerMyCart";
import CustomerAddNewFeedback from "./CustomerAddNewFeedback";
import CustomerProfile from "./CustomerProfile";
import CustomerMusicScoreView from "./CustomerMusicScoreView";
import MusicEntryClerkHomepage from "./MusicEntryClerkHomepage";
import MusicEntryClerkUpload from "./MusicEntryClerkUpload";
import MusicEntryClerkPreview from "./MusicEntryClerkPreview";
import MusicEntryClerkCatalog from "./MusicEntryClerkCatalog";
import CustomerInbox from "./CustomerInbox";
import MusicEntryClerkEdit from "./MusicEntryClerkEdit"; // Ensure this matches the actual file name exactly

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/customer-homepage" element={<CustomerHomepage />} />
        <Route path="/customer-library" element={<CustomerLibrary />} />
        <Route path="/customer-favourites" element={<CustomerFavourites />} />
        <Route path="/customer-mycart" element={<CustomerMyCart />} />
        <Route path="/customer-inbox" element={<CustomerInbox />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-library/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-favourites/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-inbox/customer-add-new-feedback" element={<CustomerAddNewFeedback />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/clerk-homepage" element={<MusicEntryClerkHomepage />} />
        <Route path="/clerk-upload" element={<MusicEntryClerkUpload />} />
        <Route path="/clerk-preview" element={<MusicEntryClerkPreview />} />
        <Route path="/clerk-catalog" element={<MusicEntryClerkCatalog />} />
        <Route path="/clerk-edit" element={<MusicEntryClerkEdit />} /> {/* Update route for the MusicEntryClerkEdit component */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
