import { useGame } from "../context/GameContext.jsx";

const DisplayFormedWords = () => {
  const { validWords, totalScore } = useGame();

  return (
    <div
      className="flex flex-col justify-center items-center w-full"
      style={{ fontFamily: "poppins", fontSize: "18px" }}
    >
      <div className="flex flex-row items-center gap-2 mb-4 flex-shrink-0">
        <div className="text-md text-plum/80">Total Score:</div>
        <div className="font-fredoka font-semibold text-lg text-plum bg-white rounded-full px-3 py-0.5">
          {totalScore}
        </div>
      </div>
      <div className="w-full flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-1">
        {validWords.map(({ word, score }, idx) => (
          <div
            key={idx}
            className="flex flex-row justify-between items-center bg-white/60 rounded-full px-3 py-1"
          >
            <span className="text-plum">{word}</span>
            <span className="font-fredoka font-semibold text-plum">
              {score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayFormedWords;
