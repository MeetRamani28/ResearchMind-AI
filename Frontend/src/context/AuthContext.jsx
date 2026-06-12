import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false, 
    staleTime: 1000 * 60 * 5,
  });

 
  useEffect(() => {
    if (data?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(data.user);
    }
  }, [data]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
