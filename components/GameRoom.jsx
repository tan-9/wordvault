import axios from "axios";
import React, {useEffect, useState} from "react";
import {io} from "socket.io-client";

const socket = io("http://localhost:5000")

const GameRoom = () => {
    const [roomId, setroomId] = useState("");
    const [createdRoomId, setCreatedRoomId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [player, setPlayer] = useState([]);
    const [inRoom, setInRoom] = useState(false);

    const createRoom = async () => {
        try{
            const response = await axios.post("http://localhost:5000/create-room");
            setCreatedRoomId(response.data.roomId);
            setInRoom(true);
            socket.emit("join_room", {roomId: response.data.roomId, player: playerName});
            console.log("Room created", response.data);
            
        }

        catch(e){
            console.error("Error creating room", e);
        }
    };

    const joinRoom = async () => {
        try{
            const response = await axios.post("http://localhost:5000/join-game-room", {
                roomId: roomId,
                player: playerName
            });
            setInRoom(true);
            socket.emit("join_room", {roomId: roomId, player: playerName});
            console.log("joined room:", response.data);
        }
        catch(e){
            console.error("error joining room:", e);
        }
    };

    useEffect(() => {
        socket.on("player_joined", (data)=>{
            setPlayer((prev)=>[...prev, data.playerName]);
        });

        socket.on("player_left", (data)=>{
            setPlayer((prev)=>prev.filter((player)=>player !== data.playerName));
        });

        return () => {
            socket.off("player_joined");
            socket.off("player_left");
        }
    }, []);

    return(
        <div className="bg-white p-5 rounded-md shadow-2xl shadow-gray-200">
            {!inRoom ? (
                <div>
                    <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}/>
                    <button
                        onClick={createRoom}
                        disabled={!playerName}
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
                </div>
            ) : (
                <div>

                    <h2>Room ID: {createdRoomId || roomId}</h2>
                    <div><input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomId}
                    onChange={(e) => setroomId(e.target.value)}/>
                    <button
                        onClick={joinRoom}
                        disabled={!roomId || !playerName}
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
                        Join Room
                    </button>
                        <p>Players: </p>
                        <ul>
                            {player.map((p, idx)=>(
                                <li key={idx}>{player}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )
        }
        </div>
    )

}

export default GameRoom;