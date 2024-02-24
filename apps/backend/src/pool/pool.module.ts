import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from 'src/pool/entities/pool.entity';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';

@Module({
  controllers: [PoolController],
  providers: [PoolService],
  imports: [TypeOrmModule.forFeature([Pool])],
  exports: [PoolService],
})
export class PoolModule {}
