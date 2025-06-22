import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Shared Routes 
import { 
  Landing, 
  CustomerAddNewFeedback, 
  AdminDashboard, 
  AdminInbox, 
  AdminManageUser, 
  AdminProfile,
 } from "./pages/shared";

// Auth Routes
import {
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
  MusicFirstTimeLogin,
  ArtsFirstTimeLogin,
} from "./pages/auth";

// Music - Customer
import {
  MusicCustomerHomepage,
  MusicCustomerCatalog,
  MusicCustomerSearch,
  MusicCustomerProfile,
  MusicCustomerView,
  MusicCustomerAdvancedSearch,
  MusicCustomerCart,
  MusicCustomerCollections,
  MusicCustomerEdit,
  MusicCustomerFavorites,
  MusicCustomerInbox,
  MusicCustomerLibrary,
  MusicCustomerCompose,
  MusicCustomerNewCompose,
} from "./pages/music/customer";

// Music - Clerk
import {
  MusicClerkHomepage,
  MusicClerkCatalog,
  MusicClerkSearch,
  MusicClerkUpload,
  MusicClerkProfile,
  MusicClerkView,
  MusicClerkAdvancedSearch,
  MusicClerkEdit,
  MusicClerkPreview,
  MusicFieldManager,
} from "./pages/music/clerk";

// Music - Admin
import {
  MusicAdminAdvancedSearch,
  MusicAdminCatalogScore,
  MusicAdminEditScore,
  MusicAdminManageScore,
  MusicAdminSearch,
  MusicAdminView,
} from "./pages/music/admin";

// Arts - Customer
import {
  ArtsCustomerHomepage,
  ArtsCustomerSearch,
  ArtsCustomerProfile,
  ArtsCustomerView,
  ArtsCustomerAdvancedSearch,
  ArtsCustomerCart,
  ArtsCustomerFavorites,
  ArtsCustomerInbox,  
  ArtsCustomerLibrary,
} from "./pages/arts/customer";

// Arts - Clerk
import {
  ArtsClerkHomepage,
  ArtsClerkCatalog,
  ArtsClerkSearch,
  ArtsClerkUpload,
  ArtsClerkProfile,
  ArtsClerkView,
  ArtsFieldManager,
} from "./pages/arts/clerk";

import { UnreadProvider } from "./UnreadContext";


function App() {
  return (
    <UnreadProvider>
      <Router>
        <Routes>
          {/* Shared Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/music-customer/inbox/new-feedback" element={<CustomerAddNewFeedback />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/music-first-time-login" element={<MusicFirstTimeLogin />} />
          <Route path="/arts-first-time-login" element={<ArtsFirstTimeLogin />} />

          {/* Music Customer Routes */}
          <Route path="/music-customer/homepage" element={<MusicCustomerHomepage />} />
          <Route path="/music-customer/catalog" element={<MusicCustomerCatalog />} />
          <Route path="/music-customer/search" element={<MusicCustomerSearch />} />
          <Route path="/music-customer/profile" element={<MusicCustomerProfile />} />
          <Route path="/music-customer/view/:id" element={<MusicCustomerView />} />
          <Route path="/music-customer/search/advanced-search" element={<MusicCustomerAdvancedSearch />}/>
          <Route path="/music-customer/cart" element={<MusicCustomerCart />} />
          <Route path="/music-customer/collections" element={<MusicCustomerCollections />} />
          <Route path="/music-customer/edit" element={<MusicCustomerEdit />} />
          <Route path="/music-customer/favorites" element={<MusicCustomerFavorites />} />
          <Route path="/music-customer/inbox" element={<MusicCustomerInbox />} />
          <Route path="/music-customer/library" element={<MusicCustomerLibrary />} />
          <Route path="/music-customer/compose" element={<MusicCustomerCompose />} />
          <Route path="/music-customer/compose/new-compose" element={<MusicCustomerNewCompose />} />

          {/* Music Clerk Routes */}
          <Route path="/music-clerk/homepage" element={<MusicClerkHomepage />} />
          <Route path="/music-clerk/catalog" element={<MusicClerkCatalog />} />
          <Route path="/music-clerk/search" element={<MusicClerkSearch />} /> 
          <Route path="/music-clerk/upload" element={<MusicClerkUpload />} />
          <Route path="/music-clerk/profile" element={<MusicClerkProfile />} />
          <Route path="/music-clerk/view/:id" element={<MusicClerkView />} />
          <Route path="/music-clerk/advanced-search" element={<MusicClerkAdvancedSearch />} />
          <Route path="/music-clerk/edit" element={<MusicClerkEdit />} />
          <Route path="/music-clerk/preview" element={<MusicClerkPreview />} />
          <Route path="/music-clerk/field-manager" element={<MusicFieldManager />} />

          {/* Arts Customer Routes */}
          <Route path="/arts-customer/homepage" element={<ArtsCustomerHomepage />} />
          <Route path="/arts-customer/search" element={<ArtsCustomerSearch />} />
          <Route path="/arts-customer/profile" element={<ArtsCustomerProfile />} />
          <Route path="/arts-customer/view/:artworkId" element={<ArtsCustomerView />} />
          <Route path="/arts-customer/advanced-search" element={<ArtsCustomerAdvancedSearch />} />
          <Route path="/arts-customer/cart" element={<ArtsCustomerCart />} />
          <Route path="/arts-customer/favorites" element={<ArtsCustomerFavorites />} />
          <Route path="/arts-customer/inbox" element={<ArtsCustomerInbox />} />
          <Route path="/arts-customer/library" element={<ArtsCustomerLibrary />} />

          {/* Arts Clerk Routes */}
          <Route path="/arts-clerk/homepage" element={<ArtsClerkHomepage />} />
          <Route path="/arts-clerk/catalog" element={<ArtsClerkCatalog />} />
          <Route path="/arts-clerk/search" element={<ArtsClerkSearch />} />
          <Route path="/arts-clerk/upload" element={<ArtsClerkUpload />} />
          <Route path="/arts-clerk/profile" element={<ArtsClerkProfile />} />
          <Route path="/arts-clerk/view/:artworkId" element={<ArtsClerkView />} />
          <Route path="/arts-clerk/field-manager" element={<ArtsFieldManager />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inbox" element={<AdminInbox />} />
          <Route path="/admin/manage-user" element={<AdminManageUser />} />
          <Route path="/admin/profile" element={<AdminProfile />} />

          {/* Music Admin Routes */}
          <Route path="/admin/music/advanced-search" element={<MusicAdminAdvancedSearch />} />
          <Route path="/admin/music/catalog-score" element={<MusicAdminCatalogScore />} />
          <Route path="/admin/music/edit-score" element={<MusicAdminEditScore />} />
          <Route path="/admin/music/manage-score" element={<MusicAdminManageScore />} />
          <Route path="/admin/music/search" element={<MusicAdminSearch />} />
          <Route path="/admin/music/view/:scoreId" element={<MusicAdminView />} />
          
        </Routes>
      </Router>
    </UnreadProvider>
  );
}

export default App;
