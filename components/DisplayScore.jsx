// import React, { useState, useEffect } from "react";

// const DisplayScore = ({totalScore, validWords, setValidWords}) => {
//     return(
//         <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center" style={{fontFamily: 'poppins'}}>
//             <div>You Scored <b>{totalScore}</b> points</div>
//             <div className="mx-2"> <hr className="pb-2 border-t border-gray-300"/></div>
//             <div className="mt-3 flex flex-col gap-2"> 
//                 {validWords.map(({ word, score }, idx) => (
//                     <div key={idx} className="font-bold flex flex-row">
//                         {word}
//                         <div className="text-right px-4">{score}</div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default DisplayScore;

import React, { useState, useEffect } from "react";

const DisplayScore = ({ totalScore, validWords, socket }) => {
    const [gameResults, setGameResults] = useState(null);

    useEffect(() => {
        if (socket) {
            console.log('Socket connected:', socket.connected);
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            console.log("registering game stopped listener");
            socket.on("game_stopped", (data) => {
                console.log("Game stopped data:", data);
                setGameResults(data);
            });
        }
        return () => {
            if (socket) {
                console.log("cleaning up game_stopped listener");
                socket.off("game_stopped");
            }
        };
    }, [socket]);

    useEffect(() => {
        console.log("Game results updated:", gameResults);
    }, [gameResults]);
    

    if (gameResults) {
        const sortedPlayers = [...gameResults.players].sort((a, b) => 
            (gameResults.scores[b] || 0) - (gameResults.scores[a] || 0)
        );
        const winner = sortedPlayers[0];

        return (
            <div className="bg-white rounded-xl shadow-2xl p-6" style={{fontFamily: 'poppins'}}>
                <div className="text-center text-xl font-bold text-green-600 mb-4">
                    {winner} wins with {gameResults.scores[winner]} points! 🎉
                </div>
                
                <div className="space-y-4">
                    {sortedPlayers.map((player) => (
                        <div key={player} className="border-b border-gray-200 pb-4">
                            <div className="font-bold mb-2">
                                {player} ({gameResults.scores[player] || 0} points)
                                {player === winner && " 👑"}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {gameResults.words[player]?.map(({ word, score }, idx) => (
                                    <span key={idx} className="text-gray-700">
                                        {word} ({score})
                                        {idx < gameResults.words[player].length - 1 && ","}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center" style={{fontFamily: 'poppins'}}>
            <div>You Scored <b>{totalScore}</b> points</div>
            <div className="mx-2">
                <hr className="pb-2 border-t border-gray-300"/>
            </div>
            <div className="mt-3 flex flex-col gap-2">
                {validWords.map(({ word, score }, idx) => (
                    <div key={idx} className="font-bold flex flex-row">
                        {word}
                        <div className="text-right px-4">{score}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DisplayScore;