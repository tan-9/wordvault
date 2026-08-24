import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useJoinRoom } from "../hooks/useJoinRoom";

const GameRoom = () => {
  const {
    socket,
    setHasJoinedRoom,
    setRoomId,
    playerName,
    setPlayerName,
    playSound,
  } = useGame();
  const [roomId, setLocalRoomId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [inRoom, setInRoom] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [joinViaLink, setJoinViaLink] = useState(false);
  const [searchParams] = useSearchParams();
  const { mutateAsync: createRoomMutation } = useCreateRoom();
  const { mutateAsync: joinRoomMutation } = useJoinRoom();

  const currRoomId = createdRoomId || roomId;
  const roomLink = `${window.location.origin}/wordvault/#/room?roomId=${currRoomId}`;

  useEffect(() => {
    const urlRoomId = searchParams.get("roomId");
    if (urlRoomId) {
      setLocalRoomId(urlRoomId);
      setJoinViaLink(true);
      setIsCreatingRoom(false);
    }
  }, [searchParams]);

  const copyToclipboard = () => {
    navigator.clipboard
      .writeText(roomLink)
      .then(() => alert("room link copied"))
      .catch(() => alert("failed to copy"));
  };

  const createRoom = async () => {
    try {
      const data = await createRoomMutation(playerName);
      setCreatedRoomId(data.roomId);
      setRoomId(data.roomId);
      setInRoom(true);
      socket.emit("join_room", {
        roomId: data.roomId,
        player: playerName,
      });
    } catch (e) {
      console.error("Error creating room", e);
    }
  };

  const joinRoom = async () => {
    try {
      const data = await joinRoomMutation({ roomId, player: playerName });
      if (data.message) {
        setInRoom(true);
        setRoomId(roomId);
        socket.emit("join_room", { roomId, player: playerName });
      }
    } catch (e) {
      console.error("Error joining room:", e);
    }
  };

  const startGame = () => {
    socket.emit("start_game", { roomId: currRoomId });
  };

  useEffect(() => {
    socket.on("update_players", (data) => {
      setPlayers(data.players);
    });

    return () => {
      socket.off("update_players");
    };
  }, []);

  if (!inRoom) {
    return (
      <div className="font-poppins flex flex-col gap-4 p-6">
        <div className="text-center text-[21px] font-semibold">
          Start a New Game
        </div>
        <input
          type="text"
          placeholder="Enter a username"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="font-poppins text-lg w-full px-3 py-3 rounded-lg border border-[#ccc] outline-none sm:text-base"
        />
        {joinViaLink ? (
          <button
            onClick={() => {
              joinRoom();
              setHasJoinedRoom(true);
            }}
            disabled={!playerName}
            className="font-poppins py-[14px] w-full rounded-[10px] bg-[#c2fbd7] text-lg shadow-[0px_4px_6px_rgba(0,0,0,0.13)] border-none cursor-pointer transition-colors duration-200 disabled:opacity-50 sm:text-base sm:py-3"
          >
            Join game
          </button>
        ) : (
          <button
            onClick={() => {
              playSound();
              createRoom();
              setIsCreatingRoom(true);
              setHasJoinedRoom(true);
            }}
            disabled={!playerName}
            className="font-poppins py-[14px] w-full rounded-[10px] bg-[#c2fbd7] text-lg shadow-[0px_4px_6px_rgba(0,0,0,0.13)] border-none cursor-pointer transition-colors duration-200 disabled:opacity-50 sm:text-base sm:py-3"
          >
            Create Room and Join
          </button>
        )}
        {!isCreatingRoom && (
          <>
            <input
              type="text"
              placeholder="Have a code?"
              value={roomId}
              onChange={(e) => setLocalRoomId(e.target.value)}
              className="font-poppins text-lg w-full px-3 py-3 rounded-lg border border-[#ccc] outline-none sm:text-base"
            />
            <button
              onClick={() => {
                playSound();
                joinRoom();
                setHasJoinedRoom(true);
              }}
              disabled={!playerName || !roomId}
              className="font-poppins py-[14px] w-full rounded-[10px] bg-[#c2fbd7] text-lg shadow-[0px_4px_6px_rgba(0,0,0,0.13)] border-none cursor-pointer transition-colors duration-200 disabled:opacity-50 sm:text-base sm:py-3"
            >
              Join Room
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="font-poppins flex flex-col gap-4 p-6">
      <div className="text-lg break-all flex items-center gap-2 sm:text-base">
        Room ID: <b>{currRoomId}</b>
        <button
          onClick={copyToclipboard}
          className="w-7 h-7 ml-1.5 bg-transparent border-none cursor-pointer p-0"
          aria-label="Copy room link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            width="18"
            height="18"
          >
            <path d="M12 6a2 2 0 1 0-1.994-1.842L5.323 6.5a2 2 0 1 0 0 3l4.683 2.342a2 2 0 1 0 .67-1.342L5.995 8.158a2.03 2.03 0 0 0 0-.316L10.677 5.5c.353.311.816.5 1.323.5Z" />
          </svg>
        </button>
      </div>
      <div className="text-lg">
        <h3 className="my-2">Waiting for players...</h3>
        <ul className="text-[17px] w-full p-0 list-none text-center">
          {players.map((p, idx) => (
            <li key={idx}>
              <i>{p}</i>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => {
            playSound();
            startGame();
          }}
          className="font-poppins py-[14px] w-full max-w-[200px] rounded-full bg-[#c2fbd7] text-lg font-semibold shadow-[0px_4px_6px_rgba(0,0,0,0.13)] border-none cursor-pointer transition-colors duration-200 sm:text-base sm:py-3"
        >
          START
        </button>
      </div>
    </div>
  );
};

export default GameRoom;
