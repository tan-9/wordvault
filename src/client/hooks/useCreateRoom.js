import { useMutation } from "@tanstack/react-query";
import { createRoom } from "../../api/services/wordvaultService";

export const useCreateRoom = () => {
  return useMutation({
    mutationFn: (player) => createRoom(player),
  });
};
