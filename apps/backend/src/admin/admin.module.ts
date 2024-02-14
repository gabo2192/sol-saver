import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolanaModule } from 'src/solana/solana.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Pool } from './entities/pool.entity';

@Module({
  exports: [AdminService],
  imports: [TypeOrmModule.forFeature([Pool]), SolanaModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
