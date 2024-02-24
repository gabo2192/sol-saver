import { StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "../components/atoms/button-link";
import RemoveTokensDialog from "../components/dialog/remove-tokens";
import Layout from "../components/layout";
import { useSolSaverContext } from "../context/sol-saver-program";
import { useUserContext } from "../context/user";
import { useLogin } from "../hooks/useLogin";
import backendClient from "../lib/backend-client";
import { Pool } from "../types";

const AddTokensDialog = dynamic(
  () => import("../components/dialog/add-tokens")
);

interface Props {
  pools: Pool[];
  solanaPrice: number;
}

export default function Page({ pools, solanaPrice }: Props) {
  console.log({ solanaPrice });
  const { data: session } = useSession();
  const { handleSignIn } = useLogin();
  const { program } = useSolSaverContext();
  const { user } = useUserContext();
  const [error, setError] = useState<{
    poolId: number;
    message: string;
  } | null>(null);

  const [isOpen, setIsOpen] = useState<{
    poolId: number;
    type: "withdraw" | "stake";
  } | null>(null);

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
    } catch (error: any) {
      const pool = pools.find((i) => i.poolAddress === poolAddress);
      setError({
        poolId: pool?.id as number,
        message: error?.message as string,
      });
    }
  };

  const handleStake = async ({ poolId }: { poolId: number }) => {
    if (!session) {
      return;
    }
    const userStakeEntries = user?.stakeEntries.map((entry) => entry.pool.id);
    const pool = pools.find((i) => i.id === poolId);
    if (!pool) return;
    if (userStakeEntries?.includes(poolId)) {
      // handle stake
      setIsOpen({ poolId, type: "stake" });
    } else {
      // handle init entry
      await handleInitEntry({
        poolAddress: pool.poolAddress as string,
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
        {pools.map((pool) => {
          const userStake = user?.stakeEntries.find(
            (stake) => stake.pool.id === pool.id
          );
          const usd = (userStake?.balance! / LAMPORTS_PER_SOL) * solanaPrice;
          const formattedCurrency = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(usd);

          return (
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
                      {pool.supply / LAMPORTS_PER_SOL} {pool.tokenSymbol}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xl font-semibold text-muted-foreground">
                      Pool APY
                    </p>
                    <div className="text-xl text-primary font-semibold flex items-center gap-1">
                      <StarIcon className="w-6 h-6 inline-block text-yellow-500" />
                      {(pool.supplyApy * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                {/* User Position */}
                {userStake && userStake.balance > 0 && (
                  <>
                    <Card className="mb-10 border-2 max-w-sm mx-auto">
                      <CardHeader>
                        <CardTitle className="text-center">
                          My {pool.tokenSymbol} Deposited
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold text-center">
                          Deposited: {userStake.balance / LAMPORTS_PER_SOL}{" "}
                          {pool.tokenSymbol}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-col">
                        <p>Aprox: {formattedCurrency}</p>
                        <p>
                          Chances:{" "}
                          {((userStake.balance / pool.supply) * 100).toFixed(2)}
                          %
                        </p>
                        <Button
                          onClick={() =>
                            setIsOpen({ poolId: pool.id, type: "withdraw" })
                          }
                          variant="destructive"
                          className="mt-4"
                        >
                          Withdraw
                        </Button>
                      </CardFooter>
                    </Card>
                    <RemoveTokensDialog
                      isOpen={
                        isOpen?.poolId === pool.id &&
                        isOpen?.type === "withdraw"
                      }
                      onClose={() => setIsOpen(null)}
                      pool={pool}
                    />
                  </>
                )}
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
                {error?.poolId === pool.id && (
                  <div>
                    <p className="text-red-500">{error.message}</p>
                  </div>
                )}
              </div>
              <AddTokensDialog
                isOpen={isOpen?.poolId === pool.id && isOpen?.type === "stake"}
                onClose={() => setIsOpen(null)}
                pool={pool}
              />
            </>
          );
        })}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { data: pools } = await backendClient.get("/pool");
  //get solana price from coingecko
  // const { data: solanaPrice } = await axios.get(
  //   "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  // );

  return {
    props: { pools, solanaPrice: 108 },
    revalidate: 60,
  };
};
