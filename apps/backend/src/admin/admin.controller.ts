import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreatePoolDto } from './dtos/create-pool';
import { Pool } from './entities/pool.entity';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('create-pool')
  async create(@Body() createPool: CreatePoolDto): Promise<Pool> {
    return await this.adminService.create(createPool);
  }

  @Post('raffle-reward')
  async raffleReward(@Body('poolId') poolId: number) {
    return await this.adminService.raffleReward(poolId);
  }
}
