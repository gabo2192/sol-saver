import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BN } from 'bn.js';
import { Repository } from 'typeorm';
import { PendingPrize } from './entities/pending-prize.entity';
import { Prize } from './entities/prize.entity';
import { ICreatePendingPrize } from './interfaces/create-pending-prize';
import { ICreatePrize } from './interfaces/create-prize';
import { IGetPendingPrize } from './interfaces/get-pending-prize';

@Injectable()
export class PrizeService {
  @InjectRepository(Prize)
  private prizeRepository: Repository<Prize>;
  @InjectRepository(PendingPrize)
  private pendingPrizeRepository: Repository<PendingPrize>;
  constructor() {}
  async create({ amount, poolId, winner, type }: ICreatePrize) {
    const prize = await this.prizeRepository.save({
      amount,
      pool: {
        id: poolId,
      },
      user: {
        id: winner,
      },
      type,
    });
    return prize;
  }
  async getAllPrizesByPoolId(poolId: string) {
    const prizes = await this.prizeRepository.find({
      where: {
        pool: {
          id: Number(poolId),
        },
      },
      relationLoadStrategy: 'join',
      relations: ['user', 'pool'],
    });

    return prizes;
  }

  async getPrizeById(id: number) {
    return await this.prizeRepository.findOne({
      where: {
        id,
      },
      relations: ['user', 'pool'],
    });
  }
  async claimPrize(prizeId: number) {
    return await this.prizeRepository.update(prizeId, { isClaimed: true });
  }
  async createPendingPrize({
    amount,
    poolId,
    type,
    seasonId,
    monthId,
    weekId,
    dayId,
  }: ICreatePendingPrize) {
    return await this.pendingPrizeRepository.save({
      amount,
      type,
      pool: {
        id: poolId,
      },
      day: {
        id: dayId,
      },
      week: {
        id: weekId,
      },
      month: {
        id: monthId,
      },
      season: {
        id: seasonId,
      },
    });
  }
  async getPendingPrizeAndClaim({
    type,
    monthId,
    poolId,
    seasonId,
    weekId,
  }: IGetPendingPrize): Promise<number> {
    const prizes = await this.pendingPrizeRepository.find({
      where: {
        type,
        month: monthId && {
          id: monthId,
        },
        pool: {
          id: poolId,
        },
        season: {
          id: seasonId,
        },
        week: weekId && {
          id: weekId,
        },
        isPaid: false,
      },
    });
    await Promise.all(
      prizes.map((prize) =>
        this.pendingPrizeRepository.update(prize.id, { isPaid: true }),
      ),
    );
    return prizes.reduce(
      (acc, prize) => acc + new BN(prize.amount.toString()).toNumber(),
      0,
    );
  }
}
