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

const MoodSelector = ({ onMoodSelected }) => {
  const { availableMoods, selectMood } = useMood();
  const [selectedMoodLocal, setSelectedMoodLocal] = useState('');

  const handleMoodSelect = (mood) => {
    setSelectedMoodLocal(mood);
    selectMood(mood);
    if (onMoodSelected) {
      onMoodSelected(mood);
    }
  };

  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">How are you feeling today?</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {availableMoods.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodSelect(mood)}
            className={`
              py-4 px-3 rounded-lg flex flex-col items-center justify-center transition-all
              ${selectedMoodLocal === mood 
                ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-800 hover:bg-blue-50 hover:shadow'}
            `}
          >
            <span className="text-3xl mb-2">{moodIcons[mood]}</span>
            <span className="font-medium">{mood}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector; 