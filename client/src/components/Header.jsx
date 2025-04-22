import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../utils/useAuth';
import useMood from '../utils/useMood';
import { FaMusic, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { selectedMood, clearMood } = useMood();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    clearMood();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-wider flex items-center group">
            <FaMusic className="text-2xl mr-2 group-hover:animate-spin-slow transition-all duration-1000" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 font-extrabold">
              MoodWave
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {selectedMood && (
              <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm font-medium">
                Current Mood: <span className="text-purple-200 font-semibold">{selectedMood}</span>
              </div>
            )}

            <nav className="flex space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="relative group">
                    <span className="text-white hover:text-purple-200 transition-colors font-medium">
                      Dashboard
                    </span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-200 transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/playlists" className="relative group">
                    <span className="text-white hover:text-purple-200 transition-colors font-medium">
                      Playlists
                    </span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-200 transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/history" className="relative group">
                    <span className="text-white hover:text-purple-200 transition-colors font-medium">
                      History
                    </span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-200 transition-all group-hover:w-full"></span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-white hover:text-purple-200 transition-colors font-medium"
                  >
                    <span>Logout</span>
                    <FaSignOutAlt className="ml-1" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-white font-medium">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-white/20 pt-4">
            {selectedMood && (
              <div className="bg-white/20 px-3 py-1.5 rounded-full text-sm inline-block mb-4">
                Mood: <span className="text-purple-200">{selectedMood}</span>
              </div>
            )}
            <nav className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="hover:text-purple-200 transition" onClick={toggleMobileMenu}>
                    Dashboard
                  </Link>
                  <Link to="/playlists" className="hover:text-purple-200 transition" onClick={toggleMobileMenu}>
                    Playlists
                  </Link>
                  <Link to="/history" className="hover:text-purple-200 transition" onClick={toggleMobileMenu}>
                    History
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="flex items-center hover:text-purple-200 transition text-left"
                  >
                    <span>Logout</span>
                    <FaSignOutAlt className="ml-1" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-purple-200 transition" onClick={toggleMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="hover:text-purple-200 transition" onClick={toggleMobileMenu}>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 