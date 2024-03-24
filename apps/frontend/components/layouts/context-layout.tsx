"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SessionProvider } from "next-auth/react";
import { useMemo } from "react";
import { AppProvider } from "../../context/app";
import { SolSaverProvider } from "../../context/sol-saver-program";
import { UserProvider } from "../../context/user";

require("@solana/wallet-adapter-react-ui/styles.css");

interface Props {
  children: React.ReactNode;
}

export default function App({ children }: Props) {
  const network = process.env.NEXT_PUBLIC_APP_NETWORK as WalletAdapterNetwork;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider
      endpoint={process.env.NEXT_PUBLIC_APP_NETWORK as string}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SessionProvider>
            <SolSaverProvider>
              <AppProvider>
                <UserProvider>{children}</UserProvider>
              </AppProvider>
            </SolSaverProvider>
          </SessionProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
