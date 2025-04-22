import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import { FaPlay, FaTrash } from 'react-icons/fa';
import MusicPlayer from '../components/MusicPlayer';

const History = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchHistory();
  }, [isAuthenticated, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/history');
      setHistory(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch playback history. Please try again.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setSelectedSongId(song._id);
  };

  const handleNextSong = () => {
    if (history.length > 0) {
      const songIds = history.map(item => item.songId._id);
      const currentIndex = songIds.indexOf(selectedSongId);
      const nextIndex = (currentIndex + 1) % songIds.length;
      handlePlaySong(history[nextIndex].songId);
    }
  };

  const handlePrevSong = () => {
    if (history.length > 0) {
      const songIds = history.map(item => item.songId._id);
      const currentIndex = songIds.indexOf(selectedSongId);
      const prevIndex = (currentIndex - 1 + songIds.length) % songIds.length;
      handlePlaySong(history[prevIndex].songId);
    }
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      await axios.delete(`/api/history/${id}`);
      setHistory(history.filter(item => item._id !== id));
      
      // If this was the current playing song, stop playing
      if (currentSong && history.find(item => item._id === id && item.songId._id === currentSong._id)) {
        setCurrentSong(null);
        setSelectedSongId(null);
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire playback history?')) {
      return;
    }
    
    try {
      await axios.delete('/api/history');
      setHistory([]);
      setCurrentSong(null);
      setSelectedSongId(null);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Playback History</h1>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaTrash className="mr-2" /> Clear History
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">
            Your playback history is empty.
          </p>
          <p className="text-gray-500 mt-2">
            Songs you listen to will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Song
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Played At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handlePlaySong(item.songId)}
                        className={`mr-3 p-2 rounded-full ${selectedSongId === item.songId._id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <FaPlay />
                      </button>
                      <span className="font-medium">{item.songId.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {item.songId.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {formatDate(item.playedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteHistoryItem(item._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove from history"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          onNextSong={handleNextSong}
          onPrevSong={handlePrevSong}
        />
      )}
    </div>
  );
};

export default History; 