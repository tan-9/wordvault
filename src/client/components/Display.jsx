import { useGame } from "../context/GameContext.jsx";

const Display = () => {
  const { selectedLetters } = useGame();

  const word = selectedLetters.map((letter) => letter.letter).join("");

  return (
    <div className="flex justify-center items-center">
      <div
        className={`font-fredoka font-semibold text-plum tracking-[0.15em] rounded-full px-6 py-1 min-w-[8ch] ${
          word
            ? "bg-blush-100 border-2 border-blush-200"
            : "border-2 border-transparent"
        }`}
      >
        {word}
      </div>
    </div>
  );
};

export default Display;
