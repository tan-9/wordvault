import { useMutation } from "@tanstack/react-query";
import { joinRoom } from "../../api/services/wordvaultService";

export const useJoinRoom = () => {
  return useMutation({
    mutationFn: ({ roomId, player }) => joinRoom(roomId, player),
  });
};
