export interface ICreatePendingPrize {
  amount: bigint;
  poolId: number;
  type: 'daily' | 'weekly' | 'monthly' | 'season' | 'fee';
  monthId: number;
  weekId: number;
  dayId: number;
  seasonId: number;
}
