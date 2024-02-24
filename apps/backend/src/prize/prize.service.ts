import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prize } from './entities/prize.entity';
import { ICreatePrize } from './interfaces/create-prize';

@Injectable()
export class PrizeService {
  @InjectRepository(Prize)
  private prizeRepository: Repository<Prize>;
  constructor() {}
  async create({ amount, poolId, winner }: ICreatePrize) {
    const prize = await this.prizeRepository.save({
      amount,
      pool: {
        id: poolId,
      },
      user: {
        id: winner,
      },
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
    console.log({ prizes });
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
    console.log({ prizeId });
    return await this.prizeRepository.update(prizeId, { isClaimed: true });
  }
}
