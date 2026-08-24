import { useGame } from "../context/GameContext.jsx";

const DisplayFormedWords = () => {
  const { validWords, totalScore } = useGame();

  return (
    <div
      className="flex flex-col justify-center items-center"
      style={{ fontFamily: "poppins", fontSize: "18px" }}
    >
      <div className="flex flex-row" style={{ marginBottom: "12px" }}>
        <div className="text-md pb-8 pr-2">Total Score: </div>
        <div className="px-2 font-bold" style={{ paddingLeft: "10px" }}>
          {totalScore}
        </div>
      </div>
      <div>
        {validWords.map(({ word, score }, idx) => (
          <div key={idx} className="flex flex-row">
            {word}
            <div className="text-right px-4 font-bold">{score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayFormedWords;
