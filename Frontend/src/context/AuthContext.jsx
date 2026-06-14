import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data?.user) setUser(data.user);
  }, [data]);

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

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user?._id]);

  return (
    <AuthContext.Provider value={{ user, setUser, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
