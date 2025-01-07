import React, {useState} from "react";
import Grid from "../components/Grid.jsx";
import Display from "../components/Display.jsx"
import DisplayFormedWords from "../components/DisplayFormedWords.jsx";
import Timer from "../components/Timer.jsx"
import DisplayScore from "../components/DisplayScore.jsx";

function App() {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [isTimerActive, setisTimerActive] = useState(false);
  const [isGameplayed, setisGameplayed] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [validWords, setValidWords] = useState([]);

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
    <div className="min-h-screen flex flex-col items-center bg-rose-100">
      <div className="flex flex-col items-center px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Word Grid Game</h1>
          <p className="text-gray-600">
            Drag to connect letters and form words!
          </p>
        </header>
        <div className="mb-4 gap-2 pb-3">
          <Timer isTimerActive={isTimerActive} setisTimerActive={(isTimerActive) => isTimerActive ? startNewGame() : stopGame() } />
        </div>
        {isTimerActive && (
          <div className="flex flex-col md:flex-row items-center justify-center space-x-4 w-full max-w-5xl bg-white shadow-xl rounded-lg p-6">
            <div className="flex justify-between container space-x-20 w-full"> 
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
          <div className="ml-2 mt-3 flex text-center"> <DisplayScore totalScore={totalScore} validWords={validWords} setValidWords={setValidWords}/> </div>
        )}
      </div>
    </div>

  );
}

export default App;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center">
//       {/* Header */}
//       <header className="text-center mb-8">
//         <h1 className="text-3xl font-bold mb-4">Word Game</h1>
//         <p className="text-gray-600">Form words by connecting letters!</p>
//       </header>

//       {/* Game Content */}
//       <div className="flex flex-col md:flex-row items-center justify-center space-x-4 w-full max-w-5xl bg-white shadow-xl rounded-lg p-6">
//         {/* Player Info Panel */}
//         <div className="flex flex-col items-center w-1/3 bg-green-50 p-4 rounded-lg">
//           <h2 className="text-lg font-semibold">Player: Tanaya</h2>
//           <p className="text-xl font-bold">{totalScore} Points</p>
//           <button
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
//             onClick={resetGame}
//           >
//             Compare Words
//           </button>
//         </div>

//         {/* Game Grid */}
//         <div className="w-1/3 flex flex-col items-center">
//           <div className="w-full">
//             <Grid
//               selectedLetters={selectedLetters}
//               setSelectedLetters={setSelectedLetters}
//               foundWords={foundWords}
//               setFoundWords={setFoundWords}
//             />
//           </div>
//         </div>

//         {/* Words and Score Panel */}
      //   <div className="flex flex-col items-start w-1/3 bg-green-50 p-4 rounded-lg">
      //     <h2 className="text-lg font-semibold mb-4">Words Formed:</h2>
      //     <DisplayFormedWords
      //       foundWords={foundWords}
      //       totalScore={totalScore}
      //       setTotalScore={setTotalScore}
      //       validWords={validWords}
      //       setValidWords={setValidWords}
      //     />
      //   </div>
      // </div>

//       {/* Footer */}
//       {isGameplayed && !isTimerActive && (
//         <div className="mt-4">
//           <DisplayScore
//             totalScore={totalScore}
//             validWords={validWords}
//             setValidWords={setValidWords}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
