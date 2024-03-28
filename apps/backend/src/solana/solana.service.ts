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
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
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
  private wallet: NodeWallet;
  constructor() {
    this.connection = new Connection(process.env.SOLANA_NODE, 'confirmed');
    this.programAuthority = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.PROGRAM_AUTHORITY_SEEDS)),
    );
    this.wallet = new NodeWallet(this.programAuthority);

    this.provider = new AnchorProvider(this.connection, this.wallet, {});
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
        vault.publicKey.toBuffer(),
        Buffer.from(process.env.STAKE_POOL_STATE_SEED),
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
          externalVaultDestination: vault.publicKey,
        })
        .signers([programAuthority])
        .rpc();
      return { pool: pool.toBase58(), vault: vault.publicKey.toBase58() };
    } catch (e) {
      console.log({ e });
      throw new Error('Error creating pool');
    }
  }
  async initStakeEntry({ txHash, pubkey }: { txHash: string; pubkey: string }) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED)],
      this.program?.programId,
    );

    const userStakeEntry =
      await this.program.account.stakeEntry.fetch(userEntry);
    if (!userStakeEntry) {
      throw new Error('User stake entry not found');
    }

    return { stakeEntry: userEntry };
  }

  async stake({ pubkey, txHash, amount }: IStake) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );

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

    return {
      pool,
      stakeEntry: userEntry,
      poolBalance: poolAct.amount,
    };
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
    console.log(saverNetworkFinance.publicKey.toBase58());
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
        externalVaultDestination: vault.publicKey,
        userStakeEntry: userEntry,
      })
      .signers([vault])
      .rpc();

    const poolAct = await this.program.account.poolState.fetch(pool);
    return { withdraw, poolBalance: poolAct.amount };
  }

  async calculatePoolReward(pool: string, apy: number) {
    const poolPublicKey = new PublicKey(pool);
    const poolAct = await this.program.account.poolState.fetch(poolPublicKey);
    const poolReward = Math.floor(poolAct.amount.toNumber() * (apy / 365));
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
    return poolAct.amount.toNumber();
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

  async airdrop({ mint, pubkey }: { pubkey: string; mint: string }) {
    const destinationAccount = new PublicKey(pubkey);
    const mintKey = new PublicKey(mint);

    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKey,
      destinationAccount,
    );
    const source = await getAssociatedTokenAddress(
      mintKey,
      this.programAuthority.publicKey,
    );
    const accountInfo = await this.connection.getAccountInfo(
      associatedTokenAccount,
    );
    console.log({ accountInfo });
    const blockhash = (await this.connection.getLatestBlockhash('finalized'))
      .blockhash;
    console.log({ accountInfo });
    if (accountInfo === null) {
      const tx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          destinationAccount,
          associatedTokenAccount,
          this.programAuthority.publicKey,
          mintKey,
        ),
      );
      tx.feePayer = destinationAccount;
      tx.recentBlockhash = blockhash;
      const signedTx = await this.provider.wallet.signTransaction(tx);
      await signedTx.partialSign(this.programAuthority);
      const serializedTx = signedTx.serialize({ requireAllSignatures: false });
      return serializedTx.toString('base64');
    }
    const tx = new Transaction().add(
      createTransferInstruction(
        source,
        associatedTokenAccount,
        this.programAuthority.publicKey,
        1 * LAMPORTS_PER_SOL,
        [this.programAuthority],
      ),
    );
    const test = await this.connection.sendTransaction(tx, [
      this.programAuthority,
    ]);
    console.log({ test });
    return 'ok';
    // tx.feePayer = destinationAccount;
    // tx.recentBlockhash = blockhash;
    // tx.sign(this.programAuthority);
    // console.log(tx.signatures);
    // return tx.serialize({ requireAllSignatures: false }).toString('base64');
  }
}
