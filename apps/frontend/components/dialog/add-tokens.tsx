import { Button } from "@repo/ui/components/ui/button";

import { useSolSaverContext } from "@context/sol-saver-program";
import { useUserContext } from "@context/user";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { Pool, User } from "@types";
import axios from "axios";
import BN from "bn.js";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
}

export default function AddTokensDialog({ isOpen, onClose, pool }: Props) {
  const { user } = useUserContext();
  const { program } = useSolSaverContext();
  const { connection } = useConnection();
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const getTokenMintBalance = async (user: User) => {
      const userKey = new PublicKey(user.publicKey as string);
      const tokenMint = new PublicKey(pool.tokenMint);
      const tokenAccount = await getAssociatedTokenAddress(tokenMint, userKey);
      const info = await getAccount(connection, tokenAccount);
      const amount = Number(info.amount);
      const mint = await getMint(connection, info.mint);
      const balance = amount / 10 ** mint.decimals;
      setBalance(balance);
    };

    if (user && !pool.tokenMint) {
      const userKey = new PublicKey(user.publicKey as string);

      connection
        .getBalance(userKey)
        .then((balance) => setBalance(balance / LAMPORTS_PER_SOL));
    }
    if (user && pool.tokenMint) {
      getTokenMintBalance(user);
    }
  }, [session, connection]);
  const stake = user?.stakeEntries.find((stake) => stake.pool.id === pool.id);
  const formattedCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(stake?.balance!);

  const handleStake = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const poolPubkey = new PublicKey(pool.poolAddress);
    const vault = new PublicKey(pool.tokenVault);
    const userKey = new PublicKey(session?.user?.pubkey as string);

    const userEntry = new PublicKey(stake?.publicKey as string);

    const txHash = await program?.methods
      .stake(new BN(Number(amount) * LAMPORTS_PER_SOL))
      .accounts({
        pool: poolPubkey,
        systemProgram: SystemProgram.programId,
        user: userKey,
        externalSolDestination: vault,
        userStakeEntry: userEntry,
      })
      .rpc();

    await axios.post(
      "/api/user/stake",
      {
        txHash,
        amount: amount,
      },
      { withCredentials: true }
    );
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={clsx("w-[90vw] sm:max-w-md")}>
        <form className="space-y-4" onSubmit={handleStake}>
          <DialogHeader>
            <DialogTitle>Add {pool.tokenSymbol}</DialogTitle>
          </DialogHeader>
          <div className=" border border-muted p-4 flex flex-col items-center space-x-2">
            <div className="flex flex-row justify-between w-full mb-4">
              <p className="text-muted-foreground">Your stake</p>
              <p className="text-muted-foreground">{formattedCurrency}</p>
            </div>
            <div className="grid grid-cols-2 justify-between w-full mb-4">
              <div className="text-foreground flex flex-row gap-1 items-center">
                <img
                  src={pool.tokenLogoUri}
                  alt={pool.tokenName}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-xl font-medium">{pool.tokenSymbol}</span>
              </div>
              <Input
                className="border-none self-end text-right text-xl"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-row justify-between w-full mb-4 items-center">
              <p className="text-muted-foreground">Available {balance}</p>
              <div className="flex flex-row gap-1">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setAmount(balance / 2)}
                >
                  Half
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAmount(balance)}
                >
                  Max
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="submit" variant="default" className="w-full">
                Deposit
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
