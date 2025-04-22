import { useState } from 'react';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import SongDialog from './SongDialog';

const SongCard = ({ song, onPlay, isPlaying, refreshSongs }) => {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(song.isLiked || false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) return;

    try {
      if (isLiked) {
        await axios.delete(`/api/songs/${song._id}/like`);
        setIsLiked(false);
      } else {
        await axios.post(`/api/songs/${song._id}/like`);
        setIsLiked(true);
      }
      if (refreshSongs) refreshSongs();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePlaybackRecord = async () => {
    if (!isAuthenticated) return;

    try {
      await axios.post(`/api/songs/${song._id}/play`);
    } catch (error) {
      console.error('Error recording playback:', error);
    }
  };

  const handlePlay = () => {
    onPlay(song);
    handlePlaybackRecord();
  };

  const handleAddToPlaylist = () => {
    setShowPlaylistDialog(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={`/covers/${song.coverImage}`}
          alt={`${song.title} by ${song.artist}`}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/covers/default-cover.jpg';
          }}
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity opacity-0 hover:opacity-100"
        >
          <div className="bg-white rounded-full p-3">
            {isPlaying ? (
              <FaPause className="text-gray-800 text-xl" />
            ) : (
              <FaPlay className="text-gray-800 text-xl" />
            )}
          </div>
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{song.title}</h3>
        <p className="text-gray-600 text-sm">{song.artist}</p>

        <div className="flex justify-between items-center mt-3">
          <button
            onClick={handleLikeToggle}
            className="text-gray-600 hover:text-red-500 transition"
          >
            {isLiked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
          </button>

          <button
            onClick={handleAddToPlaylist}
            className="text-gray-600 hover:text-blue-500 transition"
            title="Add to playlist"
          >
            <FaPlus />
          </button>

          <div className="text-xs text-gray-500">
            {song.mood}
          </div>
        </div>
      </div>

      {/* Playlist Dialog */}
      <SongDialog
        isOpen={showPlaylistDialog}
        onClose={() => setShowPlaylistDialog(false)}
        songId={song._id}
      />
    </div>
  );
};

export default SongCard; 