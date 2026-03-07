import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";


const GameRoom = ({socket, setHasJoinedRoom, setRoomId, playerName, setPlayerName}) => {
    const [roomId, setLocalRoomId] = useState("");
    const [createdRoomId, setCreatedRoomId] = useState("");
    const [players, setPlayers] = useState([]);
    const [inRoom, setInRoom] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [joinViaLink, setJoinViaLink] = useState(false);
    const [searchParams] = useSearchParams();


    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


    const currRoomId = roomId || createdRoomId;
    const roomLink = `${window.location.origin}/wordvault/#/room?roomId=${currRoomId}`;


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
            const response = await axios.post(`${BACKEND_URL}/create-room`, {player: playerName});
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
            const response = await axios.post(`${BACKEND_URL}/join-game-room`, {
                roomId: roomId,
                player: playerName,
            });
            
            if(response.data.message){
                setInRoom(true);
                setRoomId(roomId);
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
            const response = await axios.get(`${BACKEND_URL}/room/${roomId}`);
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




// Responsive styles
const containerStyle = {
    fontFamily: 'Poppins',
    marginTop: '2px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2vw',
};
const cardStyle = {
    width: '100%',
    maxWidth: 400,
    // backgroundColor: 'pink',
    borderRadius: 9,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    padding: '2vw 4vw',
    gap: '2vw',
    margin: '2vw 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};
const inputStyle = {
    fontFamily: 'Poppins',
    fontSize: '18px',
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    borderRadius: 8,
    border: '0.5px solid #ccc',
    outline: 'none',
    boxSizing: 'border-box',
};
const buttonStyle = {
    fontFamily: 'Poppins',
    display: 'inline-block',
    padding: '14px 0',
    width: '100%',
    margin: '10px 0',
    borderRadius: 10,
    backgroundColor: '#c2fbd7',
    fontSize: '18px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.13)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
};
const roomIdStyle = {
    fontSize: '18px',
    marginTop: '6px',
    wordBreak: 'break-all',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
};
const playerListStyle = {
    fontSize: '17px',
    width: '100%',
    margin: '10px 0',
    padding: 0,
    listStyle: 'none',
    textAlign: 'center',
};
const startBtnStyle = {
    ...buttonStyle,
    borderRadius: 100,
    maxWidth: 200,
    backgroundColor: '#c2fbd7',
    fontWeight: 600,
};


// Responsive media query
const responsiveStyle = `
@media (max-width: 600px) {
    .game-room-card { padding: 7vw 3vw; max-width: 98vw; }
    .game-room-input { font-size: 16px; }
    .game-room-btn { font-size: 16px; padding: 12px 0; }
    .game-room-roomid { font-size: 16px; }
}
`;


return (
    <div>
        <style>{responsiveStyle}</style>
        <div className="game-room-card" style={cardStyle}>
            <div className="text-center" style={{ fontFamily: 'Poppins', fontSize: '21px', fontWeight: 600 }}>
                Start a New Game
            </div>
            {!inRoom ? (
                <div style={{ width: '100%' }}>
                    <input
                        className="game-room-input"
                        type="text"
                        placeholder="Enter a username"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        style={inputStyle}
                    />
                    {joinViaLink ? (
                        <button
                            className="game-room-btn"
                            onClick={() => {
                                joinRoom();
                                setHasJoinedRoom(true);
                            }}
                            disabled={!playerName}
                            style={buttonStyle}
                        >
                            Join game
                        </button>
                    ) : (
                        <button
                            className="game-room-btn"
                            onClick={() => {
                                playSound();
                                createRoom();
                                setIsCreatingRoom(true);
                                setHasJoinedRoom(true);
                            }}
                            disabled={!playerName}
                            style={buttonStyle}
                        >
                            Create Room and Join
                        </button>
                    )}
                    {!isCreatingRoom && (
                        <div style={{ marginTop: 10 }}>
                            <input
                                className="game-room-input"
                                type="text"
                                placeholder="Have a code?"
                                value={roomId}
                                onChange={(e) => setLocalRoomId(e.target.value)}
                                style={inputStyle}
                            />
                            <button
                                className="game-room-btn"
                                onClick={() => {
                                    playSound();
                                    joinRoom();
                                    setHasJoinedRoom(true);
                                }}
                                disabled={!playerName || !roomId}
                                style={buttonStyle}
                            >
                                Join Room
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ width: '100%' }}>
                    <div style={roomIdStyle} className="game-room-roomid">
                        Room ID: <b>{createdRoomId || roomId}</b>
                        <button
                            onClick={copyToclipboard}
                            style={{ width: 28, height: 28, marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            aria-label="Copy room link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="18" height="18">
                                <path d="M12 6a2 2 0 1 0-1.994-1.842L5.323 6.5a2 2 0 1 0 0 3l4.683 2.342a2 2 0 1 0 .67-1.342L5.995 8.158a2.03 2.03 0 0 0 0-.316L10.677 5.5c.353.311.816.5 1.323.5Z" />
                            </svg>
                        </button>
                    </div>
                    <div style={{ fontSize: '18px', margin: '10px 0' }}>
                        <h3 style={{ margin: '8px 0' }}>Waiting for players...</h3>
                        <ul style={playerListStyle}>
                            {players.map((p, idx) => (
                                <li key={idx}><i>{p}</i></li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <button
                            className="game-room-btn"
                            onClick={() => {
                                playSound();
                                startGame();
                            }}
                            style={startBtnStyle}
                        >
                            START
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};


export default GameRoom;