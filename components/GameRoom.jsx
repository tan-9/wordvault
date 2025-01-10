import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const GameRoom = ({socket, isTimerActive, setisTimerActive, hasJoinedRoom, setHasJoinedRoom, setRoomId}) => {
    const [roomId, setLocalRoomId] = useState("");
    const [createdRoomId, setCreatedRoomId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [players, setPlayers] = useState([]); 
    const [inRoom, setInRoom] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false); 
    const [joinViaLink, setJoinViaLink] = useState(false);
    const [searchParams] = useSearchParams();

    const currRoomId = roomId || createdRoomId;
    const roomLink = `${window.location.origin}/room?roomId=${currRoomId}`;

    useEffect(()=>{
        const urlRoomId = searchParams.get('roomId');
        if(urlRoomId){
            setLocalRoomId(urlRoomId);
            setJoinViaLink(true);
            setIsCreatingRoom(false);
        }
    }, [searchParams]);

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

                        {joinViaLink ? (
                            <button 
                                onClick={()=>{
                                    joinRoom();
                                    setHasJoinedRoom(true);
                                }}
                                disabled={!playerName}
                            > Join game

                            </button>
                        ) : (
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
                        )}

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
                    <div className="flex flex-row justify-center">
                        <div style={{fontSize: '20px', marginTop: '6px'}}>Room ID: <b>{createdRoomId || roomId}</b></div>
                        <button
                        onClick={copyToclipboard} style={{width: '20px', marginLeft: '9px'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
  <path d="M12 6a2 2 0 1 0-1.994-1.842L5.323 6.5a2 2 0 1 0 0 3l4.683 2.342a2 2 0 1 0 .67-1.342L5.995 8.158a2.03 2.03 0 0 0 0-.316L10.677 5.5c.353.311.816.5 1.323.5Z" />
</svg>

                        </button>
                    </div>
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
