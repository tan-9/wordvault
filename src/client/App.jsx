import React, { useEffect } from "react";
import Grid from "./components/Grid.jsx";
import Display from "./components/Display.jsx";
import DisplayFormedWords from "./components/DisplayFormedWords.jsx";
import Timer from "./components/Timer.jsx";
import DisplayScore from "./components/DisplayScore.jsx";
import GameRoom from "./components/GameRoom.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useGame } from "./context/GameContext.jsx";

const App = () => {
  const {
    socket,
    isTimerActive,
    isGameplayed,
    setIsGameplayed,
    playSound,
    resetGame,
  } = useGame();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isReload =
      performance.getEntriesByType("navigation")[0]?.type === "reload";
    const hasRoomId =
      location.pathname.includes("room") || location.search.includes("roomId");

    if (isReload && hasRoomId) {
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-200 bg-bgImg overflow-x-hidden">
      <div className="flex flex-col items-center px-4 py-4">
        {!isGameplayed && (
          <div>
            <header className="text-center">
              <h1 className="font-outfit font-medium text-5xl mb-4">
                WordVault
              </h1>
              <p className="font-poppins text-lg text-gray-800">
                Drag to connect letters and form words!
              </p>
            </header>
            <div className="bg-white shadow-lg rounded-lg mt-10">
              <GameRoom />
            </div>
          </div>
        )}

        {isTimerActive && (
          <div className="flex flex-col justify-center items-center w-full px-2">
            <div className="bg-white rounded-md mt-5 mb-3 p-3 w-48 flex flex-col items-center justify-center">
              <Timer />
            </div>
            <div className="flex flex-col items-center justify-center w-full max-w-5xl bg-white shadow-xl rounded-lg p-3 mt-8 md:p-6">
              <div className="flex flex-col md:flex-row justify-between md:space-x-4 w-full gap-4">
                <div className="flex flex-col items-center md:items-start w-full md:w-auto md:flex-1">
                  <div className="h-12 text-2xl text-center tracking-widest self-center justify-center overflow-hidden mb-2">
                    <Display />
                  </div>
                  <div className="w-full p-4 rounded-lg flex bg-slate-200 flex-col items-center overflow-hidden">
                    <div className="w-full max-w-full justify-center">
                      <Grid />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start w-full md:w-64 lg-w-72 bg-green-100 md:p-4 rounded-lg flex-shrink-0">
                  <h2 className="text-base md:text-lg font-semibold mb-4 font-outfit">
                    Words Formed:
                  </h2>
                  <DisplayFormedWords />
                </div>
              </div>
            </div>
          </div>
        )}

        {isGameplayed && !isTimerActive && (
          <div className="ml-1 mt-3 flex flex-col gap-4 text-center">
            <DisplayScore />
            <button
              onClick={() => {
                playSound();
                resetGame();
                setIsGameplayed(false);
              }}
              style={{
                display: "inline-block",
                paddingLeft: "25px",
                paddingRight: "25px",
                paddingTop: "15px",
                paddingBottom: "15px",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "6px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                borderRadius: "100px",
                backgroundColor: "#c2fbd7",
                fontFamily: "poppins",
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
