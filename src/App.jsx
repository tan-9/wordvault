import React from "react";
import Grid from "../components/Grid.jsx";

function App() {
  return (
    <div className="min-h-screen bg-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Word Grid Game</h1>
          <p className="text-gray-600">
            Drag to connect letters and form words!
          </p>
        </header>
        <main className="container mx-auto px-4 py-12">
        <div className="max-w-md bg-white max-h-lvh mx-auto rounded-xl shadow-2xl p-4 mb-2 relative overflow-hidden">
          <Grid />
        </div>
      </main>
      </div>
    </div>
  );
}

export default App;