import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prize } from './entities/prize.entity';
import { PrizeService } from './prize.service';
import { PrizeController } from './prize.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prize])],
  providers: [PrizeService],
  exports: [PrizeService],
  controllers: [PrizeController],
})
export class PrizeModule {}
