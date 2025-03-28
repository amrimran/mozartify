import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from "./Landing";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Home from "./Home";
import CustomerHomepage from "./CustomerHomepage";
import CustomerLibrary from "./CustomerLibrary";
import CustomerSearch from "./CustomerSearch";
import CustomerAdvancedSearch from "./CustomerAdvancedSearch";
import CustomerFavorites from "./CustomerFavorites";
import CustomerMyCart from "./CustomerMyCart";
import CustomerAddNewFeedback from "./CustomerAddNewFeedback";
import CustomerProfile from "./CustomerProfile";
import CustomerMusicScoreView from "./CustomerMusicScoreView";
import CustomerCollections from "./CustomerCollections";
import MusicEntryClerkHomepage from "./MusicEntryClerkHomepage";
import MusicEntryClerkUpload from "./MusicEntryClerkUpload";
import MusicEntryClerkPreview from "./MusicEntryClerkPreview";
import MusicEntryClerkCatalog from "./MusicEntryClerkCatalog";
import ScrollControlledVideo from "./ScrollControlledVideo";
import CustomerInbox from "./CustomerInbox";
import MusicEntryClerkEdit from "./MusicEntryClerkEdit";
import MusicEntryClerkProfile from "./MusicEntryClerkProfile";
import FirstTimeLogin from './FirstTimeLogin';
import TestSession from "./TestSession";
import MusicEntryClerkView from './MusicEntryClerkView';
import AdminDashboard from './AdminDashboard';
import AdminInbox from './AdminInbox';
import AdminManageScore from './AdminManageScores';
import AdminMusicScoreView from './AdminMusicScoreView';
import AdminProfile from './AdminProfile';
import AdminManageUsers from './AdminManageUsers';
import AdminEdit from "./AdminEdit";
import AdminCatalog from "./AdminCatalog";
import TestSearch from "./testSearch";
import FileDownloaderPage from './FileDownloaderPage';
import Success from "./Success";
import Cancel from "./Cancel";
import MusicEntryClerkSearch from "./MusicEntryClerkSearch";
import MusicEntryClerkAdvSearch from "./MusicEntryClerkAdvSearch";
import EmailVerification from "./EmailVerification";
import AdminSearch from "./AdminSearch";
import AdminAdvancedSearch from "./AdminAdvancedSearch";
import ArtsClerkHomepage from "./ArtsClerkHomepage";
import ArtsClerkUpload from "./ArtsClerkUpload";
import ArtsClerkCatalog from "./ArtsClerkCatalog";
import ArtsClerkSearch from "./ArtsClerkSearch";
import ArtsClerkView from "./ArtsClerkView";
import ArtsClerkProfile from "./ArtsClerkProfile";
import ArtsFormBuilder from "./ArtsFormBuilder";








function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/first-time-login" element={<FirstTimeLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/downloader" element={<FileDownloaderPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/customer-homepage" element={<CustomerHomepage />} />
        <Route path="/customer-library" element={<CustomerLibrary />} />
        <Route path="/customer-search" element={<CustomerSearch />} />
        <Route path="/customer-search/customer-advanced-search" element={<CustomerAdvancedSearch />} />
        <Route path="/customer-favorites" element={<CustomerFavorites />} />
        <Route path="/customer-mycart" element={<CustomerMyCart />} />
        <Route path="/customer-inbox" element={<CustomerInbox />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-library/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-favorites/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-music-score-view/:id" element={<CustomerMusicScoreView />} />
        <Route path="/customer-inbox/customer-add-new-feedback" element={<CustomerAddNewFeedback />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-collections" element={<CustomerCollections />} />
        <Route path="/clerk-homepage" element={<MusicEntryClerkHomepage />} />
        <Route path="/clerk-upload" element={<MusicEntryClerkUpload />} />
        <Route path="/clerk-preview" element={<MusicEntryClerkPreview />} />
        <Route path="/clerk-catalog" element={<MusicEntryClerkCatalog />} />
        <Route path="/clerk-edit" element={<MusicEntryClerkEdit />} />
        <Route path="/clerk-profile" element={<MusicEntryClerkProfile />} />
        <Route path="/clerk-music-score-view/:scoreId" element={<MusicEntryClerkView />} />
        <Route path="/test-session" element={<TestSession />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-inbox" element={<AdminInbox />} />
        <Route path="/admin-manage-scores" element={<AdminManageScore />} />
        <Route path="/admin-music-score-view/:scoreId" element={<AdminMusicScoreView />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/admin-manage-users" element={<AdminManageUsers />} />
        <Route path="/admin-edit" element={<AdminEdit />} />
        <Route path="/admin-catalog" element={<AdminCatalog />} />
        <Route path="/scroll-controlled-video" element={<ScrollControlledVideo />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/test-session" element={<TestSession />} />
        <Route path="/test-search" element={<TestSearch />} />
        <Route path="/clerk-search" element={<MusicEntryClerkSearch />} />
        <Route path="/clerk-search/clerk-advanced-search" element={<MusicEntryClerkAdvSearch />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/admin-search" element={<AdminSearch />} />
        <Route path="/admin-search/admin-advanced-search" element={<AdminAdvancedSearch />} />
        <Route path="/arts-clerk-homepage" element={<ArtsClerkHomepage />} />
        <Route path="/arts-clerk-upload" element={<ArtsClerkUpload />} />
        <Route path="/arts-clerk-catalog/:id" element={<ArtsClerkCatalog />} />
        <Route path="/arts-clerk-search" element={<ArtsClerkSearch />} />
        <Route path="/arts-clerk-view/:artworkId" element={<ArtsClerkView />} />
        <Route path="/arts-clerk-profile" element={<ArtsClerkProfile />} />
        <Route path="/arts-form-builder" element={<ArtsFormBuilder/>} />








      </Routes>
    </Router>
  );
}

export default App;
