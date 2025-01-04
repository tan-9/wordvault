import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
const DisplayFormedWords = ({foundWords}) => {
    return (
        <div className="flex justify-center items-center">
            <div className="font-bold">{foundWords.map((w, idx) => (
                <div key={idx}>
                    {w}
                </div>
            ))}</div>
        </div>
    )
}

export default DisplayFormedWords;