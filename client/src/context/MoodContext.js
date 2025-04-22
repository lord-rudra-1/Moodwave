import { createContext, useState, useEffect } from 'react';

const MoodContext = createContext();

export const MoodProvider = ({ children }) => {
  const [selectedMood, setSelectedMood] = useState(localStorage.getItem('selectedMood') || '');
  const [availableMoods] = useState([
    'Happy', 
    'Sad', 
    'Energetic', 
    'Calm', 
    'Romantic', 
    'Melancholic', 
    'Chill'
  ]);

  // Store selected mood in localStorage
  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('selectedMood', selectedMood);
    } else {
      localStorage.removeItem('selectedMood');
    }
  }, [selectedMood]);

  const selectMood = (mood) => {
    setSelectedMood(mood);
  };

  const clearMood = () => {
    setSelectedMood('');
  };

  return (
    <MoodContext.Provider
      value={{
        selectedMood,
        availableMoods,
        selectMood,
        clearMood,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export default MoodContext; 