import { Controller, Get, Param } from '@nestjs/common';
import { PrizeService } from './prize.service';

@Controller('prize')
export class PrizeController {
  constructor(private prizeService: PrizeService) {}

  @Get(':id')
  async getAllPools(@Param() { id }: { id: string }) {
    return await this.prizeService.getAllPrizesByPoolId(id);
  }
}
