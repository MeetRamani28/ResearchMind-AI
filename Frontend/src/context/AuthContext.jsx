import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const socket = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const user = data?.user || null;

  // Socket Connection Logic
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
        console.log("Socket Connected:", newSocket.id);
        newSocket.emit("join", user._id);
      });

      socket.current = newSocket;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocketInstance(newSocket);

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isError,
        socket: socketInstance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
