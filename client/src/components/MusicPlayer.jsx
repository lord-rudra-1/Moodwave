import { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const MusicPlayer = ({ currentSong, onNextSong, onPrevSong }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const [audioError, setAudioError] = useState(null);

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

        // If a new song is loaded, play it automatically
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
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
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setAudioError("Could not play this song. Please try another.");
      });
    }
    setIsPlaying(!isPlaying);
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

  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto">
        {audioError && (
          <div className="bg-red-500 text-white p-2 mb-2 rounded text-sm text-center">
            {audioError}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="mr-4">
              <h3 className="font-semibold">{currentSong.title}</h3>
              <p className="text-gray-400 text-sm">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex-grow max-w-2xl mx-4">
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={onPrevSong}
                className="text-gray-400 hover:text-white transition"
              >
                <FaBackward />
              </button>
              <button
                onClick={handlePlayPause}
                className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-200 transition"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                onClick={onNextSong}
                className="text-gray-400 hover:text-white transition"
              >
                <FaForward />
              </button>
            </div>

            <div className="flex items-center mt-2">
              <span className="text-xs mr-2">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs ml-2">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button onClick={handleMuteToggle}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNextSong}
        onError={handleAudioError}
      />
    </div>
  );
};

export default MusicPlayer; 