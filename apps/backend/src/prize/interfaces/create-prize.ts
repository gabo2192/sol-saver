export interface ICreatePrize {
  amount: bigint;
  poolId: number;
  winner: string;
  type: 'daily' | 'weekly' | 'monthly' | 'season' | 'fee';
}
