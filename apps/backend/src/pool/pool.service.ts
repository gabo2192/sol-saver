import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from './entities/pool.entity';

@Injectable()
export class PoolService {
  @InjectRepository(Pool)
  private poolRepository: Repository<Pool>;
  constructor() {}
  async getAllPools() {
    return await this.poolRepository.find();
  }
}
