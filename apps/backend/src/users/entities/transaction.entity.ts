import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(() => User, (user) => user.transactions)
  // user: User;

  // @ManyToOne(() => Pool, (pool) => pool.transactions)
  // pool: Pool;

  // @ManyToOne(() => UserStake, (stake) => stake.transactions)
  // stakeEntry: UserStake;

  @Column()
  amount: number;

  @Column()
  transferedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
