import { Button } from "@repo/ui/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import clsx from "clsx";
import { useUserContext } from "../../context/user";
import { Pool } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
}

export default function RemoveTokensDialog({ isOpen, onClose, pool }: Props) {
  const { user } = useUserContext();

  const stake = user?.stakeEntries.find((stake) => stake.pool.id === pool.id);

  const handleUnstake = async () => {
    try {
      await axios.post("/api/unstake", { withCredentials: true });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={clsx("w-[90vw] sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <div className=" border border-muted p-4 flex flex-col items-center space-x-2">
          <p>
            You are about to withdraw {(stake?.balance || 0) / LAMPORTS_PER_SOL}{" "}
            {pool.tokenSymbol} from {pool.tokenName} pool. THIS ACTION IS NOT
            REVERSIBLE. We charge 20000 lamports for the network fee.
          </p>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              onClick={handleUnstake}
              type="button"
              variant="destructive"
              className="w-full"
            >
              Withdraw
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
