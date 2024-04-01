export interface IGetPendingPrize {
  poolId: number;
  type: 'daily' | 'weekly' | 'monthly' | 'season' | 'fee';
  monthId?: number;
  weekId?: number;
  seasonId: number;
}
