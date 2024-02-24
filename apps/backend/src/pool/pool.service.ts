import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from './entities/pool.entity';
import { ICreatePool } from './interfaces/pool';

@Injectable()
export class PoolService {
  @InjectRepository(Pool)
  private poolRepository: Repository<Pool>;
  constructor() {}
  async getAllPools() {
    return await this.poolRepository.find();
  }
  async createOrFindPool({
    tokenLogoUri,
    tokenName,
    tokenSymbol,
    tokenAddress,
    poolAddress,
    tokenVault,
  }: ICreatePool) {
    const pool = await this.poolRepository.findOne({ where: { poolAddress } });
    if (!pool) {
      return this.poolRepository.save({
        poolAddress,
        tokenVault,
        tokenLogoUri,
        tokenName,
        tokenSymbol,
        tokenAddress,
        supplyApy: 0.05,
      });
    }
    return pool;
  }
  async findPoolByPubkey(poolAddress: string) {
    return this.poolRepository.findOne({ where: { poolAddress } });
  }
  async findPoolById(poolId: number) {
    return this.poolRepository.findOne({ where: { id: poolId } });
  }

  async updatePoolBalance(id: number, balance: bigint) {
    return this.poolRepository.update(id, { supply: balance });
  }
  async updateApy(id: number, apy: number) {
    return this.poolRepository.update(id, { supplyApy: apy });
  }
}
