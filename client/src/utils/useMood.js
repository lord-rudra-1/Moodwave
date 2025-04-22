import { useContext } from 'react';
import MoodContext from '../context/MoodContext';

const useMood = () => {
  return useContext(MoodContext);
};

export default useMood; 