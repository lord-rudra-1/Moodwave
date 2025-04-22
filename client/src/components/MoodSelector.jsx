import { useState } from 'react';
import useMood from '../utils/useMood';

const moodIcons = {
  Happy: '😊',
  Sad: '😢',
  Energetic: '⚡',
  Calm: '😌',
  Romantic: '💖',
  Melancholic: '🌧️',
  Chill: '🧊'
};

const moodGradients = {
  Happy: 'from-yellow-400 to-orange-500',
  Sad: 'from-blue-400 to-blue-600',
  Energetic: 'from-orange-500 to-red-600',
  Calm: 'from-green-400 to-teal-500',
  Romantic: 'from-pink-400 to-purple-500',
  Melancholic: 'from-indigo-400 to-purple-600',
  Chill: 'from-blue-300 to-indigo-500'
};

const MoodSelector = ({ onMoodSelected }) => {
  const { availableMoods, selectMood } = useMood();
  const [selectedMoodLocal, setSelectedMoodLocal] = useState('');
  const [hoveredMood, setHoveredMood] = useState(null);

  const handleMoodSelect = (mood) => {
    setSelectedMoodLocal(mood);
    selectMood(mood);
    if (onMoodSelected) {
      onMoodSelected(mood);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        {availableMoods.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodSelect(mood)}
            onMouseEnter={() => setHoveredMood(mood)}
            onMouseLeave={() => setHoveredMood(null)}
            className={`
              relative py-6 px-3 rounded-xl flex flex-col items-center justify-center transition-all duration-300
              ${selectedMoodLocal === mood
                ? `bg-gradient-to-br ${moodGradients[mood]} text-white shadow-lg transform scale-105`
                : 'bg-white text-gray-800 shadow-sm hover:shadow-md border border-gray-100'}
              overflow-hidden group
            `}
          >
            <div className={`
              absolute inset-0 bg-gradient-to-br ${moodGradients[mood]} opacity-0 
              ${hoveredMood === mood && selectedMoodLocal !== mood ? 'opacity-10' : ''} 
              transition-opacity duration-300
            `}></div>

            <span className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110">{moodIcons[mood]}</span>
            <span className={`font-medium text-lg ${selectedMoodLocal === mood ? 'text-white' : 'text-gray-700'}`}>{mood}</span>

            {selectedMoodLocal === mood && (
              <span className="absolute bottom-2 right-2 h-3 w-3 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {selectedMoodLocal && (
        <div className="mt-10 text-center">
          <button
            onClick={() => handleMoodSelect(selectedMoodLocal)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Continue with {selectedMoodLocal} Mood
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodSelector; 