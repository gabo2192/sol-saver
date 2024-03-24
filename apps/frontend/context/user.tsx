import { createContext, useContext, useEffect, useState } from "react";

import axios from "axios";
import { useSession } from "next-auth/react";
import { User } from "../types";

interface UserContext {
  user: User | null;
}

// Create a new context
const UserContext = createContext<UserContext>({
  user: null,
});

// Create a provider component
const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: user } = await axios.get<User>("/api/user/me");

        setUser(user);
      } catch (err) {
        setUser(null);
      }
    };
    if (session?.user) {
      getUser();
    }
  }, [session]);
  // Provide the context value to the children components
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

const useUserContext = () => {
  if (!useContext(UserContext)) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return useContext(UserContext);
};

export { UserProvider, useUserContext };
