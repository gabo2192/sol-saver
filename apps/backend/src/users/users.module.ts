import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolModule } from 'src/pool/pool.module';
import { PrizeModule } from 'src/prize/prize.module';
import { SolanaModule } from 'src/solana/solana.module';
import { HistoryUserStake } from './entities/history-user-stake.entity';
import { UserTransactions } from './entities/transaction.entity';
import { UserStake } from './entities/user-stake.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersProcessor } from './users.processor';
import { UsersService } from './users.service';

@Module({
  imports: [
    PoolModule,
    SolanaModule,
    PrizeModule,
    TypeOrmModule.forFeature([
      User,
      UserStake,
      UserTransactions,
      HistoryUserStake,
    ]),
    BullModule.registerQueue({
      name: 'users-queue',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.NEXTAUTH_SECRET,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersProcessor],
  exports: [UsersService],
})
export class UsersModule {}
