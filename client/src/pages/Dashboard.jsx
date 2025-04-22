import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import useMood from '../utils/useMood';
import MoodSelector from '../components/MoodSelector';
import SongCard from '../components/SongCard';
import MusicPlayer from '../components/MusicPlayer';
import CommentsDialog from '../components/CommentsDialog';
import { FaMusic, FaPlus, FaTimesCircle } from 'react-icons/fa';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { selectedMood, clearMood } = useMood();
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

  // Comments dialog state
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [commentsSong, setCommentsSong] = useState(null);

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

  const handleOpenComments = (song) => {
    setCommentsSong(song);
    setShowCommentsDialog(true);
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <FaMusic className="mx-auto text-5xl text-indigo-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Choose Your Mood</h1>
            <p className="text-xl text-gray-600">Select a mood to discover songs that match how you feel</p>
          </div>
          <MoodSelector onMoodSelected={() => { }} />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {selectedMood} Songs
              </span>
              <span className="ml-2 text-gray-700">for You</span>
            </h1>

            <button
              onClick={clearMood}
              className="flex items-center text-gray-500 hover:text-indigo-600 transition px-3 py-1 rounded-full border border-gray-300 hover:border-indigo-400 text-sm"
            >
              <FaTimesCircle className="mr-1" />
              <span>Change Mood</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading your personalized playlist...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaTimesCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <FaMusic className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-xl text-gray-600 mb-2">
                No songs found for this mood.
              </p>
              <p className="text-gray-500">
                Try selecting a different mood or check back later.
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
                  onOpenComments={handleOpenComments}
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

      {/* Comments Dialog */}
      {showCommentsDialog && commentsSong && (
        <CommentsDialog
          isOpen={showCommentsDialog}
          onClose={() => setShowCommentsDialog(false)}
          songId={commentsSong._id}
          songTitle={commentsSong.title}
        />
      )}

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Add to Playlist</h3>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Create new playlist"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-grow border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleCreatePlaylist}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-r-md hover:from-indigo-600 hover:to-purple-700 transition-colors"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <p className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                  No playlists found. Create one above.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {playlists.map((playlist) => (
                    <li key={playlist._id} className="py-2">
                      <button
                        onClick={() => handleAddToPlaylist(playlist._id)}
                        className="w-full text-left hover:bg-indigo-50 p-3 rounded-lg transition-colors flex justify-between items-center"
                      >
                        <span className="font-medium">{playlist.name}</span>
                        {playlist.moodTag && (
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {playlist.moodTag}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
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