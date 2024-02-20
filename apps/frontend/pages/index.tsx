import { StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@repo/ui/components/ui/button";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "../components/atoms/button-link";
import AddTokensDialog from "../components/dialog/add-tokens";
import Layout from "../components/layout";
import { useSolSaverContext } from "../context/sol-saver-program";
import { useUserContext } from "../context/user";
import { useLogin } from "../hooks/useLogin";
import backendClient from "../lib/backend-client";
import { Pool } from "../types";

interface Props {
  pools: Pool[];
}

export default function Page({ pools }: Props) {
  const { data: session } = useSession();
  const { handleSignIn } = useLogin();
  const { program } = useSolSaverContext();
  const { user } = useUserContext();

  const [isOpen, setIsOpen] = useState(false);

  const handleInitEntry = async ({ poolAddress }: { poolAddress: string }) => {
    const poolPK = new PublicKey(poolAddress);

    const userEntry = await fetch(`/api/user-entry`).then((res) => res.json());
    try {
      const txHash = await program?.methods
        .initStakeEntry()
        .accounts({
          poolState: poolPK,
          userStakeEntry: userEntry,
          user: session?.user.pubkey,
        })
        .rpc();
      await axios.post(
        "/api/init-stake-entry",
        {
          txHash,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleStake = async ({ poolId }: { poolId: number }) => {
    if (!session) {
      return;
    }
    const userStakeEntries = user?.stakeEntries.map((entry) => entry.pool.id);
    if (userStakeEntries?.includes(poolId)) {
      // handle stake
      setIsOpen(true);
    } else {
      // handle init entry
      await handleInitEntry({
        poolAddress: pools[poolId]?.poolAddress as string,
      });
    }
  };

  return (
    <Layout>
      <h2 className="font-medium text-foreground text-center text-2xl mt-2 mb-1">
        Stake to win Prizes
      </h2>
      <p className="font-medium text-foreground text-center text-md">
        Stake your tokens to win prizes
      </p>

      <div className="flex flex-col mt-10">
        {pools.map((pool) => (
          <>
            <div key={pool.id} className="">
              {/* Title */}
              <div className="flex flex-row mb-4">
                <div className="flex flex-row gap-2 items-center">
                  <img
                    src={pool.tokenLogoUri}
                    alt={pool.tokenName}
                    className="rounded-full"
                  />
                  <h3 className="text-2xl text-foreground font-medium uppercase">
                    {pool.tokenSymbol}
                  </h3>
                </div>
                <Link
                  className="ml-auto underline  text-primary px-4 text-xl font-medium rounded-md flex items-center"
                  href={`/pool/${pool.id}`}
                >
                  View Pool
                </Link>
              </div>
              {/* Body */}
              <div className="grid grid-cols-2 px-3 mb-4 gap-4">
                {/* Supply */}
                <div className="flex flex-col self-center">
                  <p className="text-xl font-semibold text-muted-foreground">
                    Total Supply
                  </p>
                  <p className="text-xl text-foreground font-semibold">
                    {/* ${pool.supply} */}
                    $159.96M
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-xl font-semibold text-muted-foreground">
                    Supply APY
                  </p>
                  <div className="text-xl text-primary font-semibold flex items-center gap-1">
                    {/* ${pool.supply} */}
                    <StarIcon className="w-6 h-6 inline-block text-yellow-500" />
                    6.35%
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="grid grid-cols-2 gap-4">
                {!session ? (
                  <Button onClick={handleSignIn}>Login</Button>
                ) : (
                  <Button onClick={() => handleStake({ poolId: pool.id })}>
                    Deposit {pool.tokenSymbol}
                  </Button>
                )}
                <ButtonLink
                  variant={"secondary"}
                  href={`/pool/${pool.id}/prizes`}
                >
                  View Prizes
                </ButtonLink>
              </div>
            </div>
            <AddTokensDialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              pool={pool}
            />
          </>
        ))}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { data: pools } = await backendClient.get("/pool");

  return {
    props: { pools },
    revalidate: 60,
  };
};
