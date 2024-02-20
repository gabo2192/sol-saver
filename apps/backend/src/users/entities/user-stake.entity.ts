import { Pool } from 'src/pool/entities/pool.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserTransactions } from './transaction.entity';
import { User } from './user.entity';

@Entity()
export class UserStake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  publicKey: string;

  @ManyToOne(() => User, (user) => user.stakeEntries)
  user: User;

  @ManyToOne(() => Pool, (pool) => pool.userStakeEntries)
  pool: Pool;

  @OneToMany(
    () => UserTransactions,
    (userTransactions) => userTransactions.stakeEntry,
  )
  transactions: UserTransactions[];

  @Column({ type: 'bigint' })
  balance: bigint;

  @Column()
  lastStakedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
