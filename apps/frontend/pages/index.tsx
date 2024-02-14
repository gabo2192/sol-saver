import Layout from "@/components/layout";
import { useSolSaverContext } from "@/context/sol-saver-program";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import axios from "axios";
import BN from "bn.js";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function Home() {
  const { program } = useSolSaverContext();
  const { data: session } = useSession();
  const { connection } = useConnection();
  const [stake, setStake] = useState(0);

  const handleClick = async () => {
    const pool = new PublicKey("Ho5mbVAx78uHJ93nKDjYS9suG9CfZRdHmFL5pdRrxGmC");
    const userKey = new PublicKey(session?.user?.pubkey as string);
    const [userEntry, entryBump] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from("stake_entry")],
      program?.programId as PublicKey
    );
    const txHash = await program?.methods
      .initStakeEntry()
      .accounts({
        poolState: pool,
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
  };

  const handleStake = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pool = new PublicKey("Ho5mbVAx78uHJ93nKDjYS9suG9CfZRdHmFL5pdRrxGmC");
    const vault = new PublicKey("AoYcRun4YnHnngvaNJp4FdxhbKgj2669HH3gu65sNwCc");
    const userKey = new PublicKey(session?.user?.pubkey as string);
    const [userEntry, entryBump] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from("stake_entry")],
      program?.programId as PublicKey
    );
    const userAcct = await program?.account.stakeEntry?.fetch(userEntry);
    console.log({ userAcct });

    const txHash = await program?.methods
      .stake(new BN(Number(stake) * LAMPORTS_PER_SOL))
      .accounts({
        pool: pool,
        systemProgram: SystemProgram.programId,
        user: userKey,
        externalSolDestination: vault,
        userStakeEntry: userEntry,
      })
      .rpc();
    console.log({ txHash });
    await axios.post(
      "/api/stake",
      {
        txHash,
        amount: stake,
      },
      { withCredentials: true }
    );

    // await confirmTX(txHash as string, connection);
  };

  const handleUnstake = async () => {
    await axios.post("/api/unstake", { withCredentials: true });
  };

  return (
    <Layout>
      <button onClick={handleClick} className="bg-white text-black p-4">
        Init stake entry
      </button>

      <form onSubmit={handleStake}>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="p-4 border border-gray-400 text-black"
        />
        <button type="submit" className="bg-white text-black p-4">
          Stake
        </button>
      </form>
      <button onClick={handleUnstake} className="bg-white text-black p-4">
        Unstake
      </button>
    </Layout>
  );
}
