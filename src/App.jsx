import React, {useState} from "react";
import Grid from "../components/Grid.jsx";
import Display from "../components/Display.jsx"
import DisplayFormedWords from "../components/DisplayFormedWords.jsx";

function App() {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);

  return (
    <div className="min-h-full bg-rose-100">
    <div className="flex flex-col items-center container p-4 pb-10">
    <header className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4">Word Grid Game</h1>
      <p className="text-gray-600">
        Drag to connect letters and form words!
      </p>
    </header>
    <div className="bg-white rounded-2xl px-24 py-3 pb-6 shadow-2xl">
    <div className="flex justify-between container space-x-20 w-full"> 
      <div className="flex flex-col items-start  w-1/2"> 
        <div className="h-10 text-2xl text-center tracking-wider items-center mx-auto align-middle">
          <Display displayLetters={selectedLetters} />
        </div>

        <div className="max-w-xl items-center bg-slate-100 max-h-lvh rounded-xl shadow-2xl p-4">
          <Grid selectedLetters={selectedLetters} setSelectedLetters={setSelectedLetters}
          foundWords={foundWords} setFoundWords={setFoundWords} />
        </div>
      </div>

      <div className="flex flex-col items-start my-auto px-4 w-1/2">
        <div className="rounded-xl text-xl ml-8 shadow-2xl p-4 mb-2 ">
          <DisplayFormedWords foundWords={foundWords} />
        </div>
      </div>
    </div>
    </div>
  </div>
</div>

  );
}

export default App;