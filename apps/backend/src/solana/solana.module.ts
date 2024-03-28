import { Module } from '@nestjs/common';
import { SolanaTokenService } from './solana-token.service';
import { SolanaService } from './solana.service';

@Module({
  providers: [SolanaService, SolanaTokenService],
  exports: [SolanaService, SolanaTokenService],
})
export class SolanaModule {}
