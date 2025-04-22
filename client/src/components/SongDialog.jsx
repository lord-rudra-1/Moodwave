import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes } from 'react-icons/fa';

const SongDialog = ({ isOpen, onClose, songId }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [addingToPlaylist, setAddingToPlaylist] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
        }
    }, [isOpen]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/playlists');
            setPlaylists(data);
            setError(null);
            if (data.length > 0) {
                setSelectedPlaylist(data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch playlists:', err);
            setError('Failed to fetch playlists. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPlaylist = async (e) => {
        e.preventDefault();

        if (!selectedPlaylist) {
            setMessage({ type: 'error', text: 'Please select a playlist' });
            return;
        }

        try {
            setAddingToPlaylist(true);
            await axios.post(`/api/playlists/${selectedPlaylist}/songs`, { songId });
            setMessage({ type: 'success', text: 'Song added to playlist successfully!' });
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error adding song to playlist:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setMessage({ type: 'error', text: err.response.data.message });
            } else {
                setMessage({ type: 'error', text: 'Failed to add song to playlist. Please try again.' });
            }
        } finally {
            setAddingToPlaylist(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FaTimes />
                </button>

                <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>

                {message.text && (
                    <div className={`p-3 mb-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">You don't have any playlists yet.</p>
                        <a
                            href="/playlists"
                            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            Create a Playlist
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleAddToPlaylist}>
                        <div className="mb-4">
                            <label htmlFor="playlist" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Playlist
                            </label>
                            <select
                                id="playlist"
                                className="w-full p-3 border rounded-lg"
                                value={selectedPlaylist}
                                onChange={(e) => setSelectedPlaylist(e.target.value)}
                                disabled={addingToPlaylist}
                            >
                                {playlists.map(playlist => (
                                    <option key={playlist._id} value={playlist._id}>
                                        {playlist.name} {playlist.moodTag && `(${playlist.moodTag})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={addingToPlaylist}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                                disabled={addingToPlaylist}
                            >
                                {addingToPlaylist ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-2" /> Add to Playlist
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SongDialog; 