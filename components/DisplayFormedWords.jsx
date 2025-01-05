import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";

const DisplayFormedWords = ({foundWords}) => {
    const [validWords, setValidWords] = useState([]);
    
    const validateWords = async (words) => {
        if (!Array.isArray(foundWords)) return;
        const result = await Promise.all(
            words.map(async (word)=>{
                const response = await fetch('http://localhost:5000/check_word', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({word}),
                });

                const data = await response.json();
                console.log(data.is_Valid);
                return {word, valid: data.is_Valid}
            })
        );

        const validWord = result.filter(({valid})=>valid).map(({word}) => word);
        setValidWords(validWord);
    };

    useEffect(()=>{
        if(foundWords.length>0) validateWords(foundWords);
        
    }, [foundWords]);

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="text-lg font-bold pb-6">Found Words:</div>
            <div className="font-bold">{validWords.map((word, idx) => (
                <div key={idx} className="font-bold">
                      {word}
                </div>
            ))}</div>
        </div>
    )
}

export default DisplayFormedWords;