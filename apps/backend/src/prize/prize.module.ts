import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingPrize } from './entities/pending-prize.entity';
import { Prize } from './entities/prize.entity';
import { PrizeController } from './prize.controller';
import { PrizeService } from './prize.service';

@Module({
  imports: [TypeOrmModule.forFeature([Prize, PendingPrize])],
  providers: [PrizeService],
  exports: [PrizeService],
  controllers: [PrizeController],
})
export class PrizeModule {}
