import { createContext, useContext, useState } from "react";

interface AppContext {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create a new context
const AppContext = createContext<AppContext>({
  isDarkMode: false,
  setIsDarkMode: () => {},
});

// Create a provider component
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Provide the context value to the children components
  return (
    <>
      <AppContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        {children}
      </AppContext.Provider>
    </>
  );
};

const useAppContext = () => {
  if (!useContext(AppContext)) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return useContext(AppContext);
};

export { AppProvider, useAppContext };
