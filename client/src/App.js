import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Playlists from './pages/Playlists';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <MoodProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </main>
            <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
              <p>© {new Date().getFullYear()} MoodWave. All rights reserved.</p>
            </footer>
          </div>
        </Router>
      </MoodProvider>
    </AuthProvider>
  );
}

export default App;
