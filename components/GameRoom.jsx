import React, {useState} from "react";

const GameRoom = () => {

    const [roomCode, setRoomCode] = useState("abcd");

    return(
        <div className="bg-white p-5 rounded-md shadow-2xl shadow-gray-200">
            <div>
                <button
                    style={{
                        display: 'inline-block',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingTop: '15px',
                        paddingBottom: '15px',
                        alignItems: 'center',
                        width: 'full',
                        justifyContent: 'center',
                        marginTop: '6px',
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                        borderRadius: '10px',
                        backgroundColor: '#c2fbd7',
                        transition: "all 0.3 ease"
                    }}>
                    Create New Room
                </button>

                <div>
                    Share this code: {roomCode} 
                </div>

                
            </div>
        </div>
    )

}

export default GameRoom;