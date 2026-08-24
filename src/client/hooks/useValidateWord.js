import { useQuery } from "@tanstack/react-query";
import { validateWord } from "../../api/services/wordvaultService";

export const useValidateWord = (word, player, roomId) => {
  return useQuery({
    queryKey: ["validateWord", word, player, roomId],
    queryFn: () => validateWord(word, player, roomId),
    enabled: !!word && !!player && !!roomId,
  });
};
