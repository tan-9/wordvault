import axios from "axios";
import React, { useEffect, useState } from "react";

const GameRoom = ({socket, isTimerActive, setisTimerActive, hasJoinedRoom, setHasJoinedRoom, setRoomId}) => {
    const [roomId, setLocalRoomId] = useState("");
    const [createdRoomId, setCreatedRoomId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState([]); 
    const [inRoom, setInRoom] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false); 

    const currRoomId = roomId || createdRoomId;
    const roomLink = `${window.location.origin}/room?roomId=${currRoomId}`;

    const copyToclipboard = () => {
        navigator.clipboard.writeText(roomLink)
            .then(()=> alert("room link copied"))
             .catch(()=> alert("failed to copy"));
    };

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

    const playSound = () => {
        const audio = new Audio("../src/assets/button_click.wav");
        audio.volume = 0.5;
        audio.play();
    };


    return (
        <div style={{fontFamily: 'Poppins', marginTop: '2px'}}>
            <div className="text-center"
                style={{
                    paddingBottom: '10px',
                    fontSize: '21px',
                }}>
                    Start a New Game</div> 
    
            {!inRoom ? (
                <div className="flex flex-col gap-2">
                     <input 
                        type="text"
                        placeholder="Enter a username"
                        value={playerName}
                        onChange={(e)=>setPlayerName(e.target.value)}
                        style={{
                            fontSize: '18px'
                        }}/>
                    <button
                        onClick={() => {
                            createRoom();
                            setIsCreatingRoom(true); 
                            setHasJoinedRoom(true);
                        }}
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
                            transition: "all 0.3 ease",
                            marginBottom: '18px',
                            fontSize: '18px'
                        }}>
                        Create Room and Join
                    </button>

                    {!isCreatingRoom && (
                        <div className="pt-2">
                            <input
                                type="text"
                                placeholder="Have a code?"
                                value={roomId}
                                onChange={(e) => setLocalRoomId(e.target.value)} 
                                style={{
                                    fontSize: '18px'
                                }}/>
                            
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
                                    fontSize: '18px'
                                }}>
                                Join Room
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <button
                    onClick={copyToclipboard}>
                        <h2>Room ID: {createdRoomId || roomId}</h2>
                    </button>
                    <div className="p-2" style={{fontSize: '18px'}}>
                        <h3 className="py-1">Waiting for players...</h3>
                        <ul>
                            {players.map((p, idx) => (
                                <li key={idx}><i>{p}</i></li> 
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col items-center">
                        <button
                            onClick={()=>{
                                startGame();
                                playSound();
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
                            START
                        </button>
                    </div>
                </div>
                 
                 
            )}
        </div>
    );
};

export default GameRoom;
