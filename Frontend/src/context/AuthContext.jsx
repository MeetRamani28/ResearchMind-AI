import { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import api, { setAuthToken } from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          const token = await getToken();
          setAuthToken(token);

          const res = await api.get("/auth/me");
          if (res.data?.user) {
            setUser(res.data.user);
          } else {
            setUser({
              _id: clerkUser.id,
              clerkId: clerkUser.id,
              fullName: clerkUser.fullName || clerkUser.firstName || "User",
              email: clerkUser.primaryEmailAddress?.emailAddress || "",
              avatar: clerkUser.imageUrl,
            });
          }
        } catch (err) {
          console.error("Backend auth sync error:", err);
          setUser({
            _id: clerkUser.id,
            clerkId: clerkUser.id,
            fullName: clerkUser.fullName || clerkUser.firstName || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            avatar: clerkUser.imageUrl,
          });
        }
      } else {
        setAuthToken(null);
        setUser(null);
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  const logout = async (navigate) => {
    try {
      await signOut();
      toast.success("Successfully logged out");
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      setUser(null);
      setAuthToken(null);
      if (navigate) navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        user,
        setUser,
        clerkUser,
        getToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
