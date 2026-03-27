import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // If not logged in, send them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role doesn't match (e.g. Student tries Admin page)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  // Otherwise, let them through to the page
  return <Outlet />;
};

export default ProtectedRoute;