export interface IStake {
  pubkey: string;
  txHash: string;
  amount: number;
  poolId: number;
  tokenMint?: string;
}
