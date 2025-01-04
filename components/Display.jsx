import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
const Display = ({displayLetters}) => {
    return (
        <div className="relative">
            <div className="text-pink-400">{displayLetters.map((letter) => letter.letter).join('')}</div>
        </div>
    )
}

export default Display;