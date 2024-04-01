import { Body, Controller, Post } from '@nestjs/common';
import { Pool } from '../pool/entities/pool.entity';
import { AdminService } from './admin.service';
import { CreatePoolDto } from './dtos/create-pool';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('create-pool')
  async createPool(@Body() createPool: CreatePoolDto): Promise<Pool> {
    return await this.adminService.createPool(createPool);
  }

  @Post('create-mint')
  async createMint(): Promise<string> {
    return await this.adminService.createTokenMint();
  }

  @Post('create-reward')
  async createReward(@Body() { poolId, apy }: { poolId: number; apy: number }) {
    return await this.adminService.createReward(poolId, apy);
  }

  @Post('/start-season')
  async startSeason() {
    return await this.adminService.startSeason();
  }
  @Post('/start-season-points')
  async startSeasonPointSystem() {
    return await this.adminService.startSeasonPointSystem();
  }

  @Post('/start-day')
  async startDay() {
    return await this.adminService.incrementDay();
  }
}
