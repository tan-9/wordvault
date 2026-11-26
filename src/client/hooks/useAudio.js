import { useRef } from "react";

const useAudio = (src) => {
  const audioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(src);
    audioRef.current.volume = 0.5;
  }

  const play = () => {
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Audio play error:", error);
      });
    } catch (error) {
      console.error("Audio initialization error:", error);
    }
  };

  return play;
};

export default useAudio;
