import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
const Display = ({displayLetters}) => {
    return (
        <div className="flex justify-center items-center">
            <div className="font-bold">{displayLetters.map((letter) => letter.letter).join('')}</div>
        </div>
    )
}

export default Display;