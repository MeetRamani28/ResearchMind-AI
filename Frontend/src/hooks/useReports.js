import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useReports = () => {
  const queryClient = useQueryClient();

  const { data: chats, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await api.get("/chat/history");
      return res.data;
    },
  });

  const createChat = useMutation({
    mutationFn: () => api.post("/chat/"),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
      toast.success("New workspace session created!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create session");
    }
  });

  const runResearch = useMutation({
    mutationFn: (data) => api.post("/research/run", data),
    onSuccess: () => queryClient.invalidateQueries(["chats"]),
  });

  const updateChat = useMutation({
    mutationFn: ({ id, title }) => api.patch(`/chat/${id}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
      toast.success("Workspace title updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update title");
    }
  });

  const deleteChat = useMutation({
    mutationFn: (id) => api.delete(`/chat/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
      toast.success("Workspace deleted!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete workspace");
    }
  });

  return {
    chats,
    isHistoryLoading,
    createChat,
    runResearch,
    updateChat,
    deleteChat,
  };
};
