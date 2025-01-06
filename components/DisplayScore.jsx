import React, { useState, useEffect } from "react";

const DisplayScore = ({totalScore}) => {
    return(
        <div className="bg-white rounded-2xl shadow-2xl p-4">
            You Scored {totalScore} points
        </div>
    )
}

export default DisplayScore;