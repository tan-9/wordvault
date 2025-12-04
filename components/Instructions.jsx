import {useState} from 'react';

const Instructions = ({displayInstructions, setDisplayInstructions}) => {
    const handleToggle = () => {
        setDisplayInstructions(prev => !prev);
    };

    return(
        <div>
            <button onClick={handleToggle} className="mt-3 font-poppins">
                How to play
            </button>

            {displayInstructions && (
                <div className="bg-white mt-5 p-6 flex flex-col items-center gap-2 rounded-xl shadow-2xl">
                Instructions
                </div>
            )}
        </div>
    )
}

export default Instructions;