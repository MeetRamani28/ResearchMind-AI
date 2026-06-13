import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const useReports = () => {
  const queryClient = useQueryClient();

  const { data: chats, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await api.get("/chat/history");
      return res.data;
    },
    refetchOnMount: true,
  });

  const createChatMutation = useMutation({
    mutationFn: () => api.post("/chat/"),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
    },
  });

  const runResearchMutation = useMutation({
    mutationFn: ({ topic, chatId }) =>
      api.post("/research/run", { topic, chatId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]); 
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId) => api.delete(`/chat/${chatId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
    },
  });

  return {
    chats,
    isHistoryLoading,
    createChat: createChatMutation,
    runResearch: runResearchMutation,
    deleteChat: deleteChatMutation,
  };
};
