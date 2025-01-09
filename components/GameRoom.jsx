import axios from "axios";
import React, { useEffect, useState } from "react";
import Timer from "./Timer.jsx"


const GameRoom = ({socket, isTimerActive, setisTimerActive, hasJoinedRoom, setHasJoinedRoom, setRoomId}) => {
    const [roomId, setLocalRoomId] = useState("");
    const [createdRoomId, setCreatedRoomId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState([]); 
    const [inRoom, setInRoom] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false); 
    const [hasGameStarted, setHasGameStarted] = useState(false);

    const createRoom = async () => {
        try {
            const response = await axios.post("http://localhost:5000/create-room", {player: playerName});
            setCreatedRoomId(response.data.roomId);
            setRoomId(response.data.roomId);
            setInRoom(true);
            socket.emit("join_room", { roomId: response.data.roomId, player: playerName });
            fetchPlayers(response.data.roomId);
        } catch (e) {
            console.error("Error creating room", e);
        }
    };

    const joinRoom = async () => {
        try {
            const response = await axios.post("http://localhost:5000/join-game-room", {
                roomId: roomId,
                player: playerName,
            });
            
            if(response.data.message){
                setInRoom(true);
                setRoomId(roomId);
                socket.emit("join_room", { roomId: roomId, player: playerName });
                // console.log("Joined room:", response.data);
                fetchPlayers(roomId);
            }
        } catch (e) {
            console.error("Error joining room:", e);
        }
    };

    const fetchPlayers = async (roomId) => {
        try{
            const response = await axios.get(`http://localhost:5000/room/${roomId}`);
            setPlayers(response.data.players);
        }

        catch (e){
            console.error("Error fetching players:", e);
        }
    };

    const startGame = () => {
        socket.emit("start_game", {roomId: createdRoomId || roomId});
        // setisTimerActive(true);
        // setHasGameStarted(true);
    };

    useEffect(() => {
        socket.on("update_players", (data) => {
            setPlayers(data.players);
        });

        return () => {
            socket.off("update_players");
        };
    }, []);


    return (
        <div className="bg-white p-6 flex flex-col items-center gap-2 rounded-xl shadow-2xl shadow-gray-200">
            <div className="text-center">Start a New Game</div> 
    
            {!inRoom ? (
                <div className="flex flex-col gap-2">
                     <input 
                        type="text"
                        placeholder="Enter a username"
                        value={playerName}
                        onChange={(e)=>setPlayerName(e.target.value)}/>
                    <button
                        onClick={() => {
                            createRoom();
                            setIsCreatingRoom(true); 
                            setHasJoinedRoom(true);
                        }}
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
                            transition: "all 0.3 ease",
                        }}>
                        Create Room and Join
                    </button>

                    {!isCreatingRoom && (
                        <div className="pt-2">
                            <input
                                type="text"
                                placeholder="Have a code?"
                                value={roomId}
                                onChange={(e) => setLocalRoomId(e.target.value)} />
                            
                            <button
                                onClick={()=>{
                                    joinRoom();
                                    setHasJoinedRoom(true);
                                }}
                                disabled = {!playerName || !roomId}
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
                                    transition: "all 0.3 ease",
                                }}>
                                Join Room
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h2>Room ID: {createdRoomId || roomId}</h2>
                    <p>Players:</p>
                    <ul>
                        {players.map((p, idx) => (
                            <li key={idx}>{p}</li> 
                        ))}
                    </ul>

                    <div className="flex flex-col items-center">
                        <button
                            onClick={()=>{
                                startGame();
                                // setHasGameStarted(true);
                                // setisTimerActive(true);
                            }}
                            style={{
                                display: 'inline-block',
                                paddingLeft: '25px',
                                paddingRight: '25px',
                                paddingTop: '15px',
                                paddingBottom: '15px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '6px',
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                                borderRadius: '100px',
                                transition: "all 0.3 ease",
                                backgroundColor: "#c2fbd7"
                            }}>
                            Start Game
                        </button>
                    </div>
                </div>
                 
                 
            )}
        </div>
    );
};

export default GameRoom;
