import React, {useState, useEffect} from "react";
import Grid from "../components/Grid.jsx";
import Display from "../components/Display.jsx"
import DisplayFormedWords from "../components/DisplayFormedWords.jsx";
import Timer from "../components/Timer.jsx"
import DisplayScore from "../components/DisplayScore.jsx";
import GameRoom from "../components/GameRoom.jsx";
import { io } from "socket.io-client";
import { BrowserRouter } from "react-router-dom";

const socket = io("http://localhost:5000");

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [isTimerActive, setisTimerActive] = useState(false);
  const [isGameplayed, setisGameplayed] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [validWords, setValidWords] = useState([]);

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

  const resetGame = () => {
    setSelectedLetters([]);
    setFoundWords([]);
    setTotalScore(0);
    setValidWords([]);
  };

  // Handle socket events for game state
  useEffect(() => {
    socket.on("game_started", () => {
      resetGame();
      setisTimerActive(true);
      setisGameplayed(true);
    });

    socket.on("game_stopped", () => {
      setisTimerActive(false);
      setisGameplayed(true);
    });

    return () => {
      socket.off("game_started");
      socket.off("game_stopped");
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col items-center bg-stone-300">
        <div className="flex flex-col items-center px-4 py-8">
          
          {!isGameplayed && (
            <div>
              <header className="text-center">
                <h1 className="font-outfit font-medium text-5xl mb-4">Word Grid Game</h1>
                <p className="font-poppins text-lg text-gray-800">
                  Drag to connect letters and form words!
                </p>
              </header>
            <div className="bg-white mt-11 p-6 flex flex-col items-center gap-2 rounded-xl shadow-2xl">
              <GameRoom 
                socket={socket}
                isTimerActive={isTimerActive}
                setisTimerActive={setisTimerActive}
                hasJoinedRoom={hasJoinedRoom} 
                setHasJoinedRoom={setHasJoinedRoom} 
                setRoomId={setRoomId}
              />
            </div>
            </div>
          )}

          {isTimerActive &&  (
              <div className="flex flex-col justify-center items-center self-center">
                <div className="bg-white rounded-md my-3 p-3 w-48 flex flex-col items-center justify-center">
                    <Timer 
                        socket={socket}
                        isTimerActive={isTimerActive} 
                        setisTimerActive={setisTimerActive}
                        roomId={roomId}
                      />
                  </div>
                <div className="flex md:flex-row items-center justify-center space-x-4 w-full max-w-5xl bg-white shadow-xl rounded-lg p-6">
                  <div className="flex justify-between container space-x-20 w-full"> 
                    <div className="flex flex-col items-start w-1/2"> 
                      <div className="h-12 text-2xl text-center tracking-widest self-center justify-center ml-20 text-center align-middle overflow-hidden">
                        <Display displayLetters={selectedLetters} />
                      </div>
                      <div className="w-max p-4 rounded-lg flex bg-slate-200 flex-col items-center">
                        <div className="w-full">
                          <Grid
                            selectedLetters={selectedLetters}
                            setSelectedLetters={setSelectedLetters}
                            foundWords={foundWords}
                            setFoundWords={setFoundWords}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start w-1/3 bg-green-100 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold mb-4 font-outfit">Words Formed:</h2>
                      <DisplayFormedWords
                        foundWords={foundWords}
                        totalScore={totalScore}
                        setTotalScore={setTotalScore}
                        validWords={validWords}
                        setValidWords={setValidWords}
                      />
                    </div>
                  </div>
                </div>
              </div>
          )}

          {isGameplayed && !isTimerActive && (
            <div className="ml-1 mt-8 flex flex-col gap-4 text-center">
              <DisplayScore 
                totalScore={totalScore} 
                validWords={validWords} 
                setValidWords={setValidWords}
              />
              <button
                onClick={() => {
                  resetGame();
                  setisGameplayed(false);
                }}
                style={{
                  display: 'inline-block',
                  fontFamily: 'poppins',
                  fontSize: '20px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  paddingTop: '14px',
                  paddingBottom: '13px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '6px',
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                  borderRadius: '100px',
                  backgroundColor:  "#c2fbd7"
              }}>
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
    </div>
    </BrowserRouter>
  );
};

export default App;


