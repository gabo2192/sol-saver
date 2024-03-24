import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PoolService } from 'src/pool/pool.service';
import { PrizeService } from 'src/prize/prize.service';
import { SolanaService } from 'src/solana/solana.service';
import { InitStakeEntryDto } from 'src/users/dtos/init-stake-entry.dto';
import { UserStake } from 'src/users/entities/user-stake.entity';
import { User } from 'src/users/entities/user.entity';
import { IStake } from 'src/users/interfaces/stake';
import { DeepPartial, Repository } from 'typeorm';
import { HistoryUserStake } from './entities/history-user-stake.entity';
import { UserTransactions } from './entities/transaction.entity';

@Injectable()
export class UsersService {
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
    private prizeService: PrizeService,
  ) {}

  async getUser(publicKey: string) {
    const user = await this.userRepository.findOne({ where: { publicKey } });
    return user;
  }
  createUser(publicKey: string) {
    return this.userRepository.save({ publicKey });
  }
  getUsers() {
    return this.userRepository.find({
      relations: ['stakeEntries', 'stakeEntries.pool'],
    });
  }
  async initStakeEntry(stakeEntry: InitStakeEntryDto & { pubkey: string }) {
    const pooldb = await this.poolService.findPoolByPubkey(
      stakeEntry.poolAddress,
    );

    if (!pooldb) {
      throw new Error('Pool not found');
    }

    const { stakeEntry: entry } = await this.solanaService.initStakeEntry({
      txHash: stakeEntry.txHash,
      pubkey: stakeEntry.pubkey,
      tokenMint: pooldb.tokenMint,
    });

    const findUser = await this.getUser(stakeEntry.pubkey);

    const dbEntry = this.userStakeRepository.create({
      balance: BigInt(0),
      pool: pooldb.id,
      user: findUser.id,
      publicKey: entry.toBase58(),
      lastStakedAt: new Date(),
    } as DeepPartial<UserStake>);
    const dbEntrySaved = await this.userStakeRepository.save(dbEntry);

    await this.historyStakeRepository.save({
      balance: BigInt(0),
      stakeEntry: {
        id: dbEntrySaved.id,
      },
    });

    return true;
  }

  async stake(stake: IStake) {
    const { stakeEntry, poolBalance } = await this.solanaService.stake(stake);

    const dbEntry = await this.userStakeRepository.findOne({
      where: { publicKey: stakeEntry.toBase58() },
      relations: ['pool'],
    });

    await this.userTransactionsRepository.save({
      amount: BigInt(stake.amount * LAMPORTS_PER_SOL),
      stakeEntry: dbEntry,
      transferedAt: new Date(),
      from: stake.pubkey,
      to: dbEntry.pool.tokenVault,
    } as DeepPartial<UserTransactions>);

    await this.historyStakeRepository.save({
      balance: BigInt(
        Number(dbEntry.balance) + stake.amount * LAMPORTS_PER_SOL,
      ),
      stakeEntry: dbEntry,
    } as DeepPartial<HistoryUserStake>);

    await this.poolService.updatePoolBalance(
      dbEntry.pool.id,
      BigInt(Number(poolBalance)),
    );

    return this.userStakeRepository.update(dbEntry.id, {
      balance: BigInt(
        Number(dbEntry.balance) + stake.amount * LAMPORTS_PER_SOL,
      ),
    });
  }

  async unstake(unstake: { pubkey: string }) {
    const { poolBalance } = await this.solanaService.unstake(unstake);
    const user = await this.userRepository.findOne({
      where: { publicKey: unstake.pubkey },
    });

    const stake = await this.userStakeRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['pool'],
    });

    await this.userTransactionsRepository.save({
      amount: stake.balance,
      stakeEntry: stake,
      transferedAt: new Date(),
      to: unstake.pubkey,
      from: stake.pool.tokenVault,
    } as DeepPartial<UserTransactions>);
    await this.poolService.updatePoolBalance(stake.pool.id, -stake.balance);
    await this.userStakeRepository.update(stake.id, { balance: BigInt(0) });
    return this.poolService.updatePoolBalance(
      stake.pool.id,
      BigInt(Number(poolBalance)),
    );
  }

  async getUserByPublicKey(pubkey: string) {
    return this.userRepository.findOne({
      where: { publicKey: pubkey },
      relations: ['stakeEntries', 'stakeEntries.pool'],
    });
  }

  async claimPrize(pubkey: string, prizeId: number) {
    const user = await this.userRepository.findOne({
      where: { publicKey: pubkey },
      relations: ['stakeEntries', 'stakeEntries.pool'],
    });
    const prize = await this.prizeService.getPrizeById(prizeId);
    if (prize.user.id !== user.id) {
      throw new Error('You are not the winner of this prize');
    }
    if (prize.isClaimed) {
      throw new Error('This prize has already been claimed');
    }
    await this.solanaService.claimPrize({
      amount: Number(prize.amount),
      pubkey,
    });
    await this.prizeService.claimPrize(prizeId);
    return true;
  }

  async airdrop(pubkey: string, mint: string) {
    return this.solanaService.airdrop({ pubkey, mint });
  }
}
