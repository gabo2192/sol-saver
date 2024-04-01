"use client";
import { useUserContext } from "@context/user";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Prize } from "@types";
import { Button } from "@ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";
import axios from "axios";
import { useState } from "react";

interface Props {
  prizes: Prize[];
}
export default function PrizeTable({ prizes: dbPrizes }: Props) {
  const [prizes, setPrizes] = useState<Prize[]>(dbPrizes);
  const solanaPrice = 180;
  const { user } = useUserContext();
  const handleClaim = async (id: number) => {
    try {
      await axios.post("/api/user/claim-prize", { id });
      setPrizes((prev) => {
        const prizeIndex = prev.findIndex((p) => p.id === id);
        if (prizeIndex === -1) return prev;
        prev[prizeIndex]!.isClaimed = true;
        return [...prev];
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Table>
      <TableCaption>A list of recent prizes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>USD</TableHead>
          <TableHead>User PK</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prizes?.map((prize: any) => {
          const usd = (prize.amount / LAMPORTS_PER_SOL) * solanaPrice;
          const formattedCurrency = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(usd!);
          return (
            <TableRow key={prize.id}>
              <TableCell>{prize.amount / LAMPORTS_PER_SOL} SOL</TableCell>
              <TableCell>~{formattedCurrency}</TableCell>
              <TableCell>{prize.user.publicKey}</TableCell>
              <TableCell>{prize.isClaimed ? "Claimed" : "Pending"}</TableCell>
              <TableCell className="uppercase">{prize.type}</TableCell>
              <TableCell>{prize.createdAt}</TableCell>
              <TableCell className="font-medium">
                {user?.publicKey === prize.user.publicKey && (
                  <Button
                    variant="default"
                    disabled={
                      user?.publicKey !== prize.user.publicKey ||
                      prize.isClaimed
                    }
                    onClick={() => handleClaim(prize.id)}
                  >
                    Claim
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
