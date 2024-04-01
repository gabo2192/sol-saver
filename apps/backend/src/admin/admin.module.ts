import { Module } from '@nestjs/common';
import { PoolModule } from 'src/pool/pool.module';
import { PrizeModule } from 'src/prize/prize.module';
import { RankingModule } from 'src/ranking/ranking.module';
import { SeasonModule } from 'src/season/season.module';
import { SolanaModule } from 'src/solana/solana.module';
import { UsersModule } from 'src/users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  exports: [AdminService],
  imports: [
    SolanaModule,
    PoolModule,
    UsersModule,
    PrizeModule,
    SeasonModule,
    RankingModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
