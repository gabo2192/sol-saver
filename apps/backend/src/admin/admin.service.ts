import { Injectable } from '@nestjs/common';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from 'bn.js';
import { PoolService } from 'src/pool/pool.service';
import { PrizeService } from 'src/prize/prize.service';
import { RankingService } from 'src/ranking/ranking.service';
import { SeasonService } from 'src/season/season.service';
import { SolanaService } from 'src/solana/solana.service';
import { UsersService } from 'src/users/users.service';
import { getDailyWinner, getWinner } from 'utils/get-winners';
import { IPool } from '../pool/interfaces/pool';

@Injectable()
export class AdminService {
  constructor(
    private solanaService: SolanaService,
    private poolService: PoolService,
    private userService: UsersService,
    private prizeService: PrizeService,
    private seasonService: SeasonService,
    private rankingService: RankingService,
  ) {}

  async createTokenMint() {
    return this.solanaService.createTokenMint();
  }

  async createPool(
    adminPool: Omit<IPool, 'id' | 'tokenVault' | 'poolAddress'>,
  ): Promise<any> {
    const { pool, vault } = await this.solanaService.createPool({
      tokenMint: adminPool.tokenMint,
    });
    return this.poolService.createOrFindPool({
      poolAddress: pool,
      tokenLogoUri: adminPool.tokenLogoUri,
      tokenName: adminPool.tokenName,
      tokenSymbol: adminPool.tokenSymbol,
      tokenVault: vault,
      tokenMint: adminPool.tokenMint,
    });
  }
  async createReward(poolId: number, apy: number) {
    const pool = await this.poolService.findPoolById(poolId);
    const currentDay = await this.seasonService.getCurrentDay();
    const reward = await this.solanaService.calculatePoolReward(
      pool.poolAddress,
      apy,
      pool.tokenMint,
    );

    const usersReward = Math.floor(reward * 0.6);
    const poolFee = reward - usersReward;
    await this.prizeService.createPendingPrize({
      amount: BigInt(poolFee),
      dayId: currentDay.id,
      monthId: currentDay.month.id,
      poolId: pool.id,
      seasonId: currentDay.season.id,
      type: 'fee',
      weekId: currentDay.week.id,
    });

    const dailyReward = Math.floor(usersReward * 0.4);
    const weeklyReward = Math.floor(usersReward * 0.2);
    const monthlyReward = Math.floor(usersReward * 0.2);

    const seasonReward =
      usersReward - dailyReward - weeklyReward - monthlyReward;

    await this.poolService.updateApy(poolId, apy);
    const newBalance = new BN(pool.supply.toString()).toNumber() + reward;
    await this.poolService.updatePoolBalance(poolId, BigInt(newBalance));

    await this.prizeService.createPendingPrize({
      amount: BigInt(dailyReward),
      dayId: currentDay.id,
      monthId: currentDay.month.id,
      poolId: pool.id,
      seasonId: currentDay.season.id,
      type: 'daily',
      weekId: currentDay.week.id,
    });

    await this.prizeService.createPendingPrize({
      amount: BigInt(weeklyReward),
      dayId: currentDay.id,
      monthId: currentDay.month.id,
      poolId: pool.id,
      seasonId: currentDay.season.id,
      type: 'weekly',
      weekId: currentDay.week.id,
    });
    await this.prizeService.createPendingPrize({
      amount: BigInt(monthlyReward),
      dayId: currentDay.id,
      monthId: currentDay.month.id,
      poolId: pool.id,
      seasonId: currentDay.season.id,
      type: 'monthly',
      weekId: currentDay.week.id,
    });
    await this.prizeService.createPendingPrize({
      amount: BigInt(seasonReward),
      dayId: currentDay.id,
      monthId: currentDay.month.id,
      poolId: pool.id,
      seasonId: currentDay.season.id,
      type: 'season',
      weekId: currentDay.week.id,
    });

    const users = await this.userService.getStakeEntriesByPoolId(pool.id);
    const usersWithBalance = users.map((u) => ({
      ...u,
      balance: new BN(u.balance.toString()).toNumber(),
    }));

    let dailyWinner = await getDailyWinner(usersWithBalance, newBalance);
    if (!dailyWinner) {
      dailyWinner = await getDailyWinner(usersWithBalance, newBalance);
    }
    console.log({ dailyWinner });

    await this.prizeService.create({
      amount: BigInt(dailyReward),
      poolId: pool.id,
      winner: dailyWinner,
      type: 'daily',
    });
    if (currentDay.number === 7) {
      const wekklyWinner = await getWinner(usersWithBalance);
      const reward = await this.prizeService.getPendingPrizeAndClaim({
        type: 'weekly',
        poolId: pool.id,
        weekId: currentDay.week.id,
        monthId: currentDay.month.id,
        seasonId: currentDay.season.id,
      });
      console.log({ reward });
      await this.prizeService.create({
        amount: BigInt(reward),
        poolId: pool.id,
        winner: wekklyWinner,
        type: 'weekly',
      });
    }
    if (currentDay.week.number === 4 && currentDay.number === 7) {
      const monthlyWinner = await getWinner(usersWithBalance);
      const reward = await this.prizeService.getPendingPrizeAndClaim({
        type: 'monthly',
        poolId: pool.id,
        monthId: currentDay.month.id,
        seasonId: currentDay.season.id,
      });
      await this.prizeService.create({
        amount: BigInt(reward),
        poolId: pool.id,
        winner: monthlyWinner,
        type: 'monthly',
      });
    }
    if (
      currentDay.month.number === 3 &&
      currentDay.week.number === 4 &&
      currentDay.number === 7
    ) {
      const seasonWinner = await getWinner(usersWithBalance);
      const reward = await this.prizeService.getPendingPrizeAndClaim({
        type: 'season',
        poolId: pool.id,
        seasonId: currentDay.season.id,
      });
      await this.prizeService.create({
        amount: BigInt(reward),
        poolId: pool.id,
        winner: seasonWinner,
        type: 'season',
      });
    }

    return true;
  }

  async startSeason() {
    return this.seasonService.startSeason();
  }
  async startSeasonPointSystem() {
    // Get users with balance
    const users = await this.userService.getUsersWithBalance();
    const currentSeasson = await this.seasonService.getCurrentSeason();
    const pools = await this.poolService.getAllPools();

    const solanaPrice = 180;

    const usdcPool = pools.find((pool) => pool.tokenSymbol === 'FUSDC');
    const solPol = pools.find((pool) => pool.tokenSymbol === 'SOL');

    // Get balance amount per user.

    const calculatePoints = ({
      balance,
      poolId,
    }: {
      balance: bigint;
      poolId: number;
    }) => {
      const isSOL = poolId === solPol.id;
      const amount = new BN(balance.toString()).toNumber();
      const price = isSOL
        ? (amount * solanaPrice) / LAMPORTS_PER_SOL
        : amount / usdcPool.decimals;
      return price >= 500 ? 500 : price;
    };

    const usersWithTotalBalance = users.reduce(
      (result, user) => {
        const existingUser = result.find((u) => u.id === user.id);
        const isSOL = user.pool === solPol.id;
        const amount = new BN(user.balance.toString()).toNumber();
        const amountInUSDC = isSOL
          ? (amount * solanaPrice) / LAMPORTS_PER_SOL
          : amount / usdcPool.decimals;
        if (existingUser) {
          const points =
            existingUser.points +
            calculatePoints({ balance: user.balance, poolId: user.pool });
          existingUser.points = points ? 500 : points;
          existingUser.balance += amountInUSDC;
        } else {
          result.push({
            id: user.id,
            points: calculatePoints({
              balance: user.balance,
              poolId: user.pool,
            }),
            balance: amountInUSDC,
          });
        }

        return result;
      },
      [] as { id: string; points: number; balance: number }[],
    );

    const saveRankings = usersWithTotalBalance.map((user) => {
      return this.rankingService.insertRanking({
        points: user.points,
        type: 'first_deposit',
        userId: user.id,
        seasonId: currentSeasson.id,
      });
    });
    const balanceRankings = usersWithTotalBalance.map((user) =>
      this.rankingService.insertRanking({
        points: Math.floor(Math.log(user.balance + 1)),
        type: 'balance',
        userId: user.id,
        seasonId: currentSeasson.id,
      }),
    );
    await Promise.allSettled([...saveRankings, ...balanceRankings]);
  }
  async incrementDay() {
    return this.seasonService.incrementDay();
  }
}
