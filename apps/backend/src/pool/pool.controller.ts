import { Controller, Get, Param } from '@nestjs/common';
import { IPool } from './interfaces/pool';
import { PoolService } from './pool.service';

@Controller('pool')
export class PoolController {
  constructor(private poolService: PoolService) {}
  @Get()
  async getAllPools(): Promise<IPool[]> {
    return await this.poolService.getAllPools();
  }
  @Get(':id')
  async getPoolById(@Param() { id }: { id: string }): Promise<IPool> {
    return await this.poolService.findPoolById(Number(id));
  }
}
