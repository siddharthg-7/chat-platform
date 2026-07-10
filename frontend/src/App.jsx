import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { authService } from './services/auth.service';
import { setAuthSuccess, logout } from './store/slices/authSlice';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function AppRoutes() {
  const dispatch = useDispatch();

  // On first load: if an access token exists, fetch the user profile and
  // hydrate the Redux store so state.auth.user is never null after refresh.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    authService
      .getProfile()
      .then((user) => {
        dispatch(setAuthSuccess({ user }));
      })
      .catch(() => {
        // Token is invalid / expired and refresh also failed → log out cleanly
        dispatch(logout());
      });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Auth routes — redirect to / if already logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;