import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AdminService } from 'src/admin/admin.service';
import { SolanaService } from 'src/solana/solana.service';
import { InitStakeEntryDto } from 'src/users/dtos/init-stake-entry.dto';
import { UserStake } from 'src/users/entities/user-stake.entity';
import { User } from 'src/users/entities/user.entity';
import { IStake } from 'src/users/interfaces/stake';
import { DeepPartial, Repository } from 'typeorm';
import { UserTransactions } from './entities/transaction.entity';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(UserStake)
  private userStakeRepository: Repository<UserStake>;
  @InjectRepository(UserTransactions)
  private userTransactionsRepository: Repository<UserTransactions>;

  constructor(
    private solanaService: SolanaService,
    private adminService: AdminService,
  ) {}

  async getUser(publicKey: string) {
    const user = await this.userRepository.findOne({ where: { publicKey } });
    return user;
  }
  createUser(publicKey: string) {
    return this.userRepository.save({ publicKey });
  }
  getUsers() {
    return this.userRepository.find({ relations: ['stakeEntries'] });
  }
  async initStakeEntry(stakeEntry: InitStakeEntryDto) {
    const { stakeEntry: entry, pool } = await this.solanaService.initStakeEntry(
      {
        txHash: stakeEntry.txHash,
        pubkey: stakeEntry.pubkey,
      },
    );
    console.log({ entry });
    const pooldb = await this.adminService.findPoolByPubkey(pool.toBase58());
    console.log({ pooldb });
    const findUser = await this.getUser(stakeEntry.pubkey);
    console.log({ findUser });
    const dbEntry = this.userStakeRepository.create({
      balance: BigInt(0),
      pool: pooldb.id,
      user: findUser.id,
      publicKey: entry.toBase58(),
      lastStakedAt: new Date(),
    } as DeepPartial<UserStake>);
    return this.userStakeRepository.save(dbEntry);
  }
  async stake(stake: IStake) {
    const { stakeEntry } = await this.solanaService.stake(stake);

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

    return this.userStakeRepository.update(dbEntry.id, {
      balance: BigInt(
        Number(dbEntry.balance) + stake.amount * LAMPORTS_PER_SOL,
      ),
    });
  }

  async unstake(unstake: { pubkey: string }) {
    const data = await this.solanaService.unstake(unstake);
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

    await this.userStakeRepository.update(stake.id, { balance: BigInt(0) });
    return data;
  }

  async getUserByPublicKey(pubkey: string) {
    return this.userRepository.findOne({
      where: { publicKey: pubkey },
      relations: ['stakeEntries', 'stakeEntries.pool'],
    });
  }
}
