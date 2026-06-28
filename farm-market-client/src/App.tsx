import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CreateAdPage from './pages/CreateAdPage';
import AdDetailsPage from './pages/AdDetailsPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import JobBoardPage from './pages/JobBoardPage';
import OffersPage from './pages/OffersPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <Link to={user ? '/home' : '/'} className="nav-logo">
          <span className="nav-logo-text">Farm Market</span>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/jobs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Jobs
              </NavLink>
              {user.role === 'farmer' && (
                <>
                  <NavLink to="/my-offers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Offers
                  </NavLink>
                  <NavLink to="/create-ad" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Post Ad
                  </NavLink>
                </>
              )}
              <button className="nav-btn nav-btn-primary" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Login
              </NavLink>
              <Link to="/register" className="nav-btn nav-btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="/home" element={<ProtectedRoute><div className="page-wrapper"><HomePage /></div></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><div className="page-wrapper"><DashboardPage /></div></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><div className="page-wrapper"><JobBoardPage /></div></ProtectedRoute>} />
        <Route path="/my-offers" element={<ProtectedRoute><div className="page-wrapper"><OffersPage /></div></ProtectedRoute>} />
        <Route path="/ads/:id" element={<ProtectedRoute><div className="page-wrapper"><AdDetailsPage /></div></ProtectedRoute>} />
        <Route path="/create-ad" element={<ProtectedRoute><div className="page-wrapper"><CreateAdPage /></div></ProtectedRoute>} />
        <Route path="/chat/:conversationId" element={<ProtectedRoute><div className="page-wrapper"><ChatPage /></div></ProtectedRoute>} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}

export default App;
