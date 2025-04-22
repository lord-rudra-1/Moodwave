import { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute, FaMusic } from 'react-icons/fa';
import axios from 'axios';

const MusicPlayer = ({ currentSong, onNextSong, onPrevSong }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const [audioError, setAudioError] = useState(null);
  const [playRecorded, setPlayRecorded] = useState(false);

  // Determine the correct audio source based on available properties
  const getAudioSource = (song) => {
    if (!song) return '';

    // If song has audioUrl that starts with '/', use it directly
    if (song.audioUrl && song.audioUrl.startsWith('/')) {
      return song.audioUrl;
    }

    // If song has audioUrl but doesn't start with '/', add '/songs/' prefix
    if (song.audioUrl) {
      return `/songs/${song.audioUrl.replace('/songs/', '')}`;
    }

    // Fallback to audioFile if available
    if (song.audioFile) {
      return `/songs/${song.audioFile}`;
    }

    // Ultimate fallback - try to get filename from song title
    return `/songs/${song.title.toLowerCase().replace(/\s+/g, '-')}.mp3`;
  };

  // Record song play in history
  const recordSongPlay = async (songId) => {
    try {
      await axios.post(`/songs/${songId}/play`);
      setPlayRecorded(true);
    } catch (error) {
      console.error('Error recording song play:', error);
    }
  };

  useEffect(() => {
    if (currentSong) {
      console.log('Current song data:', currentSong);
      const audioSrc = getAudioSource(currentSong);
      console.log('Using audio source:', audioSrc);

      // Set the audio source
      if (audioRef.current) {
        audioRef.current.src = audioSrc;

        // Reset error state
        setAudioError(null);

        // Reset play recorded flag
        setPlayRecorded(false);

        // If a new song is loaded, play it automatically
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              // Record the play in history when starting a new song
              recordSongPlay(currentSong._id);
            })
            .catch((error) => {
              console.error('Auto-play prevented:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [currentSong]);

  useEffect(() => {
    // Set volume when it changes
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setAudioError("Could not play this song. Please try another.");
      });
      setIsPlaying(true);

      // Record the play if it's the first time playing this song instance
      if (!playRecorded && currentSong) {
        recordSongPlay(currentSong._id);
      }
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = e.target.value;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleAudioError = (e) => {
    console.error('Audio error:', e);
    setAudioError("Could not load this song. The audio file may be missing or corrupted.");
    setIsPlaying(false);
  };

  const handleSongEnd = () => {
    // Reset play recorded flag before moving to next song
    setPlayRecorded(false);
    onNextSong();
  };

  if (!currentSong) {
    return null;
  }

  // Calculate progress percentage for the custom progress bar
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 shadow-xl backdrop-blur-lg border-t border-indigo-800/50 z-50">
      <div className="container mx-auto">
        {audioError && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white p-2 mb-2 rounded-lg text-sm text-center">
            {audioError}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg overflow-hidden flex items-center justify-center mr-3 shadow-lg">
              {currentSong.coverImage ? (
                <img
                  src={`/covers/${currentSong.coverImage}`}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/covers/default-cover.jpg';
                  }}
                />
              ) : (
                <FaMusic className="text-white/70 text-xl" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{currentSong.title}</h3>
              <p className="text-indigo-200 text-xs">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex-grow max-w-2xl mx-4">
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={onPrevSong}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <FaBackward className="text-lg" />
              </button>
              <button
                onClick={handlePlayPause}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
              >
                {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg ml-0.5" />}
              </button>
              <button
                onClick={onNextSong}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <FaForward className="text-lg" />
              </button>
            </div>

            <div className="flex items-center mt-3">
              <span className="text-xs mr-2 text-indigo-200 w-8 text-right">{formatTime(currentTime)}</span>
              <div className="w-full h-2 bg-indigo-800/50 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs ml-2 text-indigo-200 w-8">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2 md:mt-0">
            <button
              onClick={handleMuteToggle}
              className="text-indigo-200 hover:text-white transition-colors"
            >
              {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
            </button>
            <div className="w-24 h-2 bg-indigo-800/50 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
        onError={handleAudioError}
      />
    </div>
  );
};

export default MusicPlayer; 