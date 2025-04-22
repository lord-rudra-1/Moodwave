import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaComment, FaTimes, FaTrash, FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import useAuth from '../utils/useAuth';

const CommentsDialog = ({ isOpen, onClose, songId, songTitle }) => {
    const { isAuthenticated, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && songId) {
            fetchComments();
        }
    }, [isOpen, songId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/songs/${songId}/comments`);
            console.log('Comments fetched:', data);
            setComments(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            setError('Failed to fetch comments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setError('You must be logged in to comment');
            return;
        }

        if (!newComment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const { data } = await axios.post(`/api/songs/${songId}/comments`, {
                comment: newComment
            });

            setComments([data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Error submitting comment:', err);
            setError('Failed to add comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await axios.delete(`/api/comments/${commentId}`);
            setComments(comments.filter(comment => comment._id !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Failed to delete comment. Please try again.');
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FaTimes />
                </button>

                <h2 className="text-xl font-bold mb-4 pr-6">
                    <FaComment className="inline-block mr-2 text-blue-500" />
                    Comments on "{songTitle}"
                </h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 text-sm">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Comment form */}
                <form onSubmit={handleSubmitComment} className="mb-4">
                    <div className="flex items-start gap-2">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-grow border rounded-lg p-2 resize-none"
                            placeholder="Add a comment..."
                            rows={2}
                            disabled={!isAuthenticated || submitting}
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white rounded-lg p-2 disabled:bg-gray-300"
                            disabled={!isAuthenticated || submitting || !newComment.trim()}
                        >
                            {submitting ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <FaPaperPlane />
                            )}
                        </button>
                    </div>
                    {!isAuthenticated && (
                        <p className="text-sm text-gray-500 mt-1">You must be logged in to comment</p>
                    )}
                </form>

                {/* Comments list */}
                <div className="overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {comments.map(comment => (
                                <li key={comment._id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start">
                                            <FaUserCircle className="text-gray-400 text-2xl mt-1 mr-2" />
                                            <div>
                                                <div className="flex items-center">
                                                    <span className="font-medium">
                                                        {comment.userId?.username || 'Anonymous'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mt-1">{comment.comment}</p>
                                            </div>
                                        </div>

                                        {/* Show delete button if user owns this comment */}
                                        {user && comment.userId && user._id === comment.userId._id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete comment"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentsDialog; 