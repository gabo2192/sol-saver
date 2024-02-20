import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolanaModule } from 'src/solana/solana.module';
import { User } from 'src/users/entities/user.entity';
import { Pool } from '../pool/entities/pool.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Prize } from './entities/prize.entity';

@Module({
  exports: [AdminService],
  imports: [TypeOrmModule.forFeature([Pool, Prize, User]), SolanaModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
