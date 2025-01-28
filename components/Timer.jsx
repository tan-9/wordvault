import React, { useState, useEffect } from "react";

const Timer = ({socket, isTimerActive, setisTimerActive, roomId}) => {
    const [timeLeft, setTimeLeft] = useState(60); 

    useEffect(() => {
        let timer;
        if (isTimerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1); 
            }, 1000);
        } 
        
        else if (timeLeft === 0) {
            socket.emit("stop_game", {roomId});
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


    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="text-lg font-bold" style={{fontFamily: 'poppins'}}>{isTimerActive ? `Time Left: ${formatTime(timeLeft)}` : "Press Start to Begin"}</div>
        </div>
    );
};

export default Timer;
