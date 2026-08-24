import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import useAudio from "../hooks/useAudio";
import { useValidateWord } from "../hooks/useValidateWord";

const GameContext = createContext(null);

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"],
});

export const GameProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isTimerActive, setisTimerActive] = useState(false);
  const [isGameplayed, setIsGameplayed] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [validWords, setValidWords] = useState([]);
  const [grid, setGrid] = useState([]);
  const [pendingWord, setPendingWord] = useState("");

  const totalScore = useMemo(
    () => validWords.reduce((sum, w) => sum + w.score, 0),
    [validWords],
  );

  const { data: validationResult } = useValidateWord(
    pendingWord,
    playerName,
    roomId,
  );

  useEffect(() => {
    if (!validationResult || !pendingWord) return;

    if (validationResult.is_Valid) {
      const isDuplicate = validWords.some((item) => item.word === pendingWord);
      if (!isDuplicate) {
        setValidWords((prev) => [
          ...prev,
          { word: pendingWord, score: validationResult.score },
        ]);
      }
    }
    setPendingWord("");
  }, [validationResult]);

  const addWord = (word) => {
    setPendingWord(word);
  };

  const playSound = useAudio("button_click.wav");

  const resetGame = () => {
    setSelectedLetters([]);
    setFoundWords([]);
    setValidWords([]);
  };

  useEffect(() => {
    socket.on("game_started", ({ grid }) => {
      resetGame();
      setGrid(grid);
      setisTimerActive(true);
      setIsGameplayed(true);
    });

    socket.on("game_stopped", () => {
      setisTimerActive(false);
      setIsGameplayed(true);
    });

    return () => {
      socket.off("game_started");
      socket.off("game_stopped");
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        socket,
        roomId,
        setRoomId,
        playerName,
        setPlayerName,
        isTimerActive,
        setisTimerActive,
        isGameplayed,
        setIsGameplayed,
        hasJoinedRoom,
        setHasJoinedRoom,
        selectedLetters,
        setSelectedLetters,
        foundWords,
        setFoundWords,
        totalScore,
        validWords,
        setValidWords,
        grid,
        setGrid,
        playSound,
        resetGame,
        addWord,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
