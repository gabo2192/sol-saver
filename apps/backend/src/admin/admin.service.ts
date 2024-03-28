import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PoolService } from 'src/pool/pool.service';
import { PrizeService } from 'src/prize/prize.service';
import { SolanaTokenService } from 'src/solana/solana-token.service';
import { SolanaService } from 'src/solana/solana.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { IPool } from '../pool/interfaces/pool';
import { Vault } from './entities/vault.entity';

@Injectable()
export class AdminService {
  @InjectRepository(Vault)
  private vaultRepository: Repository<Vault>;
  constructor(
    private solanaService: SolanaService,
    private solanaTokenService: SolanaTokenService,
    private poolService: PoolService,
    private userService: UsersService,
    private prizeService: PrizeService,
  ) {}

  async createTokenMint() {
    try {
      const { tokenMint, vaultAddress } =
        await this.solanaTokenService.createTokenMint();
      await this.vaultRepository.save({
        tokenMint,
        vaultAddress,
      });
      return true;
    } catch (err) {
      console.log({ err });
      return false;
    }
  }

  async createPool(
    adminPool: Omit<IPool, 'id' | 'tokenVault' | 'poolAddress'>,
  ): Promise<any> {
    let createPoolResponse: { pool: string; vault: string } | null = null;
    if (!adminPool.tokenMint) {
      createPoolResponse = await this.solanaService.createPool();
    } else {
      createPoolResponse = await this.solanaTokenService.createPool({
        tokenMint: adminPool.tokenMint,
      });
    }
    return this.poolService.createOrFindPool({
      poolAddress: createPoolResponse.pool,
      tokenLogoUri: adminPool.tokenLogoUri,
      tokenName: adminPool.tokenName,
      tokenSymbol: adminPool.tokenSymbol,
      tokenVault: createPoolResponse.vault,
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
