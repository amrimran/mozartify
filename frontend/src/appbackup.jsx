import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

//shared
import Landing from "./pages/shared/Landing";

//authentication
import {
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
  MusicFirstTimeLogin,
  ArtsFirstTimeLogin,
} from "./pages/auth";

//music - customer
import {
  MusicCustomerHomepage,
  MusicCustomerCatalog,
  MusicCustomerSearch,
  MusicCustomerUpload,
  MusicCustomerProfile,
  MusicCustomerView,
} from "./pages/music/customer";

//music - clerk


//music -admin

//arts - customer
import {
  ArtsCustomerHomepage,
  ArtsCustomerCatalog,
  ArtsCustomerSearch,
  ArtsCustomerUpload,
  ArtsCustomerProfile,
  ArtsCustomerView,
} from "./pages/arts/customer";

//arts -clerk
import {
  ArtsClerkHomepage,
  ArtsClerkCatalog,
  ArtsClerkSearch,
  ArtsClerkUpload,
  ArtsClerkProfile,
  ArtsClerkView,
  ArtsFieldManager,
} from "./pages/arts/clerk";

//arts -admin
import CustomerHomepage2 from "./CustomerHomepage2";
import CustomerLibrary from "./CustomerLibrary";
import CustomerLibrary2 from "./CustomerLibrary2";
import CustomerSearch from "./CustomerSearch";
import CustomerSearch2 from "./CustomerSearch2";
import CustomerAdvancedSearch from "./CustomerAdvancedSearch";
import CustomerAdvancedSearch2 from "./CustomerAdvancedSearch2";
import CustomerCompose from "./CustomerCompose";
import CustomerNewCompose from "./CustomerNewCompose";
import CustomerEdit from "./CustomerEdit";
import CustomerCatalog from "./CustomerCatalog";
import CustomerFavorites from "./CustomerFavorites";
import CustomerFavorites2 from "./CustomerFavorites2";
import CustomerMyCart from "./CustomerMyCart";
import CustomerMyCart2 from "./CustomerMyCart2";
import CustomerAddNewFeedback from "./CustomerAddNewFeedback";
import CustomerProfile from "./CustomerProfile";
import CustomerProfile2 from "./CustomerProfile2";
import CustomerMusicScoreView from "./CustomerMusicScoreView";
import CustomerArtworkView from "./CustomerArtworkView";
import CustomerCollections from "./CustomerCollections";
import CustomerInbox from "./CustomerInbox";
import CustomerInbox2 from "./CustomerInbox2";

import MusicEntryClerkHomepage from "./pages/music/clerk/MusicClerkHomepage";
import MusicEntryClerkUpload from "./pages/music/clerk/MusicClerkUpload";
import MusicEntryClerkPreview from "./pages/music/clerk/MusicClerkPreview";
import MusicEntryClerkCatalog from "./pages/music/clerk/MusicClerkCatalog";

import MusicEntryClerkEdit from "./pages/music/clerk/MusicClerkEdit";
import MusicEntryClerkProfile from "./pages/music/clerk/MusicClerkProfile";

import TestSession from "./TestSession";
import MusicEntryClerkView from "./pages/music/clerk/MusicClerkView";
import AdminDashboard from "./AdminDashboard";
import AdminInbox from "./AdminInbox";
import AdminManageScore from "./AdminManageScores";
import AdminMusicScoreView from "./AdminMusicScoreView";
import AdminProfile from "./AdminProfile";
import AdminManageUsers from "./AdminManageUsers";
import AdminEdit from "./AdminEdit";
import AdminCatalog from "./AdminCatalog";
import TestSearch from "./testSearch";
import FileDownloaderPage from "./FileDownloaderPage";
import Success from "./Success";
import Success2 from "./Success2";
import Cancel from "./Cancel";
import MusicEntryClerkSearch from "./pages/music/clerk/MusicClerkSearch";
import MusicEntryClerkAdvSearch from "./pages/music/clerk/MusicClerkAdvancedSearch";
import AdminSearch from "./AdminSearch";
import AdminAdvancedSearch from "./AdminAdvancedSearch";

import { UnreadProvider } from "./UnreadContext";
import MusicFieldManager from "./pages/music/clerk/MusicFieldManager";

function App() {
  return (
    <UnreadProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/first-time-login" element={<MusicFirstTimeLogin />} />
          <Route path="/first-time-login-2" element={<ArtsFirstTimeLogin2 />} />
          <Route path="/downloader" element={<FileDownloaderPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/customer-homepage" element={<MusicCustomerHomepage />} />
          <Route path="/customer-homepage-2" element={<CustomerHomepage2 />} />
          <Route path="/customer-library" element={<CustomerLibrary />} />
          <Route path="/customer-library-2" element={<CustomerLibrary2 />} />
          <Route path="/customer-search" element={<CustomerSearch />} />
          <Route path="/customer-search-2" element={<CustomerSearch2 />} />
          <Route
            path="/customer-search/customer-advanced-search"
            element={<CustomerAdvancedSearch />}
          />
          <Route
            path="/customer-search-2/customer-advanced-search-2"
            element={<CustomerAdvancedSearch2 />}
          />
          <Route path="/customer-compose" element={<CustomerCompose />} />
          <Route
            path="/customer-compose/customer-new-compose"
            element={<CustomerNewCompose />}
          />
          <Route
            path="/customer-compose/customer-new-compose/customer-edit"
            element={<CustomerEdit />}
          />
          <Route
            path="/customer-compose/customer-new-compose/customer-edit/customer-catalog"
            element={<CustomerCatalog />}
          />
          <Route path="/customer-favorites" element={<CustomerFavorites />} />
          <Route
            path="/customer-favorites-2"
            element={<CustomerFavorites2 />}
          />
          <Route path="/customer-mycart" element={<CustomerMyCart />} />
          <Route path="/customer-mycart-2" element={<CustomerMyCart2 />} />
          <Route path="/customer-inbox" element={<CustomerInbox />} />
          <Route path="/customer-inbox-2" element={<CustomerInbox2 />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/customer-profile-2" element={<CustomerProfile2 />} />
          <Route
            path="/customer-library/customer-music-score-view/:id"
            element={<CustomerMusicScoreView />}
          />
          <Route
            path="/customer-library/customer-artwork-view/:artworkId"
            element={<CustomerArtworkView />}
          />
          <Route
            path="/customer-compose/customer-music-score-view/:id"
            element={<CustomerMusicScoreView />}
          />
          <Route
            path="/customer-compose/customer-artwork-view/:artworkId"
            element={<CustomerArtworkView />}
          />
          <Route
            path="/customer-favorites/customer-music-score-view/:id"
            element={<CustomerMusicScoreView />}
          />
          <Route
            path="/customer-favorites/customer-artwork-view/:artworkId"
            element={<CustomerArtworkView />}
          />
          <Route
            path="/customer-music-score-view/:id"
            element={<CustomerMusicScoreView />}
          />
          <Route
            path="/customer-artwork-view/:artworkId"
            element={<CustomerArtworkView />}
          />
          <Route
            path="/customer-inbox/customer-add-new-feedback"
            element={<CustomerAddNewFeedback />}
          />
          <Route
            path="/customer-collections"
            element={<CustomerCollections />}
          />
          <Route path="/clerk-homepage" element={<MusicEntryClerkHomepage />} />
          <Route path="/clerk-upload" element={<MusicEntryClerkUpload />} />
          <Route path="/clerk-preview" element={<MusicEntryClerkPreview />} />
          <Route path="/clerk-catalog" element={<MusicEntryClerkCatalog />} />
          <Route path="/clerk-edit" element={<MusicEntryClerkEdit />} />
          <Route path="/clerk-profile" element={<MusicEntryClerkProfile />} />
          <Route
            path="/clerk-music-score-view/:scoreId"
            element={<MusicEntryClerkView />}
          />
          <Route path="/test-session" element={<TestSession />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-inbox" element={<AdminInbox />} />
          <Route path="/admin-manage-scores" element={<AdminManageScore />} />
          <Route
            path="/admin-music-score-view/:scoreId"
            element={<AdminMusicScoreView />}
          />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/admin-manage-users" element={<AdminManageUsers />} />
          <Route path="/admin-edit" element={<AdminEdit />} />
          <Route path="/admin-catalog" element={<AdminCatalog />} />
          <Route path="/success" element={<Success />} />
          <Route path="/success-2" element={<Success2 />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/test-session" element={<TestSession />} />
          <Route path="/test-search" element={<TestSearch />} />
          <Route path="/clerk-search" element={<MusicEntryClerkSearch />} />
          <Route
            path="/clerk-search/clerk-advanced-search"
            element={<MusicEntryClerkAdvSearch />}
          />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/admin-search" element={<AdminSearch />} />
          <Route
            path="/admin-search/admin-advanced-search"
            element={<AdminAdvancedSearch />}
          />
          <Route path="/arts-clerk-homepage" element={<ArtsClerkHomepage />} />
          <Route path="/arts-clerk-upload" element={<ArtsClerkUpload />} />
          <Route
            path="/arts-clerk-catalog/:id"
            element={<ArtsClerkCatalog />}
          />
          <Route path="/arts-clerk-search" element={<ArtsClerkSearch />} />
          <Route
            path="/arts-clerk-view/:artworkId"
            element={<ArtsClerkView />}
          />
          <Route path="/arts-clerk-profile" element={<ArtsClerkProfile />} />
          <Route path="/arts-field-manager" element={<ArtsFieldManager />} />
          {/* <Route path="/composition-page" element={<CompositionPage />} /> */}
          <Route path="/music-field-manager" element={<MusicFieldManager />} />
        </Routes>
      </Router>
    </UnreadProvider>
  );
}

export default App;
