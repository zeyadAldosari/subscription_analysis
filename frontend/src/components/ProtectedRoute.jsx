import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function ProtectedRoute() {
  const { auth } = useContext(AuthContext);
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}

export default ProtectedRoute;