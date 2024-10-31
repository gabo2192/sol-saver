"use client";

import { useSolSaverContext } from "@context/sol-saver-program";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import {
  InstructionWithEphemeralSigners,
  PythSolanaReceiver,
} from "@pythnetwork/pyth-solana-receiver";
import {
  AnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Button } from "@ui/components/ui/button";
import BN from "bn.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OraclePriority } from "../../../types/oracle_priority";

import {
  CrossbarClient,
  loadLookupTables,
  PullFeed,
} from "@switchboard-xyz/on-demand";

interface OracleInfo {
  vaultType: string;
  oraclePyth: number[];
  oracleSwitchboard: PublicKey;
  priorityPyth: number;
  prioritySwitchboard: number;
  vaultTypeName: string;
  recentPrice: BN;
  lastUpdate: BN;
}

export default function Test() {
  const { program } = useSolSaverContext();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [oracleInfo, setOracleInfo] = useState<OracleInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (program) {
      const fetchOracleInfo = async () => {
        const [oracleAddress] = PublicKey.findProgramAddressSync(
          [program.programId.toBuffer(), Buffer.from("Oracle")],
          program.programId
        );
        const oracleInfo = (await program?.account.oracleInfo.fetch(
          oracleAddress
        )) as any;
        setOracleInfo(oracleInfo);
      };
      fetchOracleInfo();
    }
  }, [program]);

  if (!program || !wallet) {
    return <div>Loading...</div>;
  }

  const handleInitialize = async () => {
    console.log(wallet.publicKey?.toBase58());
    try {
      const tx = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash();
      const ix = await program.methods
        .initialize("1-SOL-120-0-----")
        .accounts({
          vaultType: program.programId,
          payer: wallet.publicKey!,
        })
        .instruction();
      tx.add(ix);
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey!;
      const signedTx = await wallet.signTransaction!(tx);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log({ signature });
    } catch (e) {
      console.error(e);
    } finally {
      router.refresh();
    }
  };
  const handleUpdateOracle = async () => {
    console.log(wallet.publicKey?.toBase58());
    try {
      const [oracleAddress] = PublicKey.findProgramAddressSync(
        [program.programId.toBuffer(), Buffer.from("Oracle")],
        program.programId
      );
      const tx = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash();
      const ix = await program.methods
        .updateOracles(
          parseHex({
            feedId:
              "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
          }),
          new PublicKey("CSB4EsgkfooqFfBb8f1SDHh7np358iP7JEWjRYTPwH3C")
        )
        .accountsPartial({
          oracleInfo: oracleAddress,
        })
        .instruction();
      tx.add(ix);
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey!;
      const signedTx = await wallet.signTransaction!(tx);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log({ signature });
    } catch (e) {
      console.log(e);
    } finally {
      router.refresh();
    }
  };
  const handleUpdatePriority = async () => {
    console.log(wallet.publicKey?.toBase58());
    try {
      const [oracleAddress] = PublicKey.findProgramAddressSync(
        [program.programId.toBuffer(), Buffer.from("Oracle")],
        program.programId
      );
      const tx = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash();
      const ix = await program.methods
        .updatePriority(1, -1)
        .accountsPartial({
          oracleInfo: oracleAddress,
        })
        .instruction();
      tx.add(ix);
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey!;
      const signedTx = await wallet.signTransaction!(tx);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log({ signature });
    } catch (e) {
      console.log(e);
    } finally {
      router.refresh();
    }
  };
  const handleUpdatePrice = async () => {
    console.log(wallet.publicKey?.toBase58());
    if (!oracleInfo) {
      return;
    }
    try {
      const [oracleAddress] = PublicKey.findProgramAddressSync(
        [program.programId.toBuffer(), Buffer.from("Oracle")],
        program.programId
      );
      if (
        oracleInfo.priorityPyth > oracleInfo.prioritySwitchboard &&
        oracleInfo.priorityPyth > 0
      ) {
        await updatePythPrice(
          program,
          wallet as AnchorWallet,
          oracleInfo,
          oracleAddress
        );
      }
      if (
        oracleInfo.prioritySwitchboard > oracleInfo.priorityPyth &&
        oracleInfo.prioritySwitchboard > 0
      ) {
        await updateSwitchboardPrice(
          program,
          wallet as AnchorWallet,
          oracleInfo,
          oracleAddress
        );
      }
    } catch (e) {
      console.log(e);
    } finally {
      router.refresh();
    }
  };
  console.log({ oracleInfo });
  return (
    <div className="flex gap-4 flex-col">
      <div className="flex gap-2 flex-col">
        <h2 className="text-xl">
          Initialize Program {program?.programId.toBase58()}
        </h2>
        <Button onClick={handleInitialize}>Initialize</Button>
      </div>
      {oracleInfo && (
        <div className="flex gap-2 flex-col">
          <h2 className="text-xl">Oracle Info</h2>
          <p>
            Oracle Pyth: {bytesToHex(oracleInfo.oraclePyth)} - Priority:{" "}
            {oracleInfo.priorityPyth}
          </p>
          <p>
            Oracle Switchboard: {oracleInfo.oracleSwitchboard.toBase58()} -
            Priority: {oracleInfo.prioritySwitchboard}
          </p>
          <p>Price: {Number(oracleInfo.recentPrice)}</p>
          <p>Time: {Number(oracleInfo.lastUpdate)}</p>
        </div>
      )}
      <div className="flex gap-2 flex-col">
        <h2 className="text-xl">Update Oracle</h2>
        <Button onClick={handleUpdateOracle}>Update Oracle</Button>
      </div>
      <div className="flex gap-2 flex-col">
        <h2 className="text-xl">Update Priority</h2>
        <Button onClick={handleUpdatePriority}>Update Priority</Button>
      </div>
      <div className="flex gap-2 flex-col">
        <h2 className="text-xl">Update Price</h2>
        <Button onClick={handleUpdatePrice}>Update Price</Button>
      </div>
    </div>
  );
}

function parseHex({ feedId }: { feedId: string }): number[] {
  // Remove the '0x' prefix if present
  const cleanHex = feedId.startsWith("0x") ? feedId.slice(2) : feedId;

  // Convert hex string to Uint8Array
  const feedidBytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const feedIdArray = Array.from(feedidBytes);
  return feedIdArray;
}

function bytesToHex(bytes: number[]): string {
  return "0x" + Buffer.from(bytes).toString("hex");
}

const HERMES_URL = "https://hermes.pyth.network/";

async function updatePythPrice(
  program: Program<OraclePriority>,
  wallet: AnchorWallet,
  oracleInfo: OracleInfo,
  oracleAddress: PublicKey
) {
  const feed_id = bytesToHex(oracleInfo.oraclePyth);
  const priceServiceConnection = new PriceServiceConnection(HERMES_URL, {
    priceFeedRequestConfig: { binary: true },
  });
  const pythSolanaReceiver = new PythSolanaReceiver({
    connection: program.provider.connection,
    wallet: wallet as Wallet,
  });
  const priceUpdateData = await priceServiceConnection.getLatestVaas([feed_id]);
  console.log({ priceUpdateData });
  const transactionBuilder = pythSolanaReceiver.newTransactionBuilder({
    closeUpdateAccounts: true,
  });
  await transactionBuilder.addPostPriceUpdates(priceUpdateData);
  await transactionBuilder.addPriceConsumerInstructions(
    async (
      getPriceUpdateAccount: (priceFeedId: string) => PublicKey
    ): Promise<InstructionWithEphemeralSigners[]> => {
      return [
        {
          instruction: await program.methods
            .getPrice()
            .accounts({
              pythPriceInfo: getPriceUpdateAccount(feed_id),
              switchboardFeedInfo: oracleInfo.oracleSwitchboard,
            })
            .accountsPartial({
              oracleInfo: oracleAddress,
            })
            .instruction(),
          signers: [],
        },
      ];
    }
  );
  await pythSolanaReceiver.provider.sendAll(
    await transactionBuilder.buildVersionedTransactions({
      computeUnitPriceMicroLamports: 500000,
    })
  );
}

async function updateSwitchboardPrice(
  program: Program<OraclePriority>,
  wallet: AnchorWallet,
  oracleInfo: OracleInfo,
  oracleAddress: PublicKey
) {
  const provider = new AnchorProvider(program.provider.connection, wallet, {});
  const idl = (await Program.fetchIdl(
    "SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv",
    provider
  ))!;

  const switchboard = new Program(idl, provider);

  const crossbarClient = CrossbarClient.default();

  const pullFeed = new PullFeed(
    switchboard,
    new PublicKey("C393Ta1B6Cmg52SSd5ixHu6pADLnX6ToQxfrHPry9Md9")
  );

  const [pullIx, responses, success] = await pullFeed.fetchUpdateIx({
    chain: "eclipse",
    network: "mainnet",
    crossbarClient,
  });
  if (!pullIx) {
    return;
  }

  const myIx = await program.methods
    .getPrice()
    .accounts({
      switchboardFeedInfo: oracleInfo.oracleSwitchboard,
      pythPriceInfo: SystemProgram.programId,
    })
    .accountsPartial({
      oracleInfo: oracleAddress,
    })
    .instruction();
  const lookupTables = await loadLookupTables([
    ...responses.map((x) => x.oracle),
    pullFeed,
  ]);
  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 100_000,
  });
  const { blockhash, lastValidBlockHeight } =
    await provider.connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: wallet.publicKey!,
    instructions: [priorityFeeIx, pullIx, myIx],
    recentBlockhash: blockhash,
  }).compileToV0Message(lookupTables);
  // Get Versioned Transaction
  const vtx = new VersionedTransaction(message);
  const signed = await wallet.signTransaction(vtx);

  // Send the transaction via rpc
  const signature = await provider.connection.sendRawTransaction(
    signed.serialize(),
    {
      maxRetries: 0,
      skipPreflight: true,
    }
  );

  // Wait for confirmation
  await provider.connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });
}
