import { Injectable } from '@nestjs/common';
import {
  AnchorProvider,
  Idl,
  Program,
  setProvider,
  web3,
} from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { IStake } from 'src/users/interfaces/stake';
import { confirmTx } from 'utils/confirm-tx';
import { IDL, SolSaver } from './types/sol_saver';

@Injectable()
export class SolanaService {
  private program: Program<SolSaver>;
  private provider: AnchorProvider;
  private connection: Connection;
  private programAuthority: Keypair;
  constructor() {
    this.connection = new Connection(process.env.SOLANA_NODE, 'confirmed');
    this.programAuthority = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.PROGRAM_AUTHORITY_SEEDS)),
    );
    const wallet = new NodeWallet(this.programAuthority);

    this.provider = new AnchorProvider(this.connection, wallet, {});
    setProvider(this.provider);
    const programId = new PublicKey(process.env.PROGRAM_PUBKEY as string);

    this.program = new Program(IDL as Idl, programId) as Program<SolSaver>;
  }

  async createPool(): Promise<{ pool: string; vault: string }> {
    const programAuthority = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.PROGRAM_AUTHORITY_SEEDS)),
    );
    const vault = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
    const [pool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(process.env.STAKE_POOL_STATE_SEED),
        vault.publicKey.toBuffer(),
      ],
      this.program.programId,
    );

    const poolPublicKey = pool.toBase58();

    const createdPool = await this.program.account.poolState
      .fetch(pool)
      .catch(() => {
        console.log('pool is not created is safe for us to initialize a pool');
      });

    if (createdPool) {
      return { pool: poolPublicKey, vault: vault.publicKey.toBase58() };
    }
    try {
      await this.program.methods
        .initPool()
        .accounts({
          programAuthority: programAuthority.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          poolState: pool,
          externalSolDestination: vault.publicKey,
          tokenMint: null,
          tokenProgram: null,
        })
        .signers([programAuthority])
        .rpc();
      return { pool: pool.toBase58(), vault: vault.publicKey.toBase58() };
    } catch (e) {
      console.log({ e });
    }
  }
  async initStakeEntry({ txHash, pubkey }: { txHash: string; pubkey: string }) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);
    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED)],
      this.program?.programId,
    );

    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from(process.env.STAKE_POOL_STATE_SEED)],
      this.program.programId,
    );
    const userStakeEntry =
      await this.program.account.stakeEntry.fetch(userEntry);
    if (!userStakeEntry) {
      throw new Error('User stake entry not found');
    }

    return { stakeEntry: userEntry, pool };
  }

  async stake({ pubkey, txHash, amount }: IStake) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from(process.env.STAKE_POOL_STATE_SEED)],
      this.program.programId,
    );
    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED)],
      this.program?.programId,
    );

    const vault = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
    const vaultBalance = await this.connection.getBalance(vault.publicKey);

    console.log({ vaultBalance });

    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );
    console.log({
      saverNetworkFinance: saverNetworkFinance.publicKey.toBase58(),
    });
    const recentBlockhash = await this.connection.getLatestBlockhash();
    const previewTransfer = new Transaction({
      feePayer: vault.publicKey,
      recentBlockhash: recentBlockhash.blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: vault.publicKey,
        toPubkey: saverNetworkFinance.publicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );

    const estimatedGas = await previewTransfer.getEstimatedFee(this.connection);
    console.log({ estimatedGas });
    console.log({
      saverNetworkFinance: saverNetworkFinance.publicKey.toBase58(),
    });
    const sendTokensToFinance = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: vault.publicKey,
        toPubkey: saverNetworkFinance.publicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );
    const poolAct = await this.program.account.poolState.fetch(pool);

    await sendAndConfirmTransaction(this.connection, sendTokensToFinance, [
      vault,
    ]);

    return { pool, stakeEntry: userEntry, poolBalance: poolAct.totalStakedSol };
  }

  async unstake({ pubkey }: { pubkey: string }) {
    const userKey = new PublicKey(pubkey);
    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED)],
      this.program?.programId,
    );
    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from(process.env.STAKE_POOL_STATE_SEED)],
      this.program.programId,
    );
    const vault = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
    const userEntryAccount =
      await this.program.account.stakeEntry.fetch(userEntry);
    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );
    const sendTokensToFinance = new Transaction().add(
      SystemProgram.transfer({
        toPubkey: vault.publicKey,
        fromPubkey: saverNetworkFinance.publicKey,
        lamports: Number(userEntryAccount.balance),
      }),
    );
    await sendAndConfirmTransaction(this.connection, sendTokensToFinance, [
      saverNetworkFinance,
    ]);
    const withdraw = await this.program.methods
      .unstake()
      .accounts({
        pool,
        systemProgram: SystemProgram.programId,
        user: userKey,
        externalSolDestination: vault.publicKey,
        userStakeEntry: userEntry,
      })
      .signers([vault])
      .rpc();

    const poolAct = await this.program.account.poolState.fetch(pool);
    return { withdraw, poolBalance: poolAct.totalStakedSol };
  }

  async calculatePoolReward(pool: string, apy: number) {
    const poolPublicKey = new PublicKey(pool);
    const poolAct = await this.program.account.poolState.fetch(poolPublicKey);
    const poolReward = Math.floor(
      poolAct.totalStakedSol.toNumber() * (apy / 365),
    );
    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );
    await this.connection.requestAirdrop(
      saverNetworkFinance.publicKey,
      poolReward,
    );
    return poolReward;
  }

  async getPoolBalance(pool: string) {
    const poolPublicKey = new PublicKey(pool);
    const poolAct = await this.program.account.poolState.fetch(poolPublicKey);
    return poolAct.totalStakedSol.toNumber();
  }

  async claimPrize({ pubkey, amount }: { pubkey: string; amount: number }) {
    const vault = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );
    const userKey = new PublicKey(pubkey);
    const sendPrizeToPool = new Transaction().add(
      SystemProgram.transfer({
        toPubkey: vault.publicKey,
        fromPubkey: saverNetworkFinance.publicKey,
        lamports: Number(amount),
      }),
    );
    await sendAndConfirmTransaction(this.connection, sendPrizeToPool, [
      saverNetworkFinance,
    ]);

    const sendPrizeToUser = new Transaction().add(
      SystemProgram.transfer({
        toPubkey: userKey,
        fromPubkey: vault.publicKey,
        lamports: Number(amount),
      }),
    );
    await sendAndConfirmTransaction(this.connection, sendPrizeToUser, [vault]);
    return true;
  }
}
