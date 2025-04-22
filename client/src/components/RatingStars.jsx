import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import useAuth from '../utils/useAuth';

const RatingStars = ({ songId }) => {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch average rating and user's rating when component mounts
    useEffect(() => {
        if (songId) {
            fetchAverageRating();
            if (isAuthenticated) {
                fetchUserRating();
            }
        }
    }, [songId, isAuthenticated]);

    const fetchAverageRating = async () => {
        try {
            const { data } = await axios.get(`/api/songs/${songId}/rating`);
            setAverageRating(data.averageRating);
            setTotalRatings(data.totalRatings);
        } catch (error) {
            console.error('Error fetching song rating:', error);
        }
    };

    const fetchUserRating = async () => {
        try {
            const { data } = await axios.get(`/api/songs/${songId}/myrating`);
            setRating(data.rating);
        } catch (error) {
            console.error('Error fetching user rating:', error);
        }
    };

    const handleRating = async (newRating) => {
        if (!isAuthenticated) {
            setError('Please log in to rate songs');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.post(`/api/songs/${songId}/rate`, { rating: newRating });

            setRating(data.userRating);
            setAverageRating(data.averageRating);
            setTotalRatings(data.totalRatings);
            setError(null);
        } catch (error) {
            console.error('Error rating song:', error);
            setError('Failed to save rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center mt-2">
            <div className="flex items-center mb-1">
                {/* Display the star rating UI */}
                <div className="flex">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <button
                                key={starValue}
                                type="button"
                                className={`text-lg focus:outline-none ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                onClick={() => !loading && handleRating(starValue)}
                                onMouseEnter={() => isAuthenticated && setHover(starValue)}
                                onMouseLeave={() => setHover(0)}
                                disabled={loading}
                            >
                                <FaStar
                                    className={`transition-colors ${(hover || rating) >= starValue
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Average rating display */}
            <div className="text-xs text-gray-500">
                {totalRatings > 0 ? (
                    <span>
                        {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                ) : (
                    <span>No ratings yet</span>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="text-xs text-red-500 mt-1">
                    {error}
                </div>
            )}
        </div>
    );
};

export default RatingStars; 