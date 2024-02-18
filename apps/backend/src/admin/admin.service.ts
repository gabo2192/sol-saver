import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool } from 'src/admin/entities/pool.entity';
import { SolanaService } from 'src/solana/solana.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Prize } from './entities/prize.entity';
import { IPool } from './interfaces/pool';

@Injectable()
export class AdminService {
  @InjectRepository(Pool)
  private adminRepository: Repository<Pool>;
  @InjectRepository(Prize)
  private prizeRepository: Repository<Prize>;
  @InjectRepository(User)
  private userRepository: Repository<User>;
  constructor(private solanaService: SolanaService) {}

  async create(
    adminPool: Omit<IPool, 'id' | 'tokenVault' | 'poolAddress'>,
  ): Promise<Pool> {
    const { pool, vault } = await this.solanaService.createPool();
    const databasePool = await this.adminRepository.findOne({
      where: { poolAddress: pool },
    });
    if (!databasePool) {
      return this.adminRepository.save({
        ...adminPool,
        poolAddress: pool,
        tokenVault: vault,
      });
    }

    return databasePool;
  }
  async findPoolById(id: number) {
    return this.adminRepository.findOne({ where: { id } });
  }

  async findPoolByPubkey(pubkey: string) {
    return this.adminRepository.findOne({ where: { poolAddress: pubkey } });
  }

  async raffleReward(poolId: number) {
    const pool = await this.adminRepository.findOne({ where: { id: poolId } });
    const calculatePoolReward = await this.solanaService.calculatePoolReward(
      pool.poolAddress,
    );
    const users = await this.userRepository.find({
      relations: ['stakeEntries'],
    });
    const poolBalance = await this.solanaService.getPoolBalance(
      pool.poolAddress,
    );
    const totalStakedByUsers = users.map((user) => ({
      id: user.id,
      balance:
        user.stakeEntries.find((i) => i.pool.id === poolId)?.balance ||
        BigInt(0),
    }));

    const winner = await this.getWinner(totalStakedByUsers, poolBalance);
    const prize = this.prizeRepository.create({
      amount: BigInt(calculatePoolReward),
      pool,
      user: {
        id: winner,
      },
    });

    return await this.prizeRepository.save(prize);
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
