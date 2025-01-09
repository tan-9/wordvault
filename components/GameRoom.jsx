import axios from "axios";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Timer from "./Timer.jsx"

const socket = io("http://localhost:5000");

const GameRoom = ({isTimerActive, setisTimerActive, hasJoinedRoom, setHasJoinedRoom}) => {
    const [roomId, setRoomId] = useState("");
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
            setInRoom(true);
            socket.emit("join_room", { roomId: response.data.roomId, player: playerName });
            console.log("Room created", response.data);
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
                socket.emit("join_room", { roomId: roomId, player: playerName });
                console.log("Joined room:", response.data);
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
        socket.emit("start_game", {roomId});
        setHasGameStarted(true);
    }

    useEffect(() => {
        socket.on("update_players", (data) => {
            setPlayers(data.players);
        });

        socket.on("game_started", ()=>{
            setHasGameStarted(true);
        })

        return () => {
            socket.off("update_players");
            socket.off("game_started");
        };
    }, []);

    return (
        <div className="bg-white p-6 flex flex-col gap-2 rounded-xl shadow-2xl shadow-gray-200">
            <div className="text-center">Call some friends!</div>     
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
                        Create New Room
                    </button>

                    {!isCreatingRoom && (
                        <div className="pt-2">
                            <input
                                type="text"
                                placeholder="Have a code?"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)} />
                            
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

                    <div>
                        <Timer isTimerActive={isTimerActive} setisTimerActive={setisTimerActive} />
                    </div>
                </div>
                 
                 
            )}
        </div>
    );
};

export default GameRoom;
