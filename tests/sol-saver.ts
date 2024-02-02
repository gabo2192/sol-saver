import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import { assert } from "chai";
import { SolSaver } from "../target/types/sol_saver";
import {
  programKeypair,
  userKeypair1,
  userKeypair2,
  userKeypair3,
  vaultKeypair,
} from "./utils";

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
          externalSolDestination: vault.publicKey,
        })
        .signers([programAuthority])
        .rpc();
    }

    poolAcct = await program.account.poolState.fetch(pool);

    assert(
      poolAcct.authority.toBase58() == programAuthority.publicKey.toBase58()
    );
    console.log({ poolAcct: poolAcct.totalStakedSol.toNumber() });

    assert(poolAcct.totalStakedSol.toNumber() === 0);
    assert(
      poolAcct.externalSolDestination.toBase58() === vault.publicKey.toBase58()
    );
  });
  it("Create user stake entry accounts", async () => {
    console.log("here", userKeypair1.publicKey);
    console.log(userKeypair2.publicKey);
    console.log(userKeypair3.publicKey);
    const [user1Entry, entryBump] = PublicKey.findProgramAddressSync(
      [userKeypair1.publicKey.toBuffer(), Buffer.from("stake_entry")],
      program.programId
    );
    user1StakeEntry = user1Entry;

    const [user2Entry, entry2Bump] = PublicKey.findProgramAddressSync(
      [userKeypair2.publicKey.toBuffer(), Buffer.from("stake_entry")],
      program.programId
    );
    user2StakeEntry = user2Entry;

    const [user3Entry, entry3Bump] = PublicKey.findProgramAddressSync(
      [userKeypair3.publicKey.toBuffer(), Buffer.from("stake_entry")],
      program.programId
    );
    user3StakeEntry = user3Entry;

    const user1EntryAcct = await provider.connection.getAccountInfo(user1Entry);
    if (user1EntryAcct === null) {
      await program.methods
        .initStakeEntry()
        .accounts({
          poolState: pool,
          userStakeEntry: user1StakeEntry,
          user: userKeypair1.publicKey,
        })
        .signers([userKeypair1])
        .rpc();
    }
    const user1Acct = await program.account.stakeEntry.fetch(user1Entry);
    console.log({ user1Acct: user1Acct.balance.toNumber() });
    // assert(user1Acct.user.toBase58() === userKeypair1.publicKey.toBase58());
    // assert(user1Acct.bump == entryBump);
    // assert(user1Acct.balance.toNumber() === 3 * LAMPORTS_PER_SOL);

    const user2EntryAcct = await provider.connection.getAccountInfo(user2Entry);

    if (user2EntryAcct === null) {
      await program.methods
        .initStakeEntry()
        .accounts({
          poolState: pool,
          userStakeEntry: user2StakeEntry,
          user: userKeypair2.publicKey,
        })
        .signers([userKeypair2])
        .rpc();
    }
    const user2Acct = await program.account.stakeEntry.fetch(user2Entry);
    assert(user2Acct.user.toBase58() == userKeypair2.publicKey.toBase58());
    assert(user2Acct.bump == entry2Bump);
    assert(user2Acct.balance.toNumber() == 0);

    const user3EntryAcct = await provider.connection.getAccountInfo(user3Entry);

    if (user3EntryAcct === null) {
      await program.methods
        .initStakeEntry()
        .accounts({
          poolState: pool,
          userStakeEntry: user3StakeEntry,
          user: userKeypair3.publicKey,
        })
        .signers([userKeypair3])
        .rpc();
    }
    const user3Acct = await program.account.stakeEntry.fetch(user3Entry);
    assert(user3Acct.user.toBase58() == userKeypair3.publicKey.toBase58());
    assert(user3Acct.bump == entry3Bump);
    assert(user3Acct.balance.toNumber() == 0);
  });
  it("User 1 stakes 1 SOL", async () => {
    // Get information about the vault account.
    let poolAcct = await program.account.poolState.fetch(pool);

    // get user sol balance
    let userTokenAcct = await provider.connection.getAccountInfo(
      userKeypair1.publicKey
    );

    const [user1Entry, entryBump] = PublicKey.findProgramAddressSync(
      [userKeypair1.publicKey.toBuffer(), Buffer.from("stake_entry")],
      program.programId
    );

    let initialVaultBalance = poolAcct.totalStakedSol.toNumber();
    let initialUserBalance = userTokenAcct.lamports;

    await program.methods
      .stake(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        pool: pool,
        systemProgram: SystemProgram.programId,
        user: userKeypair1.publicKey,
        externalSolDestination: vault.publicKey,
        userStakeEntry: user1Entry,
      })
      .signers([userKeypair1])
      .rpc();

    poolAcct = await program.account.poolState.fetch(pool);
    userTokenAcct = await provider.connection.getAccountInfo(
      userKeypair1.publicKey
    );
    console.log({ poolAccT: poolAcct.totalStakedSol.toNumber() });
    console.log({ userTokenAcct: userTokenAcct.lamports });
    console.log({ initialVaultBalance });
    console.log({ initialUserBalance });
  });

  it("User1 unstakes", async () => {
    // Get information about the vault account.
    let poolAcct = await program.account.poolState.fetch(pool);

    // get user sol balance
    let userTokenAcct = await provider.connection.getAccountInfo(
      userKeypair1.publicKey
    );

    const [user1Entry, entryBump] = PublicKey.findProgramAddressSync(
      [userKeypair1.publicKey.toBuffer(), Buffer.from("stake_entry")],
      program.programId
    );

    let initialVaultBalance = poolAcct.totalStakedSol.toNumber();
    let initialUserBalance = userTokenAcct.lamports;

    await program.methods
      .unstake()
      .accounts({
        pool: pool,
        systemProgram: SystemProgram.programId,
        user: userKeypair1.publicKey,
        externalSolDestination: vault.publicKey,
        userStakeEntry: user1Entry,
      })
      .signers([userKeypair1, vault])
      .rpc();

    poolAcct = await program.account.poolState.fetch(pool);
    userTokenAcct = await provider.connection.getAccountInfo(
      userKeypair1.publicKey
    );

    console.log({ poolAccT: poolAcct.totalStakedSol.toNumber() });
    console.log({ userTokenAcct: userTokenAcct.lamports });
  });
});
