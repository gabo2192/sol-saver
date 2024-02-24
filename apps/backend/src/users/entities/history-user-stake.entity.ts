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
export class HistoryUserStake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserStake, (userStake) => userStake.histories)
  stakeEntry: UserStake;

  @Column({ type: 'bigint' })
  balance: bigint;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
