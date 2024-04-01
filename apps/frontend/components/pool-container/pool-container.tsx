"use client";
import { useSolSaverContext } from "@context/sol-saver-program";
import { useUserContext } from "@context/user";
import { StarIcon } from "@heroicons/react/24/outline";
import { useLogin } from "@hooks/useLogin";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Pool } from "@types";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "../atoms/button-link";
import AddTokensDialog from "../dialog/add-tokens";
import RemoveTokensDialog from "../dialog/remove-tokens";

interface Props {
  pool: Pool;
}
export default function PoolContainer({ pool }: Props) {
  const [isOpen, setIsOpen] = useState<"stake" | "withdraw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const { user } = useUserContext();
  const userStake = user?.stakeEntries?.find(
    (stake) => stake.pool.id === pool.id
  );
  const usd =
    pool.tokenSymbol === "SOL"
      ? (userStake?.balance! / LAMPORTS_PER_SOL) * 180
      : (userStake?.balance || 0) / Math.pow(10, pool.decimals);
  const { program } = useSolSaverContext();

  const formattedCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usd);

  const { handleSignIn } = useLogin();

  const handleInitEntry = async ({
    poolAddress,
    tokenMint,
  }: {
    poolAddress: string;
    tokenMint?: string;
  }) => {
    if (!user) return;
    const poolPK = new PublicKey(poolAddress);

    const { data: userEntry } = await axios.get(`/api/user/user-entry`, {
      params: tokenMint ? { tokenMint } : {},
    });

    try {
      let txHash: string | undefined;
      if (!tokenMint) {
        txHash = await program?.methods
          .initStakeEntry()
          .accounts({
            poolState: poolPK,
            userStakeEntry: userEntry,
            user: user.publicKey,
          })
          .rpc();
      } else {
        txHash = await program?.methods
          .initTokenStakeEntry()
          .accounts({
            user: user.publicKey,
            userStakeEntry: userEntry,
            poolState: poolPK,
          })
          .rpc();
      }
      await axios.post(
        "/api/user/init-stake-entry",
        {
          txHash,
          poolAddress,
        },
        { withCredentials: true }
      );
    } catch (error: any) {
      setError(error?.message as string);
    }
  };

  const handleStake = async ({ poolId }: { poolId: number }) => {
    if (!user) {
      return;
    }
    const userStakeEntries = user?.stakeEntries?.map((entry) => entry.pool.id);
    if (!pool) return;
    if (userStakeEntries?.includes(poolId)) {
      // handle stake
      setIsOpen("stake");
    } else {
      // handle init entry
      await handleInitEntry({
        poolAddress: pool.poolAddress as string,
        tokenMint: pool.tokenMint,
      });
    }
  };

  return (
    <>
      <div key={pool.id} className="border-b pb-8 mt-10">
        {/* Title */}
        <div className="flex flex-row mb-4">
          <div className="flex flex-row gap-2 items-center">
            <img
              src={pool.tokenLogoUri}
              alt={pool.tokenName}
              className="rounded-full size-10"
            />
            <h3 className="text-2xl text-foreground font-medium uppercase">
              {pool.tokenSymbol}
            </h3>
          </div>
          {pathname === "/" && (
            <Link
              className="ml-auto underline  text-primary px-4 text-xl font-medium rounded-md flex items-center"
              href={`/pool/${pool.id}`}
            >
              View Pool
            </Link>
          )}
        </div>
        {/* Body */}
        <div className="grid grid-cols-2 px-3 mb-4 gap-4">
          {/* Supply */}
          <div className="flex flex-col self-center">
            <p className="text-xl font-semibold text-muted-foreground">
              Total Supply
            </p>
            <p className="text-xl text-foreground font-semibold">
              {Math.ceil(pool.supply / Math.pow(10, pool.decimals))}{" "}
              {pool.tokenSymbol}
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
                  Deposited: {userStake.balance / Math.pow(10, pool.decimals)}{" "}
                  {pool.tokenSymbol}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p>Aprox: {formattedCurrency}</p>
                <p>
                  Chances:{" "}
                  {((userStake.balance / pool.supply) * 100).toFixed(2)}%
                </p>
                <Button
                  onClick={() => setIsOpen("withdraw")}
                  variant="destructive"
                  className="mt-4"
                >
                  Withdraw
                </Button>
              </CardFooter>
            </Card>
            <RemoveTokensDialog
              isOpen={isOpen === "withdraw"}
              onClose={() => setIsOpen(null)}
              pool={pool}
            />
          </>
        )}
        {/* Footer */}
        <div className="grid grid-cols-2 gap-4">
          {!user ? (
            <Button onClick={handleSignIn}>Login</Button>
          ) : (
            <Button onClick={() => handleStake({ poolId: pool.id })}>
              Deposit {pool.tokenSymbol}
            </Button>
          )}
          <ButtonLink variant={"secondary"} href={`/pool/${pool.id}/prizes`}>
            View Prizes
          </ButtonLink>
        </div>
        {error && (
          <div>
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
      <AddTokensDialog
        isOpen={isOpen === "stake"}
        onClose={() => setIsOpen(null)}
        pool={pool}
      />
    </>
  );
}
