import { Pool } from 'src/admin/entities/pool.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  // @OneToMany(() => Transaction, (transaction) => transaction.stakeEntry)
  // transactions: Transaction[];

  @Column({ type: 'bigint' })
  balance: bigint;

  @Column()
  lastStakedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
