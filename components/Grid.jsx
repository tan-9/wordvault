import {useState, useRef, useCallback, useEffect} from "react";

const Grid = ({grid, selectedLetters, setSelectedLetters, foundWords, setFoundWords}) => {
   const [isDragging, setIsDragging] = useState(false);

   //refs so handlers always see current values without stale closures
   const isDraggingRef = useRef(false);
   const lastTileIdRef = useRef(null);

   const svgRef = useRef(null);
   const gridRef = useRef(null);
   const tileRef = useRef({});

   const getBtnPos = useCallback((rowIdx, colIdx) => {
     if(!gridRef.current){
       return { x: 0, y: 0, width: 0, height: 0};
     }

     const button = tileRef.current[`${rowIdx}-${colIdx}`]

     if(!button) return { x: 0, y: 0, width: 0, height: 0};

     const rect = button.getBoundingClientRect();
     const gridRect = gridRef.current.getBoundingClientRect();

     const relativeX = rect.left - gridRect.left;
     const relativeY = rect.top - gridRect.top;

     return{
       // x: rect.left - gridRect.left, y: rect.top - gridRect.top, width: rect.width, height: rect.height
       x: relativeX, y: relativeY, width: rect.width, height: rect.height
     };
   }, []);

   const getPolylinePoints = (letters) => {
    if(!gridRef.current) return "";

    return letters.map((letter)=>{
      const { x, y, width, height } = getBtnPos(letter.rowIdx, letter.colIdx);
      return `${x + width / 2},${y + height / 2}`
    }).join(" ")
   }

   const isAdjacent = (prev, curr) => {
       const dx = Math.abs(prev.rowIdx - curr.rowIdx);
       const dy = Math.abs(prev.colIdx - curr.colIdx);


       return dx<=1 && dy<=1 && dx+dy>0;
   }

  const tileClick = () =>{
     const audio = new Audio ("/wordvault/assets/tiles_click.wav");
     audio.volume = 0.4;
     audio.play();
   }

   const handleDragStart = useCallback(
       (rowIdx, colIdx) => {
           isDraggingRef.current = true
           lastTileIdRef.current = `${rowIdx}-${colIdx}`
           setIsDragging(true)
           setSelectedLetters([
               {rowIdx, colIdx, letter: grid[rowIdx][colIdx]},
           ]);
       },
       [grid, setSelectedLetters]
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
                   tileClick();
                   return updatedLetters;
               });
           }
       },
       [isDragging, grid, setSelectedLetters]
   );


   const handleDragEnd = useCallback(() => {
    if(!isDraggingRef.current) return;

    isDraggingRef.current = false;
    lastTileIdRef.current = null;

       setIsDragging(false);

       setSelectedLetters((prev)=>{
        const formedWord = prev.map((l)=>l.letter).join("")
        setFoundWords((prevWords)=>[...prevWords, formedWord])
        return [];
       })
   }, [setFoundWords, setSelectedLetters]);

   const selectTileAtPoint = useCallback(
    (clientX, clientY) => {
      if(!isDraggingRef.current) return;

      const elt = document.elementFromPoint(clientX, clientY);
      const button = elt?.closest('[id^="button-"]')
      if(!button) return

      if(lastTileIdRef.current === button.id) return;

      const btnIdx = button.id.split('-');
      const rowIdx = Number(btnIdx[1]);
      const colIdx = Number(btnIdx[2]);

      if(Number.isNaN(rowIdx) || Number.isNaN(colIdx)) return;

      lastTileIdRef.current = button.id;
      handleDrag(rowIdx, colIdx);
    },
    [handleDrag]
   )

  const handlePointerDown = useCallback((e, rowIdx, colIdx)=>{
    gridRef.current?.setPointerCapture?.(e.pointerId);
    tileClick();
    handleDragStart(rowIdx, colIdx);
  }, [handleDragStart]);


  const handlePointerMove = useCallback((e)=>{
    selectTileAtPoint(e.clientX, e.clientY)
  }, [selectTileAtPoint])
   
   useEffect(() => {
    if(isDragging) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    }
   }, [isDragging])


   return (
     <div className="relative" style={{position: 'relative', touchAction: 'none', userSelect: 'none'}}>
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
         >
         {selectedLetters.length > 1 && (
          <polyline
          points={getPolylinePoints(selectedLetters)}
          stroke="lightblue"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          />
        )}
       </svg>
        
       <div
       style={{display: 'grid', gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)` , gap: 'clamp(6px, 1.5vw, 12px)', width: '100%', boxSizing: 'border-box'}}
       ref={gridRef}
       onPointerMove={handlePointerMove}
       onPointerUp={handleDragEnd}
       onPointerCancel={handleDragEnd}>
         {grid.map((row, rowIndex) =>
           row.map((letter, colIndex) => (
             <button
             ref={(elt)=>{
              tileRef.current[`${rowIndex}-${colIndex}`]=elt 
             }}
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
                   fontSize: 'clamp(20px, 5vw, 30px)',
                   transition: 'background-color 0.2s ease',
                   boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                   touchAction: 'none',
                   WebkitTapHighlightColor: 'transparent',
                   boxSizing: 'border-box',
               }}
              
               onPointerDown={(e) => {
                 handlePointerDown(e, rowIndex, colIndex)
               }}
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
