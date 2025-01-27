import React, { useState, useEffect } from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";

const DisplayScore = ({ totalScore, validWords, socket, roomId }) => {
    const [gameResults, setGameResults] = useState(null);

    useEffect(() => {
        if (socket) {
            console.log('Socket connected:', socket.connected);
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            console.log("registering game stopped listener");
            socket.on("game_stopped", (data, callback) => {
                console.log("Game stopped data:", data);
                setGameResults(data);
                if(callback){
                    console.log("callback invoked");
                    callback();
                }
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
        if (!gameResults && roomId) {
            fetch(`http://localhost:5000/game-results/${roomId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Fetched game results:", data);
                    setGameResults(data);
                })
                .catch((err) => console.error("Error fetching game results:", err));
        }
    }, [gameResults, roomId]);
    
    
    useEffect(() => {
        console.log("Game results updated:", gameResults);
    }, [gameResults]);
    

    if (gameResults) {
        const sortedPlayers = [...gameResults.players].sort((a, b) => 
            (gameResults.scores[b] || 0) - (gameResults.scores[a] || 0)
        );
        const winner = sortedPlayers[0];

        return (
            <div className="bg-white rounded-xl shadow-2xl p-6" style={{ fontFamily: "poppins" }}>
      <div className="text-center text-xl font-bold text-green-600 mb-4">
        {winner} wins with {gameResults.scores[winner]} points! 🎉
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Player</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Score</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Words</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlayers.map((player) => (
              <TableRow key={player}>
                <TableCell>
                  {player} {player === winner && "👑"}
                </TableCell>
                <TableCell>{gameResults.scores[player] || 0}</TableCell>
                <TableCell>
                  {gameResults.words[player]?.map(({ word, score }, idx) => (
                    <span key={idx}>
                      {word} ({score})
                      {idx < gameResults.words[player].length - 1 && ", "}
                    </span>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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