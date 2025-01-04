import React, {useState} from "react";
import Grid from "../components/Grid.jsx";
import Display from "../components/Display.jsx"

function App() {
  const [selectedLetters, setSelectedLetters] = useState([]);

  return (
    <div className="min-h-screen bg-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Word Grid Game</h1>
          <p className="text-gray-600">
            Drag to connect letters and form words!
          </p>
        </header>
        <main className="flex justify-center container mx-auto px-4"> 
        <div className="max-w-xl bg-white max-h-lvh mx-auto rounded-xl shadow-2xl p-4 mb-2 relative overflow-hidden">
          <Grid selectedLetters={selectedLetters}
          setSelectedLetters={setSelectedLetters} />
        </div>

        <div className="max-w-xl bg-white max-h-lvh mx-auto rounded-xl shadow-2xl p-4 mb-2 relative overflow-hidden">
          <Display displayLetters={selectedLetters} />
        </div>
      </main>
      </div>
    </div>
  );
}

export default App;