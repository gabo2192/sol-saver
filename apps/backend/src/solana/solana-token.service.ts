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
  createAssociatedTokenAccountInstruction,
  createMint,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
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
import { SolTokenSaver, IDL as tokenIDL } from './types/sol_token_saver';

@Injectable()
export class SolanaTokenService {
  private program: Program<SolTokenSaver>;
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
    const tokenProgramId = new PublicKey(
      process.env.TOKEN_PROGRAM_ID as string,
    );

    this.program = new Program(
      tokenIDL as Idl,
      tokenProgramId,
    ) as Program<SolTokenSaver>;
  }

  async createTokenMint() {
    const token = await createMint(
      this.connection,
      this.programAuthority,
      this.programAuthority.publicKey,
      this.programAuthority.publicKey,
      9,
    );
    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );
    console.log({
      saverNetworkFinance: saverNetworkFinance.publicKey.toBase58(),
    });
    const externalVaultDestination = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
    console.log({
      externalVaultDestination: externalVaultDestination.publicKey.toBase58(),
    });
    console.log({ token: token.toBase58() });

    const vaultAddress = await getOrCreateAssociatedTokenAccount(
      this.connection,
      externalVaultDestination,
      token,
      this.programAuthority.publicKey,
    );
    await getOrCreateAssociatedTokenAccount(
      this.connection,
      saverNetworkFinance,
      token,
      this.programAuthority.publicKey,
    );

    return {
      tokenMint: token.toBase58(),
      vaultAddress: vaultAddress.address.toBase58(),
    };
  }

  async createPool({
    tokenMint,
  }: {
    tokenMint: string;
  }): Promise<{ pool: string; vault: string }> {
    console.log(tokenMint);
    const mint = new PublicKey(tokenMint);

    const vault = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.VAULT_SEEDS)),
    );
    const vaultAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      vault,
      mint,
      this.programAuthority.publicKey,
    );
    console.log({ vaultAccount });
    const [pool] = PublicKey.findProgramAddressSync(
      [
        vaultAccount.address.toBuffer(),
        mint.toBuffer(),
        Buffer.from(process.env.STAKE_POOL_STATE_SEED),
      ],
      this.program.programId,
    );
    console.log({ pool: pool.toBase58() });
    const poolPublicKey = pool.toBase58();
    const createdPool = await this.program.account.poolState
      .fetch(pool)
      .catch(() => {
        console.log('pool is not created is safe for us to initialize a pool');
      });

    if (createdPool) {
      return { pool: poolPublicKey, vault: vaultAccount.address.toBase58() };
    }
    console.log(vaultAccount.address.toBase58());
    try {
      await this.program.methods
        .initPoolToken()
        .accounts({
          programAuthority: this.programAuthority.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          poolState: pool,
          tokenMint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          externalVaultDestination: vaultAccount.address,
        })
        .signers([this.programAuthority])
        .rpc();
      return { pool: pool.toBase58(), vault: vaultAccount.address.toBase58() };
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
    tokenMint: string;
  }) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    const mint = new PublicKey(tokenMint);

    const [userEntry] = PublicKey.findProgramAddressSync(
      [
        userKey.toBuffer(),
        mint.toBuffer(),
        Buffer.from(process.env.STAKE_ENTRY_STATE_SEED),
      ],
      this.program?.programId,
    );

    const userStakeEntry =
      await this.program.account.stakeEntry.fetch(userEntry);
    if (!userStakeEntry) {
      throw new Error('User stake entry not found');
    }
    return { stakeEntry: userEntry };
  }

  async stake({ pubkey, txHash, amount, tokenMint }: IStake) {
    await confirmTx(txHash, this.connection);
    const userKey = new PublicKey(pubkey);

    const saverNetworkFinance = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SAVER_NETWORK_FINANCE)),
    );

    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault_authority')],
      this.program.programId,
    );
    const mint = new PublicKey(tokenMint);
    const [pool] = PublicKey.findProgramAddressSync(
      [mint.toBuffer(), Buffer.from(process.env.STAKE_POOL_STATE_SEED)],
      this.program.programId,
    );

    const [userEntry] = PublicKey.findProgramAddressSync(
      [
        userKey.toBuffer(),
        mint.toBuffer(),
        Buffer.from(process.env.STAKE_ENTRY_STATE_SEED),
      ],
      this.program?.programId,
    );

    const poolAct = await this.program.account.poolState.fetch(pool);
    const saverAccountToken = await getOrCreateAssociatedTokenAccount(
      this.connection,
      saverNetworkFinance,
      mint,
      this.programAuthority.publicKey,
    );

    const test = await transfer(
      this.connection,
      this.programAuthority,
      poolAct.externalVaultDestination,
      saverAccountToken.address,
      vaultAuthority,
      amount * LAMPORTS_PER_SOL,
      [this.programAuthority],
    );

    console.log({ test });

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
