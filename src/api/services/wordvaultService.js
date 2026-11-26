import { apiPost, apiGet } from "../client";

export const validateWord = async (word, player, roomId) => {
  return apiPost("/check_word", { word, player, roomId });
};

export const getGameResults = async (roomId) => {
  return apiGet(`/game-results/${roomId}`);
};

export const createRoom = async (player) => {
  return apiPost("/create-room", { player });
};

export const joinRoom = async (roomId, player) => {
  return apiPost("/join-game-room", { roomId, player });
};
