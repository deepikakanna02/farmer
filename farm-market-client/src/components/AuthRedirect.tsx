import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthRedirect() {
  const { user } = useAuth();

  return <Navigate to={user ? '/home' : '/login'} replace />;
}

export default AuthRedirect;