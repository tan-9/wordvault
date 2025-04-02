import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
import boardData from '../data/board.json';

const Grid = ({grid, selectedLetters, setSelectedLetters, foundWords, setFoundWords}) => {
    const [isDragging, setIsDragging] = useState(false);

    const svgRef = useRef(null);
    const gridRef = useRef(null);

    const getBtnPos = useCallback((rowIdx, colIdx) => {
      if(!gridRef.current){
        console.error("gridRef.current is undefined/null");
        return { x: 0, y: 0, width: 0, height: 0};
      }

      const button = gridRef.current.querySelector(`#button-${rowIdx}-${colIdx}`);

      if(!button) return { x: 0, y: 0, width: 0, height: 0};

      const rect = button.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      const containerRect = gridRef.current.parentElement.getBoundingClientRect();

      console.log("Grid Rect:", gridRef.current.getBoundingClientRect());
      console.log("Button Rect:", button.getBoundingClientRect());

      const relativeX = rect.left - gridRect.left;
      const relativeY = rect.top - gridRect.top;

      return{
        // x: rect.left - gridRect.left, y: rect.top - gridRect.top, width: rect.width, height: rect.height
        x: relativeX, y: relativeY, width: rect.width, height: rect.height
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

        const gridRect = gridRef.current.getBoundingClientRect();
        svg.style.width = `${gridRect.width}px`;
        svg.style.height = `${gridRect.height}px`;

        svg.setAttribute('viewBox', `0 0 ${gridRect.width} ${gridRect.height}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
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

          console.log(`Drawing line from (${x1}, ${y1}) to (${x2}, ${y2})`);
  
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
          line.style.transition = 'all 0.2s ease-in-out';
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
                    // console.log(updatedLetters);
                    drawLine(updatedLetters, "lightblue");
                    tileClick();
                    return updatedLetters;
                });
            }
        },
        [isDragging, grid]
    );

    const handleDragEnd = () => {
        setIsDragging(false);
        const formedWord = selectedLetters.map((letter) => letter.letter).join("");
        setFoundWords((prev) => [...prev, formedWord]);
        setSelectedLetters([]);
        clearSVG();
    };

    const tileClick = () =>{
      const audio = new Audio ("/wordvault/assets/tiles_click.wav");
      audio.volume = 0.4;
      audio.play();
    }

    return (
      <div className="relative" style={{position: 'relative'}}>
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
        style={{display: 'grid', gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)` , gap: '15px'}}
        ref={gridRef}>
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <button
                id={`button-${rowIndex}-${colIndex}`}
                key={`${rowIndex}-${colIndex}`}
                style={{
                    backgroundColor: selectedLetters.some(
                      (l)=>l.rowIdx === rowIndex && l.colIdx===colIndex
                    ) ? 'lightblue' : '#f7ee8f',
                    aspectRatio: '1',
                    display: 'flex',
                    padding: '3px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    borderRadius: '10%',
                    zIndex: 1,
                    fontSize: '30px',
                    transition: 'background-color 0.2s ease',
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                }}
                
                onMouseDown={() => {
                  tileClick();
                  handleDragStart(rowIndex, colIndex);
                }}
                onMouseEnter={() => {
                  handleDrag(rowIndex, colIndex);
                }}
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