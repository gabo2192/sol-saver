import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './entities/ranking.entity';
import { RankingService } from './ranking.service';

@Module({
  providers: [RankingService],
  exports: [RankingService],
  imports: [TypeOrmModule.forFeature([Ranking])],
})
export class RankingModule {}
