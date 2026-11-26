import { useState } from "react";
import { useGame } from "../context/GameContext.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { useGameResult } from "../hooks/useGameResult";

const DisplayScore = () => {
  const { totalScore, validWords, roomId } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: gameResultsData } = useGameResult(roomId);
  const closePopup = () => setSelectedPlayer(null);

  if (gameResultsData && gameResultsData.players.length > 1) {
    const sortedPlayers = [...gameResultsData.players].sort(
      (a, b) =>
        (gameResultsData.scores[b] || 0) - (gameResultsData.scores[a] || 0),
    );
    const winner = sortedPlayers[0];

    return (
      <div style={{ fontFamily: "poppins", borderRadius: "4px" }}>
        <div className="text-center text-xl font-fredoka font-semibold text-plum bg-gradient-to-br from-blush-100 to-lavender-100 border border-blush-200 rounded-2xl py-3 mb-4">
          {winner} wins with {gameResultsData.scores[winner]} points! 🎉
        </div>

        {!selectedPlayer && (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: "16px", border: "1px solid #ffd6e8" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#fff0f5" }}>
                  <TableCell
                    style={{ fontWeight: "bold" }}
                    sx={{ fontFamily: "Fredoka, sans-serif", color: "#7a3b5e" }}
                  >
                    Player
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold" }}
                    sx={{ fontFamily: "Fredoka, sans-serif", color: "#7a3b5e" }}
                  >
                    Score
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold" }}
                    sx={{ fontFamily: "Fredoka, sans-serif", color: "#7a3b5e" }}
                  >
                    Words
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPlayers.map((player) => (
                  <TableRow key={player}>
                    <TableCell
                      sx={{ fontFamily: "Poppins, Arial, sans-serif" }}
                    >
                      {player} {player === winner && "👑"}
                    </TableCell>
                    <TableCell
                      sx={{ fontFamily: "Poppins, Arial, sans-serif" }}
                    >
                      {gameResultsData.scores[player] || 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setSelectedPlayer(player)}
                        variant="text"
                        size="small"
                        sx={{
                          fontFamily: "Fredoka, sans-serif",
                          color: "#ff6fa8",
                        }}
                      >
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
            <div className="bg-cream border-2 border-blush-200 rounded-2xl p-5 shadow-lg">
              <h2 className="text-xl font-fredoka font-semibold text-plum mb-4">
                Words Found by <b>{selectedPlayer}</b>
              </h2>
              <ul className="space-y-1.5">
                {gameResultsData.words[selectedPlayer]?.map(
                  ({ word, score }, idx) => (
                    <li
                      key={idx}
                      className="text-plum bg-white/70 rounded-full px-3 py-1"
                    >
                      {word} ({score} points)
                    </li>
                  ),
                )}
              </ul>
              <Button
                onClick={closePopup}
                variant="text"
                sx={{ fontFamily: "Fredoka, sans-serif", color: "#ff6fa8" }}
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
    <div
      className="bg-[#fff5f8] border border-blush-200 rounded-2xl shadow-sm p-4 flex flex-col items-center"
      style={{ fontFamily: "poppins" }}
    >
      <div className="text-plum">
        You Scored{" "}
        <span className="font-fredoka font-semibold">{totalScore}</span> points
      </div>
      <div className="mx-2 w-full">
        <hr className="pb-2 border-t border-blush-200" />
      </div>
      <div className="mt-3 flex flex-col gap-1.5 w-full">
        {validWords.map(({ word, score }, idx) => (
          <div
            key={idx}
            className="flex flex-row justify-between items-center bg-white/60 rounded-full px-3 py-1"
          >
            <span className="font-semibold text-plum">{word}</span>
            <span className="font-fredoka text-plum">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayScore;
