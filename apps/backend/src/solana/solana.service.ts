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
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
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
  private saverNetworkFinance: Keypair;
  private externalVault: Keypair;
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
    this.saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );
    this.externalVault = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
  }

  async createTokenMint() {
    console.log(this.externalVault.publicKey.toBase58());
    console.log(this.saverNetworkFinance.publicKey.toBase58());
    const token = await createMint(
      this.connection,
      this.programAuthority,
      this.programAuthority.publicKey,
      this.programAuthority.publicKey,
      6,
    );
    await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.programAuthority,
      token,
      this.saverNetworkFinance.publicKey,
    );
    await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.programAuthority,
      token,
      this.externalVault.publicKey,
    );
    return token.toBase58();
  }

  async createPool({
    tokenMint,
  }: {
    tokenMint?: string;
  }): Promise<{ pool: string; vault: string }> {
    const programAuthority = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.PROGRAM_AUTHORITY_SEEDS)),
    );

    if (!tokenMint) {
      const [pool] = PublicKey.findProgramAddressSync(
        [
          this.externalVault.publicKey.toBuffer(),
          Buffer.from(process.env.STAKE_POOL_STATE_SEED),
        ],
        this.program.programId,
      );

      const poolPublicKey = pool.toBase58();
      console.log({ poolPublicKey });

      const createdPool = await this.program.account.poolState
        .fetch(pool)
        .catch(() => {
          console.log(
            'pool is not created is safe for us to initialize a pool',
          );
        });

      if (createdPool) {
        return {
          pool: poolPublicKey,
          vault: this.externalVault.publicKey.toBase58(),
        };
      }
      try {
        await this.program.methods
          .initPool()
          .accounts({
            programAuthority: programAuthority.publicKey,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            poolState: pool,
            externalVaultDestination: this.externalVault.publicKey,
          })
          .signers([programAuthority])
          .rpc();
        return {
          pool: pool.toBase58(),
          vault: this.externalVault.publicKey.toBase58(),
        };
      } catch (e) {
        console.log({ e });
        throw new Error('Error creating pool');
      }
    }

    const mint = new PublicKey(tokenMint);
    const stakeVault = await getAssociatedTokenAddress(
      mint,
      this.externalVault.publicKey,
    );
    const [pool] = PublicKey.findProgramAddressSync(
      [
        stakeVault.toBuffer(),
        mint.toBuffer(),
        Buffer.from(process.env.STAKE_POOL_STATE_SEED),
      ],
      this.program.programId,
    );

    const poolPublicKey = pool.toBase58();
    const createdPool = await this.program.account.tokenPoolState
      .fetch(pool)
      .catch(() => {
        console.log('pool is not created is safe for us to initialize a pool');
      });

    if (createdPool) {
      return { pool: poolPublicKey, vault: stakeVault.toBase58() };
    }
    try {
      await this.program.methods
        .initPoolToken()
        .accounts({
          programAuthority: programAuthority.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          poolState: pool,
          tokenMint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          externalVaultDestination: stakeVault,
        })
        .signers([programAuthority])
        .rpc();
      return { pool: pool.toBase58(), vault: stakeVault.toBase58() };
    } catch (e) {
      console.log({ e });
      throw new Error('Error creating pool');
    }
  }
  async initStakeEntry({
    txHash,
    pubkey,
    tokenMint,
  }: {
    txHash: string;
    pubkey: string;
    tokenMint?: string;
  }) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    if (!tokenMint) {
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
    const mint = new PublicKey(tokenMint);
    const [userEntry] = PublicKey.findProgramAddressSync(
      [
        userKey.toBuffer(),
        mint.toBuffer(),
        Buffer.from(process.env.STAKE_ENTRY_STATE_SEED),
      ],
      this.program?.programId,
    );

    const [pool] = PublicKey.findProgramAddressSync(
      [mint.toBuffer(), Buffer.from(process.env.STAKE_POOL_STATE_SEED)],
      this.program.programId,
    );

    const userStakeEntry =
      await this.program.account.stakeEntry.fetch(userEntry);
    if (!userStakeEntry) {
      throw new Error('User stake entry not found');
    }
    return { stakeEntry: userEntry, pool };
  }

  async stake({ pubkey, txHash, tokenMint }: IStake & { tokenMint?: string }) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    if (!tokenMint) {
      const [pool] = PublicKey.findProgramAddressSync(
        [
          this.externalVault.publicKey.toBuffer(),
          Buffer.from(process.env.STAKE_POOL_STATE_SEED),
        ],
        this.program.programId,
      );
      const [userEntry] = PublicKey.findProgramAddressSync(
        [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED)],
        this.program?.programId,
      );

      const poolAct = await this.program.account.poolState.fetch(pool);
      const stakeEntry = await this.program.account.stakeEntry.fetch(userEntry);

      return {
        stakeEntry,
        poolBalance: poolAct.totalStakedSol,
        decimals: LAMPORTS_PER_SOL,
      };
    }
    const mintKey = new PublicKey(tokenMint);
    const mintInfo = await getMint(this.connection, mintKey);
    const stakeVault = await getAssociatedTokenAddress(
      mintKey,
      this.externalVault.publicKey,
    );
    const [pool] = PublicKey.findProgramAddressSync(
      [
        stakeVault.toBuffer(),
        mintKey.toBuffer(),
        Buffer.from(process.env.STAKE_POOL_STATE_SEED),
      ],
      this.program.programId,
    );
    const [userEntry] = PublicKey.findProgramAddressSync(
      [
        userKey.toBuffer(),
        mintKey.toBuffer(),
        Buffer.from(process.env.STAKE_ENTRY_STATE_SEED),
      ],
      this.program?.programId,
    );
    console.log({ userEntry });
    const stakeEntry = await this.program.account.stakeEntry.fetch(userEntry);
    const poolAct = await this.program.account.tokenPoolState.fetch(pool);
    return {
      stakeEntry,
      poolBalance: poolAct.amount,
      decimals: Math.pow(10, mintInfo.decimals),
    };
  }

  async sendTokensToFinance({
    pubkey,
    amount,
    tokenMint,
  }: {
    pubkey: string;
    amount: number;
    tokenMint?: string;
  }) {
    const userKey = new PublicKey(pubkey);

    if (!tokenMint) {
      const [pool] = PublicKey.findProgramAddressSync(
        [
          this.externalVault.publicKey.toBuffer(),
          Buffer.from(process.env.STAKE_POOL_STATE_SEED),
        ],
        this.program.programId,
      );
      const [userEntry] = PublicKey.findProgramAddressSync(
        [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED)],
        this.program?.programId,
      );

      const recentBlockhash = await this.connection.getLatestBlockhash();

      const sendTokensToFinance = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.externalVault.publicKey,
          toPubkey: this.saverNetworkFinance.publicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );
      sendTokensToFinance.recentBlockhash = recentBlockhash.blockhash;
      sendTokensToFinance.feePayer = this.externalVault.publicKey;
      const poolAct = await this.program.account.poolState.fetch(pool);
      console.log({ poolAct });
      const fee = await sendTokensToFinance.getEstimatedFee(this.connection);
      console.log({ fee });

      const signature = await sendAndConfirmTransaction(
        this.connection,
        sendTokensToFinance,
        [this.externalVault],
      );
      console.log({ signature });

      const stakeEntry = await this.program.account.stakeEntry.fetch(userEntry);
      return {
        stakeEntry,
        poolBalance: poolAct.totalStakedSol,
        decimals: LAMPORTS_PER_SOL,
      };
    }
    const mintKey = new PublicKey(tokenMint);
    const mintInfo = await getMint(this.connection, mintKey);

    const stakeVault = await getAssociatedTokenAddress(
      mintKey,
      this.externalVault.publicKey,
    );
    const financeAccount = await getAssociatedTokenAddress(
      mintKey,
      this.saverNetworkFinance.publicKey,
    );
    console.log({ stakeVault: stakeVault.toBase58() });
    console.log({ financeAccount: financeAccount.toBase58() });
    await transfer(
      this.connection,
      this.externalVault,
      stakeVault,
      financeAccount,
      this.externalVault,
      (amount + 30) * Math.pow(10, mintInfo.decimals),
    );

    return true;
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
        externalSolDestination: vault.publicKey,
        userStakeEntry: userEntry,
      })
      .signers([vault])
      .rpc();

    const poolAct = await this.program.account.poolState.fetch(pool);
    return { withdraw, poolBalance: poolAct.totalStakedSol };
  }

  async calculatePoolReward(pool: string, apy: number, tokenMint?: string) {
    const poolPublicKey = new PublicKey(pool);

    if (!tokenMint) {
      const poolAct = await this.program.account.poolState.fetch(poolPublicKey);
      const poolReward = Math.floor(
        poolAct.totalStakedSol.toNumber() * (apy / 365),
      );

      await this.connection.requestAirdrop(
        this.saverNetworkFinance.publicKey,
        poolReward,
      );
      return poolReward;
    }

    const mintKey = new PublicKey(tokenMint);
    const financeAccount = await getAssociatedTokenAddress(
      mintKey,
      this.saverNetworkFinance.publicKey,
    );
    const poolAct =
      await this.program.account.tokenPoolState.fetch(poolPublicKey);

    const poolReward = Math.floor(poolAct.amount.toNumber() * (apy / 365));
    await mintTo(
      this.connection,
      this.programAuthority,
      mintKey,
      financeAccount,
      this.programAuthority.publicKey,
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

  async airdrop({ mint, pubkey }: { pubkey: string; mint: string }) {
    const destinationAccount = new PublicKey(pubkey);
    const mintKey = new PublicKey(mint);

    const mintInfo = await getMint(this.connection, mintKey);
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.programAuthority,
      mintKey,
      destinationAccount,
    );
    console.log({ associatedTokenAccount });
    await mintTo(
      this.connection,
      this.programAuthority,
      mintKey,
      associatedTokenAccount.address,
      this.programAuthority.publicKey,
      20000 * Math.pow(10, mintInfo.decimals),
    );

    return 'ok';
    // tx.feePayer = destinationAccount;
    // tx.recentBlockhash = blockhash;
    // tx.sign(this.programAuthority);
    // console.log(tx.signatures);
    // return tx.serialize({ requireAllSignatures: false }).toString('base64');
  }
}
