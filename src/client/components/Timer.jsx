import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext.jsx";

const DURATION = 60; // seconds

const Timer = () => {
  const { socket, isTimerActive, setisTimerActive, roomId } = useGame();
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const endTimeRef = useRef(null);

  useEffect(() => {
    if (isTimerActive) {
      endTimeRef.current = Date.now() + DURATION * 1000;
      setTimeLeft(DURATION);
    } else {
      endTimeRef.current = null;
    }
  }, [isTimerActive]);

  useEffect(() => {
    if (!isTimerActive) return;

    const tick = () => {
      if (endTimeRef.current == null) return;
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000),
      );
      setTimeLeft(remaining);

      if (remaining === 0) {
        socket.emit("stop_game", { roomId });
        setisTimerActive(false);
      }
    };

    tick(); // sync immediately on start
    const interval = setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isTimerActive, roomId, socket, setisTimerActive]);

  useEffect(() => {
    socket.on("game_stopped", () => {
      console.log("Game stopped by a player");
      setisTimerActive(false);
      setTimeLeft(DURATION);
    });

    return () => {
      socket.off("game_stopped");
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="text-lg font-bold" style={{ fontFamily: "poppins" }}>
        {isTimerActive
          ? `Time Left: ${formatTime(timeLeft)}`
          : "Press Start to Begin"}
      </div>
    </div>
  );
};

export default Timer;
