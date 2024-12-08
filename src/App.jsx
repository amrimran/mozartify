import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from "./Landing";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Home from "./Home";
import CustomerHomepage from "./CustomerHomepage";
import CustomerLibrary from "./CustomerLibrary";
import CustomerFavorites from "./CustomerFavorites";
import CustomerMyCart from "./CustomerMyCart";
import CustomerAddNewFeedback from "./CustomerAddNewFeedback";
import CustomerProfile from "./CustomerProfile";
import CustomerMusicScoreView from "./CustomerMusicScoreView";
import MusicEntryClerkHomepage from "./MusicEntryClerkHomepage";
import MusicEntryClerkUpload from "./MusicEntryClerkUpload";
import MusicEntryClerkPreview from "./MusicEntryClerkPreview";
import MusicEntryClerkCatalog from "./MusicEntryClerkCatalog";
import CustomerInbox from "./CustomerInbox";
import MusicEntryClerkEdit from "./MusicEntryClerkEdit";
import MusicEntryClerkProfile from "./MusicEntryClerkProfile";
import FirstTimeLogin from './FirstTimeLogin';
import TestSession from "./TestSession";
import ClerkMusicScoreView from './ClerkMusicScoreView';
import Play from './Play';





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/first-time-login" element={<FirstTimeLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/customer-homepage" element={<CustomerHomepage />} />
        <Route path="/customer-library" element={<CustomerLibrary />} />
        <Route path="/customer-favorites" element={<CustomerFavorites />} />
        <Route path="/customer-mycart" element={<CustomerMyCart />} />
        <Route path="/customer-inbox" element={<CustomerInbox />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-library/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-favorites/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-inbox/customer-add-new-feedback" element={<CustomerAddNewFeedback />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/clerk-homepage" element={<MusicEntryClerkHomepage />} />
        <Route path="/clerk-upload" element={<MusicEntryClerkUpload />} />
        <Route path="/clerk-preview" element={<MusicEntryClerkPreview />} />
        <Route path="/clerk-catalog" element={<MusicEntryClerkCatalog />} />
        <Route path="/clerk-edit" element={<MusicEntryClerkEdit />} />
        <Route path="/clerk-profile" element={<MusicEntryClerkProfile />} />
        <Route path="/clerk-music-score-view/:scoreId" element={<ClerkMusicScoreView />} />
        <Route path="/test-session" element={<TestSession />} />
        <Route path="/play" element={<Play />} />




      </Routes>
    </Router>
  );
}

export default App;
