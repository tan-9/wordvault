import { useQuery } from "@tanstack/react-query";
import { getGameResults } from "../../api/services/wordvaultService";

export const useGameResult = (roomId) => {
  return useQuery({
    queryKey: ["game-results", roomId],
    queryFn: () => getGameResults(roomId),
    enabled: !!roomId,
  });
};
