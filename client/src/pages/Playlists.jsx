import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import SongCard from '../components/SongCard';
import MusicPlayer from '../components/MusicPlayer';
import { FaTrash, FaPlus } from 'react-icons/fa';

const Playlists = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistMood, setNewPlaylistMood] = useState('Mixed');
  const [availableMoods] = useState([
    'Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Melancholic', 'Chill', 'Mixed'
  ]);

  // Check authentication and fetch playlists
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/playlists');
        console.log('Playlists fetched:', data);
        setPlaylists(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch playlists:', err);
        setError('Failed to fetch playlists. Please try again.');
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [isAuthenticated, navigate]);

  // Fetch songs for selected playlist
  useEffect(() => {
    if (currentPlaylist) {
      const fetchPlaylistSongs = async () => {
        try {
          setLoadingSongs(true);
          const { data } = await axios.get(`/api/playlists/${currentPlaylist._id}`);
          console.log('Playlist songs fetched:', data);
          setPlaylistSongs(data.songIds || []);
        } catch (err) {
          console.error('Error fetching playlist songs:', err);
          setPlaylistSongs([]);
        } finally {
          setLoadingSongs(false);
        }
      };

      fetchPlaylistSongs();
    }
  }, [currentPlaylist]);

  const handleSelectPlaylist = (playlist) => {
    console.log('Selected playlist:', playlist);
    setCurrentPlaylist(playlist);
    setCurrentSong(null);
    setSelectedSongId(null);
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setSelectedSongId(song._id);
  };

  const handleNextSong = () => {
    if (playlistSongs.length > 0) {
      const currentIndex = playlistSongs.findIndex(song => song._id === selectedSongId);
      const nextIndex = (currentIndex + 1) % playlistSongs.length;
      handlePlaySong(playlistSongs[nextIndex]);
    }
  };

  const handlePrevSong = () => {
    if (playlistSongs.length > 0) {
      const currentIndex = playlistSongs.findIndex(song => song._id === selectedSongId);
      const prevIndex = (currentIndex - 1 + playlistSongs.length) % playlistSongs.length;
      handlePlaySong(playlistSongs[prevIndex]);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await axios.delete(`/api/playlists/${currentPlaylist._id}/songs/${songId}`);
      console.log('Song removed from playlist:', songId);

      // Update playlist songs
      setPlaylistSongs(playlistSongs.filter(song => song._id !== songId));

      // If the removed song is the current playing song, clear it
      if (selectedSongId === songId) {
        setCurrentSong(null);
        setSelectedSongId(null);
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await axios.delete(`/api/playlists/${playlistId}`);
      console.log('Playlist deleted:', playlistId);

      // Update playlists
      setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));

      // If the deleted playlist is the current one, clear it
      if (currentPlaylist && currentPlaylist._id === playlistId) {
        setCurrentPlaylist(null);
        setPlaylistSongs([]);
        setCurrentSong(null);
        setSelectedSongId(null);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!newPlaylistName.trim()) return;

    try {
      console.log('Creating playlist:', { name: newPlaylistName, moodTag: newPlaylistMood });
      const { data } = await axios.post('/api/playlists', {
        name: newPlaylistName,
        moodTag: newPlaylistMood,
        description: `A playlist for ${newPlaylistMood} mood`
      });

      console.log('Playlist created:', data);
      setPlaylists([...playlists, data]);
      setNewPlaylistName('');
      setNewPlaylistMood('Mixed');
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Playlists sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Create Playlist</h2>
              <form onSubmit={handleCreatePlaylist}>
                <div className="mb-3">
                  <label htmlFor="playlistName" className="block text-sm font-medium text-gray-700 mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    id="playlistName"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="My Awesome Playlist"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="playlistMood" className="block text-sm font-medium text-gray-700 mb-1">
                    Mood
                  </label>
                  <select
                    id="playlistMood"
                    value={newPlaylistMood}
                    onChange={(e) => setNewPlaylistMood(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {availableMoods.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Create Playlist
                </button>
              </form>
            </div>

            <h2 className="text-xl font-semibold mb-3">Your Playlists</h2>
            {playlists.length === 0 ? (
              <p className="text-gray-500">No playlists found. Create one to get started.</p>
            ) : (
              <ul className="bg-white rounded-lg shadow-md divide-y">
                {playlists.map((playlist) => (
                  <li key={playlist._id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleSelectPlaylist(playlist)}
                        className={`flex-grow text-left py-1 ${currentPlaylist?._id === playlist._id ? 'font-semibold text-blue-600' : ''}`}
                      >
                        {playlist.name}
                        {playlist.moodTag && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {playlist.moodTag}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeletePlaylist(playlist._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete playlist"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Playlist songs */}
          <div className="flex-grow">
            {currentPlaylist ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                  <h2 className="text-2xl font-bold">{currentPlaylist.name}</h2>
                  {currentPlaylist.moodTag && (
                    <span className="inline-block mt-1 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {currentPlaylist.moodTag}
                    </span>
                  )}
                  {currentPlaylist.description && (
                    <p className="mt-2 text-gray-600">{currentPlaylist.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {playlistSongs.length} {playlistSongs.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>

                {loadingSongs ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : playlistSongs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xl text-gray-600">
                      This playlist is empty. Add songs to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {playlistSongs.map((song) => (
                      <div key={song._id} className="relative group">
                        <SongCard
                          song={song}
                          onPlay={handlePlaySong}
                          isPlaying={selectedSongId === song._id}
                        />
                        <button
                          onClick={() => handleRemoveSong(song._id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from playlist"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <p className="text-xl text-gray-600">
                  Select a playlist from the sidebar or create a new one to get started
                </p>
              </div>
            )}
          </div>
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

export default Playlists; 