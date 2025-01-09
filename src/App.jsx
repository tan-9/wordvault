import React, {useState} from "react";
import Grid from "../components/Grid.jsx";
import Display from "../components/Display.jsx"
import DisplayFormedWords from "../components/DisplayFormedWords.jsx";
import Timer from "../components/Timer.jsx"
import DisplayScore from "../components/DisplayScore.jsx";
import GameRoom from "../components/GameRoom.jsx";

function App() {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [isTimerActive, setisTimerActive] = useState(false);
  const [isGameplayed, setisGameplayed] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [validWords, setValidWords] = useState([]);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  const resetGame = () => {
    setSelectedLetters([]);
    setFoundWords([]);
    setTotalScore(0);
    setValidWords([]);
  };

  const startNewGame = () => {
    resetGame();
    setisTimerActive(true);
    setisGameplayed(true);
  };

  const stopGame = () => {
    setisTimerActive(false);
    setisGameplayed(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-stone-300">
      <div className="flex flex-col items-center px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Word Grid Game</h1>
          <p className="text-gray-600">
            Drag to connect letters and form words!
          </p>
        </header>
        
        {
          !isGameplayed && (
            <GameRoom isTimerActive={isTimerActive} setisTimerActive={(isTimerActive) => isTimerActive ? startNewGame() : stopGame() } 
                      hasJoinedRoom={hasJoinedRoom} setHasJoinedRoom={setHasJoinedRoom} />
          )
        }

        {isTimerActive &&  (
          <div className="flex flex-col md:flex-row items-center justify-center space-x-4 w-full max-w-5xl bg-white shadow-xl rounded-lg p-6">
            <div className="flex justify-between container space-x-20 w-full"> 
            <Timer isTimerActive={isTimerActive} setisTimerActive={(isTimerActive) => isTimerActive ? startNewGame() : stopGame() } />
              <div className="flex flex-col items-start w-1/2"> 
                <div className="h-12 text-2xl text-center tracking-wider items-center align-middle mx-auto relative overflow-hidden">
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
                <h2 className="text-lg font-semibold mb-4">Words Formed:</h2>
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
        )}

        {isGameplayed && !isTimerActive && (
          <div className="ml-1 mt-3 flex flex-col gap-4 text-center"> 
            <DisplayScore totalScore={totalScore} validWords={validWords} setValidWords={setValidWords}/> 
            <div>
              <div className="p-2 rounded-lg">
                <button onClick={() => {
                  resetGame();
                  setisGameplayed(false);
                }}
                style={
                  {
                    backgroundColor: "#c2fbd7",
                    paddingLeft: '11px',
                    paddingRight: '11px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    borderRadius: '20px',
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)"
                  }
                }>
                  <div className="pl-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                    </svg>
                  </div>
                  <div className="text-sm">go home</div>
                </button>
              </div>              
            </div>
          </div>

        )}
      </div>
    </div>

  );
}

export default App;

