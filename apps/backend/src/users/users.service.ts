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

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(UserStake)
  private userStakeRepository: Repository<UserStake>;
  // @InjectRepository()
  // private transactionRepository: Repository<Transaction>;
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
    return this.userRepository.find();
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

    const findUser = await this.getUser(stakeEntry.pubkey);

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
    console.log({ stake });
    const { stakeEntry } = await this.solanaService.stake(stake);
    // const pooldb = await this.adminService.findPoolByPubkey(pool.toBase58());

    // const user = await this.getUser(stake.pubkey);

    const dbEntry = await this.userStakeRepository.findOne({
      where: { publicKey: stakeEntry.toBase58() },
    });

    return this.userStakeRepository.update(dbEntry.id, {
      balance: BigInt(
        Number(dbEntry.balance) + stake.amount * LAMPORTS_PER_SOL,
      ),
    });

    // const transaction = this.transactionRepository.create({
    //   amount: stake.amount * LAMPORTS_PER_SOL,
    //   pool: pooldb.id,
    //   stakeEntry: dbEntry.id,
    //   user: user.id,
    //   transferedAt: new Date(),
    // } as DeepPartial<Transaction>);

    // return this.transactionRepository.save(transaction);
  }

  async unstake(unstake: { pubkey: string }) {
    const data = await this.solanaService.unstake(unstake);
    return data;
  }
}
