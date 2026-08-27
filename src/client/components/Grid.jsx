import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../context/GameContext.jsx";

const Grid = () => {
  const { grid, selectedLetters, setSelectedLetters, addWord } = useGame();
  const [isDragging, setIsDragging] = useState(false);

  //refs so handlers always see current values without stale closures
  const isDraggingRef = useRef(false);
  const lastTileIdRef = useRef(null);

  const svgRef = useRef(null);
  const gridRef = useRef(null);
  const tileRef = useRef({});

  const getBtnPos = useCallback((rowIdx, colIdx) => {
    if (!gridRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const button = tileRef.current[`${rowIdx}-${colIdx}`];

    if (!button) return { x: 0, y: 0, width: 0, height: 0 };

    const rect = button.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();

    const relativeX = rect.left - gridRect.left;
    const relativeY = rect.top - gridRect.top;

    return {
      x: relativeX,
      y: relativeY,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const getPolylinePoints = (letters) => {
    if (!gridRef.current) return "";

    return letters
      .map((letter) => {
        const { x, y, width, height } = getBtnPos(letter.rowIdx, letter.colIdx);
        return `${x + width / 2},${y + height / 2}`;
      })
      .join(" ");
  };

  const isAdjacent = (prev, curr) => {
    const dx = Math.abs(prev.rowIdx - curr.rowIdx);
    const dy = Math.abs(prev.colIdx - curr.colIdx);

    return dx <= 1 && dy <= 1 && dx + dy > 0;
  };

  const tileClick = () => {
    const audio = new Audio("/wordvault/assets/tiles_click.wav");
    audio.volume = 0.4;
    audio.play();
  };

  const handleDragStart = useCallback(
    (rowIdx, colIdx) => {
      isDraggingRef.current = true;
      lastTileIdRef.current = `${rowIdx}-${colIdx}`;
      setIsDragging(true);
      setSelectedLetters([{ rowIdx, colIdx, letter: grid[rowIdx][colIdx] }]);
    },
    [grid, setSelectedLetters],
  );

  const handleDrag = useCallback(
    (rowIdx, colIdx) => {
      if (!isDraggingRef.current) return;
      setSelectedLetters((prev) => {
        if (!prev.length) return prev;
        const lastLetter = prev[prev.length - 1];
        const newLetter = {
          rowIdx,
          colIdx,
          letter: grid[rowIdx][colIdx],
        };

        if (
          prev
            .slice(0, -1)
            .some(
              (letter) => letter.rowIdx === rowIdx && letter.colIdx === colIdx,
            )
        ) {
          return prev;
        }

        if (!isAdjacent(lastLetter, newLetter)) {
          return prev;
        }

        tileClick();
        return [...prev, newLetter];
      });
    },
    [grid, setSelectedLetters],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    lastTileIdRef.current = null;

    setIsDragging(false);

    setSelectedLetters((prev) => {
      const formedWord = prev.map((l) => l.letter).join("");
      addWord(formedWord);
      return [];
    });
  }, [addWord, setSelectedLetters]);

  const selectTileAtPoint = useCallback(
    (clientX, clientY) => {
      if (!isDraggingRef.current) return;

      const elt = document.elementFromPoint(clientX, clientY);
      const button = elt?.closest('[id^="button-"]');
      if (!button) return;

      if (lastTileIdRef.current === button.id) return;

      const btnIdx = button.id.split("-");
      const rowIdx = Number(btnIdx[1]);
      const colIdx = Number(btnIdx[2]);

      if (Number.isNaN(rowIdx) || Number.isNaN(colIdx)) return;

      lastTileIdRef.current = button.id;
      handleDrag(rowIdx, colIdx);
    },
    [handleDrag],
  );

  const handlePointerDown = useCallback(
    (e, rowIdx, colIdx) => {
      gridRef.current?.setPointerCapture?.(e.pointerId);
      tileClick();
      handleDragStart(rowIdx, colIdx);
    },
    [handleDragStart],
  );

  const handlePointerMove = useCallback(
    (e) => {
      selectTileAtPoint(e.clientX, e.clientY);
    },
    [selectTileAtPoint],
  );

  useEffect(() => {
    if (isDragging) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isDragging]);

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #fff5f8, #ffe4ec)",
        borderRadius: "20px",
        padding: "clamp(10px, 3vw, 20px)",
        boxShadow: "0 8px 24px rgba(255, 105, 150, 0.18)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="relative"
        style={{
          position: "relative",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <svg
          ref={svgRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            width: "100%",
            height: "100%",
          }}
        >
          {selectedLetters.length > 1 && (
            <polyline
              points={getPolylinePoints(selectedLetters)}
              stroke="#ff6fa8"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          )}
          {selectedLetters.map((letter) => {
            const { x, y, width, height } = getBtnPos(
              letter.rowIdx,
              letter.colIdx,
            );
            return (
              <circle
                key={`${letter.rowIdx}-${letter.colIdx}`}
                cx={x + width / 2}
                cy={y + height / 2}
                r="5"
                fill="#ff4f92"
                opacity="0.9"
              />
            );
          })}
        </svg>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)`,
            gap: "clamp(6px, 1.5vw, 12px)",
            width: "100%",
            boxSizing: "border-box",
            touchAction: "none",
          }}
          ref={gridRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const isSelected = selectedLetters.some(
                (l) => l.rowIdx === rowIndex && l.colIdx === colIndex,
              );

              return (
                <button
                  ref={(elt) => {
                    tileRef.current[`${rowIndex}-${colIndex}`] = elt;
                  }}
                  id={`button-${rowIndex}-${colIndex}`}
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    background: isSelected
                      ? "linear-gradient(145deg, #ff9dc4, #ff6fa8)"
                      : "linear-gradient(145deg, #fff0f5, #ffd6e8)",
                    color: isSelected ? "#fff" : "#93436a",
                    aspectRatio: "1",
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    padding: "3px",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "22%",
                    zIndex: 1,
                    fontSize: "clamp(20px, 5vw, 30px)",
                    transform: isSelected ? "scale(1.06)" : "scale(1)",
                    transition:
                      "background 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
                    boxShadow: isSelected
                      ? "0 6px 14px rgba(255, 79, 146, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)"
                      : "0 4px 8px rgba(255, 111, 168, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.9)",
                    touchAction: "none",
                    WebkitTapHighlightColor: "transparent",
                    boxSizing: "border-box",
                  }}
                  onPointerDown={(e) => {
                    handlePointerDown(e, rowIndex, colIndex);
                  }}
                  aria-label={`${letter} at row ${rowIndex + 1}, column ${colIndex + 1}`}
                >
                  {letter}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default Grid;
