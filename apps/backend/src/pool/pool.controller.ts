import { Controller, Get } from '@nestjs/common';
import { IPool } from './interfaces/pool';
import { PoolService } from './pool.service';

@Controller('pool')
export class PoolController {
  constructor(private poolService: PoolService) {}
  @Get()
  async getAllPools(): Promise<IPool[]> {
    return await this.poolService.getAllPools();
  }
}
