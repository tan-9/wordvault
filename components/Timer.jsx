import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const Timer = ({isTimerActive, setisTimerActive}) => {
    const [timeLeft, setTimeLeft] = useState(60); 
    const [isHovered, setIsHovered] = useState(false);

    const startTimer = () => {
        setisTimerActive(true);
    };

    const stopTimer = () => {
        setisTimerActive(false);
        setTimeLeft(60);
    };

    useEffect(() => {
        let timer;
        if (isTimerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1); 
            }, 1000);
        } 
        
        else if (timeLeft === 0) {
            setisTimerActive(false); 
            setTimeLeft(60);
        }

        return () => clearInterval(timer);
    }, [isTimerActive, timeLeft]);


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const playSound = () => {
        const audio = new Audio("../src/assets/button_click.wav");
        audio.volume = 0.5;
        audio.play();
    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="text-lg font-bold">{isTimerActive ? `Time Left: ${formatTime(timeLeft)}` : "Press Start to Begin"}</div>
            <button
                onClick={() => {
                    playSound();
                    isTimerActive ? stopTimer() : startTimer();
                }}
                onMouseEnter={()=> setIsHovered(true)}
                onMouseLeave={()=> setIsHovered(false)}
                className="rounded"
                style={{
                    display: 'inline-block',
                    paddingLeft: '25px',
                    paddingRight: '25px',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '6px',
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                    borderRadius: '100px',
                    backgroundColor: isHovered ? "rgb(135, 255, 179)" : "#c2fbd7",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.3 ease"
                }}>
                {isTimerActive ? "STOP" : "START"}
            </button>
        </div>
    );
};

export default Timer;
