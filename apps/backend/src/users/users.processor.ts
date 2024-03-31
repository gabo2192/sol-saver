import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { PoolService } from 'src/pool/pool.service';
import { SolanaService } from 'src/solana/solana.service';
import { DeepPartial, Repository } from 'typeorm';
import { HistoryUserStake } from './entities/history-user-stake.entity';
import { UserTransactions } from './entities/transaction.entity';
import { UserStake } from './entities/user-stake.entity';
import { User } from './entities/user.entity';
import { IStake } from './interfaces/stake';

@Processor('users-queue')
export class UsersProcessor {
  private readonly logger = new Logger(UsersProcessor.name);
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(UserStake)
  private userStakeRepository: Repository<UserStake>;
  @InjectRepository(HistoryUserStake)
  private historyStakeRepository: Repository<HistoryUserStake>;
  @InjectRepository(UserTransactions)
  private userTransactionsRepository: Repository<UserTransactions>;

  constructor(
    private solanaService: SolanaService,
    private poolService: PoolService,
  ) {}
  @Process('stake')
  async handleStake(job: Job<IStake>) {
    const stake = job.data;
    try {
      const pool = await this.poolService.findPoolById(stake.pool);
      const { stakeEntry, poolBalance, decimals } =
        await this.solanaService.stake({
          ...stake,
          tokenMint: pool.tokenMint,
        });
      console.log({ poolBalance });
      console.log({ stakeEntry });

      const dbEntry = await this.userStakeRepository.findOne({
        where: {
          pool: {
            id: pool.id,
          },
          user: {
            publicKey: stake.pubkey,
          },
        },
      });
      await this.userTransactionsRepository.save({
        amount: BigInt(stake.amount * decimals),
        stakeEntry: dbEntry,
        transferedAt: new Date(),
        from: stake.pubkey,
        to: pool.tokenVault,
      } as DeepPartial<UserTransactions>);

      await this.historyStakeRepository.save({
        balance: BigInt(stakeEntry.balance.toNumber()),
        stakeEntry: dbEntry,
      } as DeepPartial<HistoryUserStake>);

      await this.poolService.updatePoolBalance(
        pool.id,
        BigInt(poolBalance.toNumber()),
      );

      await this.userStakeRepository.update(dbEntry.id, {
        balance: BigInt(stakeEntry.balance.toNumber()),
      });

      //TODO: store fees
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
