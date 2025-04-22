import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../utils/useAuth';
import useMood from '../utils/useMood';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { selectedMood, clearMood } = useMood();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearMood();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider flex items-center">
          <span className="text-3xl mr-2">🎵</span> MoodWave
        </Link>

        <div className="flex items-center space-x-4">
          {selectedMood && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Mood: {selectedMood}
            </div>
          )}

          <nav className="flex space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition">
                  Dashboard
                </Link>
                <Link to="/playlists" className="hover:text-blue-200 transition">
                  Playlists
                </Link>
                <Link to="/history" className="hover:text-blue-200 transition">
                  History
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-blue-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-200 transition">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 