import { createContext, useContext, useEffect, useState } from "react";
import IDL from "../idl/oracle_priority.json";
import { OraclePriority } from "../types/oracle_priority";

import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

interface SolSaverContext {
  program: anchor.Program<OraclePriority> | null;
}

// Create a new context
const SolSaverContext = createContext<SolSaverContext>({
  program: null,
});

// Create a provider component
const SolSaverProvider = ({ children }: { children: React.ReactNode }) => {
  const [program, setProgram] = useState<anchor.Program<OraclePriority> | null>(
    null
  );
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (connection && wallet) {
      const anchorConnection = new anchor.web3.Connection(
        process.env.NEXT_PUBLIC_APP_NETWORK as string,
        {
          commitment: "confirmed",
        }
      );
      const anchorProvider = new anchor.AnchorProvider(
        anchorConnection,
        wallet,
        { preflightCommitment: "confirmed" }
      );
      const _program = new anchor.Program<OraclePriority>(
        IDL as any,
        anchorProvider
      );
      setProgram(_program);
    }
  }, [wallet, connection]);

  // Provide the context value to the children components
  return (
    <SolSaverContext.Provider value={{ program }}>
      {children}
    </SolSaverContext.Provider>
  );
};

const useSolSaverContext = () => {
  if (!useContext(SolSaverContext)) {
    throw new Error(
      "useSolSaverContext must be used within a SolSaverProvider"
    );
  }
  return useContext(SolSaverContext);
};

export { SolSaverProvider, useSolSaverContext };
