import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import SavedTrends from './components/SavedTrends';
import Dashboard from './components/Dashboard';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Leaderboard from './components/Leaderboard';

// Global Axios Interceptor for handling 401 Unauthorized errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Authenticated routes with sidebar */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/saved-trends" element={<AppLayout><SavedTrends /></AppLayout>} />
          <Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
