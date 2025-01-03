import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
import boardData from '../data/board.json';
import wordsData from '../data/words.json';

const Grid = () => {
    const [selectedPath, setSelectedPath] = useState([]);
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [foundWords, setFoundWords] = useState([]);
    const [blinkingButton, setBlinkingButton] = useState(null);
    const grid = useMemo(() => boardData.board, []);
    const validWords = useMemo(() => wordsData.words.split(", "), []);

    const svgRef = useRef(null);
    const gridRef = useRef(null);

    const isAdjacent = (prev, curr) => {
        const dx = Math.abs(prev.rowIdx - curr.rowIdx);
        const dy = Math.abs(prev.colIdx - curr.colIdx);

        return dx<=1 && dy<=1 && dx+dy>0;
    }

    const handleDragStart = useCallback(
        (rowIdx, colIdx) => {
            setIsDragging(true);
            setSelectedLetters([
                {rowIdx, colIdx, letter: grid[rowIdx][colIdx]},
            ]);
        },
        [grid]
    );

    const handleDrag = useCallback(
        (rowIdx, colIdx) => {
            if(isDragging){
                setSelectedLetters((prev) => {
                    const lastLetter = prev[prev.length-1];
                    const newLetter = {
                        rowIdx, colIdx, letter: grid[rowIdx][colIdx],
                    };

                    if (prev.slice(0, -1).some(letter => letter.rowIdx === rowIdx && letter.colIdx === colIdx)) {
                        return prev;
                    }

                    if(!isAdjacent(lastLetter, newLetter)){
                      console.log("line 56");
                      return prev;
                    };

                    return [...prev, newLetter];
                });
            }
        },
        [isDragging, grid]
    );

    const handleDragEnd = () => {
        setIsDragging(false);
        const formedWord = selectedLetters.map((letter) => letter.letter).join("");
        console.log("Word formed: ", formedWord);

        if(validWords.includes(formedWord)){
            const newWord = {
                word: formedWord,
                letters: selectedLetters,
                isAnswer: true,
            };
            setFoundWords((prev) => [...prev, newWord]);
        } else{
            console.log("Invalid Word: ", formedWord);
        }

        setSelectedLetters([]);
    };

    const handleClick = (rowIndex, colIndex) => {
      setBlinkingButton(`${rowIndex}-${colIndex}`);
      setTimeout(()=>{
        setBlinkingButton(null)
      }, 100); 
    };

    return (
      <div className="relative">
        {/* Adjust grid styles to dynamically use the number of columns based on board data */}
        <div
        style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' , gap: '8px'}}
        ref={gridRef}>
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleClick(rowIndex, colIndex)}
                style={{
                    backgroundColor: blinkingButton=== `${rowIndex}-${colIndex}` ? 'blue' : 'pink',
                    aspectRatio: '1',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                }}
                
                onMouseDown={() => handleDragStart(rowIndex, colIndex)}
                onMouseEnter={() => handleDrag(rowIndex, colIndex)}
                onMouseUp={handleDragEnd}
                aria-label={`${letter} at row ${rowIndex + 1}, column ${colIndex + 1}`}
            >
                {letter}
            </button>
              // <button
              //   key={`${rowIndex}-${colIndex}`}
              //   className={`rounded-full flex items-center justify-center border-0 hover:bg-gray-300 transition-colors duration-100 ease-in-out aspect-square text-sm sm:text-base md:text-lg font-bold p-0 z-20 relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
              //     selectedLetters.some(
              //       (l) => l.rowIdx === rowIndex && l.colIdx === colIndex
              //     )
              //       ? 'bg-green-500'
              //       : 'bg-gray-200'
              //   }`}
              //   onMouseDown={() => handleDragStart(rowIndex, colIndex)}
              //   onMouseEnter={() => handleDrag(rowIndex, colIndex)}
              //   onMouseUp={handleDragEnd}
              //   aria-label={`${letter} at row ${rowIndex + 1}, column ${colIndex + 1}`}
              // >
              //   {letter}
              // </button>
            ))
          )}
        </div>
      </div>
    );

}

export default Grid;

// import React from "react";
// import boardData from '../data/board.json';

// const Grid = () => {
//     // Simple debugging check
//     console.log("Board data:", boardData);
    
//     return (
//         <div className="border-2 border-red-500 m-4">
//             <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px'}}>
//                 {boardData.board.map((row, rowIdx) =>
//                     row.map((letter, colIdx) => (
//                         <button
//                             key={`${rowIdx}-${colIdx}`}
//                             style={{
//                                 backgroundColor: '#f3f4f6',
//                                 aspectRatio: '1',
//                                 borderRadius: '8px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 fontWeight: 'bold'
//                             }}
//                         >
//                             {letter}
//                         </button>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Grid;