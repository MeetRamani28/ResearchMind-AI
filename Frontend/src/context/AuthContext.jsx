// eslint-disable-next-line no-unused-vars
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // eslint-disable-next-line no-unused-vars
  const { data, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/auth/me");
        return data;
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setUser(null);
        return null;
      }
    },
    refetchInterval: 10000,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (data?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, [data]);

  const logout = async (navigate) => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      queryClient.clear();
      setUser(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      navigate("/login");
    }
  };

  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    if (user?._id) {
      const newSocket = io(socketUrl, {
        transports: ["websocket"],
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("Socket Connected:", newSocket.id);
        newSocket.emit("join", user._id);
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user?._id]);

  return (
    <AuthContext.Provider value={{ user, setUser, socket, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
