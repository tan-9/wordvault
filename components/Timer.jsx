import React, { useState, useEffect } from "react";

const Timer = ({socket, isTimerActive, setisTimerActive, roomId}) => {
    const [timeLeft, setTimeLeft] = useState(60); 
    const [isHovered, setIsHovered] = useState(false);

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
    }, [isTimerActive, timeLeft, roomId]);

    useEffect(()=>{
        if(isTimerActive){
            setTimeLeft(60);
        }
    }, [isTimerActive]);

    const stopTimer = () => {
        console.log({roomId});
        socket.emit("stop_game", {roomId});
        setTimeLeft(60);
        // setisTimerActive(false);
    };

    useEffect(() => {
        socket.on("game_stopped", () => {
            console.log("Game stopped by a player");
            setisTimerActive(false);
            setTimeLeft(60);
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
                    stopTimer() ;
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
                STOP
            </button>
        </div>
    );
};

export default Timer;
