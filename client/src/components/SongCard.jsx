import { useState } from 'react';
import { FaPlay, FaPause, FaPlus, FaComment } from 'react-icons/fa';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import SongDialog from './SongDialog';
import RatingStars from './RatingStars';

const SongCard = ({ song, onPlay, isPlaying, refreshSongs, onOpenComments }) => {
  const { isAuthenticated } = useAuth();
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlaybackRecord = async () => {
    if (!isAuthenticated) return;

    try {
      await axios.post(`/songs/${song._id}/play`);
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

  const handleOpenComments = () => {
    onOpenComments(song);
  };

  return (
    <div
      className="card group relative transform transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="aspect-square w-full">
          <img
            src={`/covers/${song.coverImage}`}
            alt={`${song.title} by ${song.artist}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/covers/default-cover.jpg';
            }}
          />
        </div>

        {/* Dark overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Play button */}
        <button
          onClick={handlePlay}
          className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}
        >
          <div className={`bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg transform transition-transform duration-300 ${isHovered ? 'scale-100' : 'scale-90'} ${isPlaying ? 'scale-100' : ''}`}>
            {isPlaying ? (
              <FaPause className="text-indigo-600 text-xl" />
            ) : (
              <FaPlay className="text-indigo-600 text-xl ml-0.5" />
            )}
          </div>
        </button>

        {/* Mood tag */}
        <div className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-indigo-700">
          {song.mood}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate text-gray-800">{song.title}</h3>
        <p className="text-gray-500 text-sm mb-2">{song.artist}</p>

        {/* Star Rating */}
        <RatingStars songId={song._id} />

        <div className="flex justify-between items-center mt-3">
          <button
            onClick={handleOpenComments}
            className="text-gray-400 hover:text-indigo-500 transition p-2 rounded-full hover:bg-indigo-50"
            title="Comments"
          >
            <FaComment />
          </button>

          <button
            onClick={handleAddToPlaylist}
            className="text-gray-400 hover:text-indigo-500 transition p-2 rounded-full hover:bg-indigo-50"
            title="Add to playlist"
          >
            <FaPlus />
          </button>
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