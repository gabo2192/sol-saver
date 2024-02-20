import "@repo/ui/globals.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useMemo } from "react";
import { AppProvider } from "../context/app";
import { SolSaverProvider } from "../context/sol-saver-program";
import { UserProvider } from "../context/user";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function App({ Component, pageProps }: AppProps) {
  const network = process.env.NEXT_PUBLIC_APP_NETWORK as WalletAdapterNetwork;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider
      endpoint={process.env.NEXT_PUBLIC_APP_NETWORK as string}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SessionProvider session={pageProps.session} refetchInterval={0}>
            <SolSaverProvider>
              <AppProvider>
                <UserProvider>
                  <Component {...pageProps} />
                </UserProvider>
              </AppProvider>
            </SolSaverProvider>
          </SessionProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
