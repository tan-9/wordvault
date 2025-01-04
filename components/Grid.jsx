import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
import boardData from '../data/board.json';
import wordsData from '../data/words.json';

const Grid = ({selectedLetters, setSelectedLetters}) => {
    const [selectedPath, setSelectedPath] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [foundWords, setFoundWords] = useState([]);
    const [blinkingButton, setBlinkingButton] = useState(null);
    const grid = useMemo(() => boardData.board, []);
    const validWords = useMemo(() => wordsData.words.split(", "), []);
    const [lines, setLines] = useState([]);

    const svgRef = useRef(null);
    const gridRef = useRef(null);

    const getBtnPos = useCallback((rowIdx, colIdx) => {
      if(!gridRef.current){
        console.error("gridRef.current is undefined/null");
        return { x: 0, y: 0, width: 0, height: 0};
      }

      const button = gridRef.current.querySelector(`#button-${rowIdx}-${colIdx}`);
      // console.log("button: ", button);

      if(!button) return { x: 0, y: 0, width: 0, height: 0};

      const rect = button.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();

      return{
        x: rect.left - gridRect.left, y: rect.top - gridRect.top, width: rect.width, height: rect.height,
      };
    }, []);

    const clearSVG = useCallback(() => {
      const svg = svgRef.current;
      if (svg) {
        while (svg.firstChild) {
          svg.removeChild(svg.firstChild);
        }
      }
    }, []);

    const drawLine = useCallback(
      (letters, color) => {
        const svg = svgRef.current;
        if (!svg || !gridRef.current) return;
  
        clearSVG();
  
        letters.forEach((letter, index) => {
          if (index === 0) return;
          const prev = letters[index - 1];
          const { x: x1, y: y1, width: w1, height: h1 } = getBtnPos(
            prev.rowIdx,
            prev.colIdx
          );
          const { x: x2, y: y2, width: w2, height: h2 } = getBtnPos(
            letter.rowIdx,
            letter.colIdx
          );

          // console.log('line 61');
          // console.log(x1, x2, y1, y2);
  
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", String(x1 + w1/2));
          line.setAttribute("y1", String(y1 + h1/2));
          line.setAttribute("x2", String(x2 + w2/2));
          line.setAttribute("y2", String(y2 + h2/2));
          line.setAttribute("stroke", color);
          line.setAttribute("stroke-width", "6");
          line.setAttribute("stroke-linecap", "round");
          line.setAttribute("stroke-linejoin", "round");
          svg.appendChild(line);
        });
      },
      [getBtnPos, clearSVG]
    );

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

                    const updatedLetters = [...prev, newLetter];
                    console.log(updatedLetters);
                    drawLine(updatedLetters);
                    return updatedLetters;
                });
            }
        },
        [isDragging, grid, drawLine]
    );

    const handleDragEnd = () => {
        setIsDragging(false);
        const formedWord = selectedLetters.map((letter) => letter.letter).join("");
        console.log("Word formed: ", formedWord);
        setFoundWords((prev) => [...prev, formedWord]);

        if(validWords.includes(formedWord)){
            const newWord = {
                word: formedWord,
                letters: selectedLetters,
                isAnswer: true,
            };
            console.log("new word", newWord);
            // setFoundWords((prev) => [...prev, newWord]);
        } else{
            console.log("Invalid Word: ", formedWord);
        }

        setSelectedLetters([]);
    };

    useEffect(() => {
      console.log("Updated foundWords: ", foundWords);
    }, [foundWords]);
    
    useEffect(() => {
      clearSVG();
    
      foundWords.forEach((fw) => {
        if (fw.letters && Array.isArray(fw.letters)) {
          drawLine(fw.letters, "blue");
        }
      });

      if (selectedLetters.length >= 2) {
        drawLine(selectedLetters, "lightblue"); 
      }
    }, [selectedLetters, foundWords, clearSVG, drawLine]);


    return (
      <div className="relative">
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        />
        <div
        style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' , gap: '25px'}}
        ref={gridRef}>
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <button
                id={`button-${rowIndex}-${colIndex}`}
                key={`${rowIndex}-${colIndex}`}
                // onClick={() => handleClick(rowIndex, colIndex)}
                style={{
                    // backgroundColor: blinkingButton=== `${rowIndex}-${colIndex}` ? 'blue' : 'pink',
                    backgroundColor: selectedLetters.some(
                      (l)=>l.rowIdx === rowIndex && l.colIdx===colIndex
                    ) ? 'lightblue' : '',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    borderRadius: '100%',
                    zIndex: 1,
                    fontSize: '25px'
                }}
                
                onMouseDown={() => handleDragStart(rowIndex, colIndex)}
                onMouseEnter={() => handleDrag(rowIndex, colIndex)}
                onMouseUp={handleDragEnd}
                aria-label={`${letter} at row ${rowIndex + 1}, column ${colIndex + 1}`}
            >
                {letter}
            </button>
            ))
          )}
        </div>
      </div>
    );

}

export default Grid;
