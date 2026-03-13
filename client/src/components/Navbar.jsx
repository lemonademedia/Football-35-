import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          35+ League
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-green-200">Home</Link>
          {user ? (
            <>
              {user.role === 'super_admin' && (
                <Link to="/admin" className="hover:text-green-200">Admin</Link>
              )}
              {user.role === 'team_admin' && (
                <Link to="/team" className="hover:text-green-200">My Team</Link>
              )}
              <span className="text-green-300 hidden sm:inline">
                {user.username}
              </span>
              <button onClick={handleLogout} className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
