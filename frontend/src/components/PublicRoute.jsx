import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guards routes that should only be visible to logged-out users
 * (login, signup). If a token already exists, bounce to the app.
 */
const PublicRoute = () => {
  const token = localStorage.getItem('access_token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
