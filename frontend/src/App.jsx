import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { authService } from './services/auth.service';
import { setAuthSuccess, logout } from './store/slices/authSlice';
import { Loader2 } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import { subscribeToPushNotifications } from './services/push.service';

function AppRoutes() {
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(!localStorage.getItem('access_token'));

  // On first load: if an access token exists, fetch the user profile and
  // hydrate the Redux store so state.auth.user is never null after refresh.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsHydrated(true);
      return;
    }

    authService
      .getProfile()
      .then((user) => {
        dispatch(setAuthSuccess({ user }));
        // Try to subscribe to push notifications if VAPID key is available
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (vapidKey) {
          subscribeToPushNotifications(vapidKey);
        }
      })
      .catch(() => {
        // Token is invalid / expired and refresh also failed → log out cleanly
        dispatch(logout());
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, [dispatch]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-surface)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Auth routes — redirect to / if already logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
