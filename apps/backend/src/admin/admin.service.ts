import { Injectable } from '@nestjs/common';
import { PoolService } from 'src/pool/pool.service';
import { PrizeService } from 'src/prize/prize.service';
import { SolanaService } from 'src/solana/solana.service';
import { UsersService } from 'src/users/users.service';
import { IPool } from '../pool/interfaces/pool';

@Injectable()
export class AdminService {
  constructor(
    private solanaService: SolanaService,
    private poolService: PoolService,
    private userService: UsersService,
    private prizeService: PrizeService,
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
  async raffleReward(poolId: number, apy: number) {
    const pool = await this.poolService.findPoolById(poolId);
    const calculatePoolReward = await this.solanaService.calculatePoolReward(
      pool.poolAddress,
      apy,
    );
    const users = await this.userService.getUsers();
    const poolBalance = await this.solanaService.getPoolBalance(
      pool.poolAddress,
    );
    const randomNumber = Math.random() * poolBalance;

    const totalStakedByUsers = users.map((user) => ({
      id: user.id,
      balance:
        user.stakeEntries.find((i) => i.pool.id === poolId)?.balance ||
        BigInt(0),
    }));
    const winner = await this.getWinner(totalStakedByUsers, randomNumber);
    await this.poolService.updateApy(poolId, apy);
    console.log({ calculatePoolReward });
    await this.prizeService.create({
      amount: BigInt(Math.floor(calculatePoolReward * 0.6)),
      poolId: pool.id,
      winner,
    });
    return true;
  }
  private async getWinner(
    users: {
      id: string;
      balance: bigint;
    }[],
    randomNumber: number,
  ) {
    let cumulativeBalance = 0;

    for (const user of users) {
      cumulativeBalance += Number(user.balance);
      if (cumulativeBalance > randomNumber) {
        return user.id;
      }
    }
    return null;
  }
}
