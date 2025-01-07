import React, { useState, useEffect } from "react";

const DisplayScore = ({totalScore, validWords, setValidWords}) => {
    return(
        <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col items-center">
            <div>You Scored {totalScore} points</div>
            <div className="mt-2"> 
                {validWords.map(({ word, score }, idx) => (
                    <div key={idx} className="font-bold flex flex-row">
                        {word}
                        <div className="text-right px-4">{score}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DisplayScore;