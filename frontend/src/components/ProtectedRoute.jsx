import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guards nested routes behind an access token.
 * If there's no token, redirect to /login and remember
 * where the user was headed so we can send them back after login.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
