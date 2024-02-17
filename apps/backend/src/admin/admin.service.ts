import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool } from 'src/admin/entities/pool.entity';
import { SolanaService } from 'src/solana/solana.service';
import { Repository } from 'typeorm';
import { IPool } from './interfaces/pool';

@Injectable()
export class AdminService {
  @InjectRepository(Pool)
  private adminRepository: Repository<Pool>;
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
}
