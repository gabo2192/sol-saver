import { Body, Controller, Post } from '@nestjs/common';
import { Pool } from '../pool/entities/pool.entity';
import { AdminService } from './admin.service';
import { CreatePoolDto } from './dtos/create-pool';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('create-pool')
  async create(@Body() createPool: CreatePoolDto): Promise<Pool> {
    return await this.adminService.create(createPool);
  }

  @Post('raffle-reward')
  async raffleReward(@Body() { poolId, apy }: { poolId: number; apy: number }) {
    return await this.adminService.raffleReward(poolId, apy);
  }
}
