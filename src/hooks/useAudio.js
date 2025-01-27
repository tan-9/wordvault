import { useRef } from "react";

const useAudio = (src) => {
  const audioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(src);
    audioRef.current.volume = 0.5; 
  }

  const play = () => {
    audioRef.current.currentTime = 0; 
    audioRef.current.play();
  };

  return play;
};

export default useAudio;
