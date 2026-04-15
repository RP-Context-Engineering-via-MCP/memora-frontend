// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/oauth';

// Import components
import LandingPage from './components/LandingPage';     // New landing page
import Signin from './components/Signin';
import Signup from './components/Signup';               // If you have it
import ProfileSetupStep1 from './components/ProfileSetupStep1';
import ProfileSetupStep2 from './components/ProfileSetupStep2';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Default route - Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth pages */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Onboarding / Profile Setup Flow */}
          <Route path="/profile-setup/step1" element={<ProfileSetupStep1 />} />
          <Route path="/profile-setup/step2" element={<ProfileSetupStep2 />} />
          
          {/* Main Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Optional: Catch-all redirect to landing page */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;