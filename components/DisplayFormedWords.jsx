import React, { useState, useEffect } from "react";

const DisplayFormedWords = ({ foundWords, totalScore, setTotalScore, validWords, setValidWords, playerName, roomId }) => {
    const BACKEND_URL = "https://wordvault-backend.onrender.com";
    const validateLastWord = async (word) => {
        if (!word) return;

        try {
            const response = await fetch(`${BACKEND_URL}/check_word`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    word,
                    player: playerName,
                    roomId: roomId
                }),
            });

            const data = await response.json();
            console.log(data.score);

            if (data.is_Valid) {
                const isDuplicate = validWords.some((item) => item.word === word);

                if (!isDuplicate) {
                    const newValidWord = { word, score: data.score };
                    setValidWords((prev) => [...prev, newValidWord]);
                    setTotalScore((prevScore) => prevScore + data.score);
                }
            }
        } catch (error) {
            console.error("Error validating word:", error);
        }
    };

    useEffect(() => {
        if (foundWords.length > 0) {
            const lastWord = foundWords[foundWords.length - 1];
            validateLastWord(lastWord);
        }
    }, [foundWords]);
    
    return (
        <div className="flex flex-col justify-center items-center" style={{fontFamily: 'poppins', fontSize: '18px'}}>
            <div className="flex flex-row" style={{marginBottom: '12px'}}>
                <div className="text-md pb-8 pr-2">Total Score: </div>
                <div className="px-2 font-bold" style={{paddingLeft: '10px'}}>{totalScore}</div>
            </div>
            <div>
                {validWords.map(({ word, score }, idx) => (
                    <div key={idx} className="flex flex-row">
                        {word}
                        <div className="text-right px-4 font-bold">{score}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DisplayFormedWords;