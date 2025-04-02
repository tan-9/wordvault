import React, { useState, useEffect } from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button} from "@mui/material";

const DisplayScore = ({ totalScore, validWords, socket, roomId }) => {
    const [gameResults, setGameResults] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const BACKEND_URL = "https://wordvault-backend.onrender.com";

    useEffect(() => { 
        if (!gameResults && roomId) {
            fetch(`{BACKEND_URL}/game-results/${roomId}`)
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

    const closePopup = () => setSelectedPlayer(null);
    
    useEffect(() => {
        console.log("Game results updated:", gameResults);
    }, [gameResults]);

    if (gameResults && gameResults.players.length>1) {
        const sortedPlayers = [...gameResults.players].sort((a, b) => 
            (gameResults.scores[b] || 0) - (gameResults.scores[a] || 0)
        );
        const winner = sortedPlayers[0];

        return (
            <div style={{ fontFamily: "poppins" }}>
                <div className="text-center text-xl font-bold text-green-600 mb-4">
                    {winner} wins with {gameResults.scores[winner]} points! 🎉
                </div>

                {!selectedPlayer && (
                    <TableContainer component={Paper}>
                    <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell style={{ fontWeight: "bold" }} sx={{ fontFamily: "Poppins, Arial, sans-serif" }}>Player</TableCell>
                        <TableCell style={{ fontWeight: "bold" }} sx={{ fontFamily: "Poppins, Arial, sans-serif" }}>Score</TableCell>
                        <TableCell style={{ fontWeight: "bold" }} sx={{ fontFamily: "Poppins, Arial, sans-serif" }}>Words</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPlayers.map((player) => (
                        <TableRow key={player}>
                            <TableCell sx={{ fontFamily: "Poppins, Arial, sans-serif" }}>
                            {player} {player === winner && "👑"}
                            </TableCell>
                            <TableCell sx={{ fontFamily: "Poppins, Arial, sans-serif" }}>{gameResults.scores[player] || 0}</TableCell>
                            <TableCell>
                                <Button
                                onClick={()=> setSelectedPlayer(player)}
                                variant="text" size="small">
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                )}

      
                {selectedPlayer && (
                    <div className="fixed inset-0 bg-black-100 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">
                                Words Found by <b>{selectedPlayer}</b>
                            </h2>
                            <ul className="space-y-2">
                                {gameResults.words[selectedPlayer]?.map(({ word, score }, idx) => (
                                    <li key={idx} className="text-gray-700">
                                        {word} ({score} points)
                                    </li>
                                ))}
                            </ul>
                            <Button
                                onClick={closePopup}
                                variant="text"
                                color="primary"
                                className="mt-4"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
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