import React, { useState, useEffect } from "react";

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState(60); 
    const [isActive, setIsActive] = useState(false); 
    const startTimer = () => {
        setIsActive(true);
    };

    useEffect(() => {
        let timer;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1); 
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false); 
        }

        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="text-lg font-bold p-2">Time Left: {formatTime(timeLeft)}</div>
            <button
                onClick={startTimer}
                className="mx-4 bg-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={isActive}>
                Start Timer
            </button>
        </div>
    );
};

export default Timer;
