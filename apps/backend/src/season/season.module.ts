import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day } from './entities/day.entity';
import { Month } from './entities/month.entity';
import { Season } from './entities/season.entity';
import { Week } from './entities/week.entity';
import { SeasonService } from './season.service';

@Module({
  providers: [SeasonService],
  imports: [TypeOrmModule.forFeature([Season, Month, Day, Week])],
  exports: [SeasonService],
  controllers: [],
})
export class SeasonModule {}
