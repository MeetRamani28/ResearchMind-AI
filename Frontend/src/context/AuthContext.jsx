import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const socketRef = useRef(null);

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (data?.user) setUser(data.user);
  }, [data]);

  useEffect(() => {
    if (user?._id) {
      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:3000",
        {
          transports: ["websocket"],
          withCredentials: true,
        },
      );

      newSocket.on("connect", () => {
        newSocket.emit("join", user._id);
        console.log("Socket Connected & Room Joined");
      });

      socketRef.current = newSocket;
      setSocketInstance(newSocket);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user?._id]);

  return (
    <AuthContext.Provider value={{ user, setUser, socket: socketInstance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
