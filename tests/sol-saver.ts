import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import { SolSaver } from "../target/types/sol_saver";
import { programKeypair, vaultKeypair } from "./utils";

describe("sol-saver", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const program = anchor.workspace.SolSaver as Program<SolSaver>;
  const provider = anchor.AnchorProvider.env();

  console.log({ programKeypair: programKeypair.publicKey });
  console.log({ vaultKeypair: vaultKeypair.publicKey });
  let programAuthority = programKeypair;
  let vault = vaultKeypair;
  let pool: PublicKey = null;

  let user1StakeEntry: PublicKey = null;
  let user2StakeEntry: PublicKey = null;
  let user3StakeEntry: PublicKey = null;
  it("Is initialized!", async () => {
    // Add your test here.

    const [poolState, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("state")],
      program.programId
    );
    pool = poolState;
    console.log({ pool: pool.toBase58() });
    let poolAcct = await program.account.poolState.fetch(pool);
    if (poolAcct === null) {
      await program.methods
        .initPool()
        .accounts({
          programAuthority: programKeypair.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          poolState: pool,
          externalVaultDestination: vault.publicKey,
        })
        .signers([programAuthority])
        .rpc();
    }

    poolAcct = await program.account.poolState.fetch(pool);
  });
});
