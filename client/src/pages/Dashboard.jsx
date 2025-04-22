import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import useMood from '../utils/useMood';
import MoodSelector from '../components/MoodSelector';
import SongCard from '../components/SongCard';
import MusicPlayer from '../components/MusicPlayer';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { selectedMood } = useMood();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Fetch songs based on selected mood
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSongs = async () => {
      try {
        setLoading(true);
        let url = '/api/songs';

        if (selectedMood) {
          url = `/api/songs/mood/${selectedMood}`;
        }

        console.log('Fetching songs from:', url);
        const { data } = await axios.get(url);
        console.log('Songs data received:', data);

        // Add isLiked property to each song
        const songsWithLiked = data.map(song => ({
          ...song,
          isLiked: false // In our simplified server, we're not tracking liked songs yet
        }));

        setSongs(songsWithLiked);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch songs:', err);
        setError('Failed to fetch songs. Please try again.');
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [isAuthenticated, navigate, selectedMood]);

  // Fetch user's playlists
  useEffect(() => {
    if (isAuthenticated) {
      const fetchPlaylists = async () => {
        try {
          const { data } = await axios.get('/api/playlists');
          setPlaylists(data);
        } catch (err) {
          console.error('Failed to fetch playlists:', err);
        }
      };

      fetchPlaylists();
    }
  }, [isAuthenticated]);

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setSelectedSongId(song._id);
  };

  const handleNextSong = () => {
    if (songs.length > 0) {
      const currentIndex = songs.findIndex(song => song._id === selectedSongId);
      const nextIndex = (currentIndex + 1) % songs.length;
      handlePlaySong(songs[nextIndex]);
    }
  };

  const handlePrevSong = () => {
    if (songs.length > 0) {
      const currentIndex = songs.findIndex(song => song._id === selectedSongId);
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      handlePlaySong(songs[prevIndex]);
    }
  };

  const handleOpenPlaylistModal = (song) => {
    setSongToAddToPlaylist(song);
    setShowPlaylistModal(true);
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!songToAddToPlaylist) return;

    try {
      await axios.post(`/api/playlists/${playlistId}/songs`, {
        songId: songToAddToPlaylist._id
      });

      setShowPlaylistModal(false);
      setSongToAddToPlaylist(null);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const { data } = await axios.post('/api/playlists', {
        name: newPlaylistName,
        moodTag: selectedMood || 'Mixed'
      });

      setPlaylists([...playlists, data]);
      setNewPlaylistName('');

      // Add the song to the newly created playlist if there's a song to add
      if (songToAddToPlaylist) {
        await handleAddToPlaylist(data._id);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const refreshSongs = async () => {
    if (selectedMood) {
      const { data } = await axios.get(`/api/songs/mood/${selectedMood}`);
      setSongs(data);
    } else {
      const { data } = await axios.get('/api/songs');
      setSongs(data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {!selectedMood ? (
        <MoodSelector onMoodSelected={() => { }} />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">
            {selectedMood} Songs for You
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">
                No songs found for this mood.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {songs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onPlay={handlePlaySong}
                  isPlaying={selectedSongId === song._id}
                  onPlaylistAdd={handleOpenPlaylistModal}
                  refreshSongs={refreshSongs}
                />
              ))}
            </div>
          )}
        </>
      )}

      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          onNextSong={handleNextSong}
          onPrevSong={handlePrevSong}
        />
      )}

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add to Playlist</h3>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Create new playlist"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-grow border p-2 rounded-l-md"
                />
                <button
                  onClick={handleCreatePlaylist}
                  className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
                >
                  Create
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No playlists found. Create one above.
                </p>
              ) : (
                <ul className="divide-y">
                  {playlists.map((playlist) => (
                    <li key={playlist._id} className="py-2">
                      <button
                        onClick={() => handleAddToPlaylist(playlist._id)}
                        className="w-full text-left hover:bg-gray-50 p-2 rounded"
                      >
                        {playlist.name}
                        {playlist.moodTag && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {playlist.moodTag}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  setSongToAddToPlaylist(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 