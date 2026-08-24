import { useGame } from "../context/GameContext.jsx";

const Display = () => {
  const { selectedLetters } = useGame();

  return (
    <div className="flex justify-center items-center">
      <div className="font-bold">
        {selectedLetters.map((letter) => letter.letter).join("")}
      </div>
    </div>
  );
};

export default Display;
