import { createContext, useContext, useEffect, useState } from "react";
import { IDL, SolSaver } from "../../backend/src/solana/types/sol_saver";

import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

interface SolSaverContext {
  program: anchor.Program<SolSaver> | null;
}

// Create a new context
const SolSaverContext = createContext<SolSaverContext>({
  program: null,
});

// Create a provider component
const SolSaverProvider = ({ children }: { children: React.ReactNode }) => {
  const [program, setProgram] = useState<anchor.Program<SolSaver> | null>(null);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (connection && wallet) {
      const anchorConnection = new anchor.web3.Connection(
        "http://localhost:8899",
        {
          commitment: "confirmed",
        }
      );
      const anchorProvider = new anchor.AnchorProvider(
        anchorConnection,
        wallet,
        { preflightCommitment: "confirmed" }
      );
      const _program = new anchor.Program<SolSaver>(
        JSON.parse(JSON.stringify(IDL)),
        process.env.NEXT_PUBLIC_PROGRAM_PUBKEY as string,
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
