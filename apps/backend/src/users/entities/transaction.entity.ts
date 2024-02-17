import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStake } from './user-stake.entity';

@Entity()
export class UserTransactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserStake, (stake) => stake.transactions)
  stakeEntry: UserStake;

  @Column({ type: 'bigint' })
  amount: bigint;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  transferedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
