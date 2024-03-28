import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolModule } from 'src/pool/pool.module';
import { PrizeModule } from 'src/prize/prize.module';
import { SolanaModule } from 'src/solana/solana.module';
import { UsersModule } from 'src/users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Vault } from './entities/vault.entity';

@Module({
  exports: [AdminService],
  imports: [
    SolanaModule,
    PoolModule,
    UsersModule,
    PrizeModule,
    TypeOrmModule.forFeature([Vault]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
