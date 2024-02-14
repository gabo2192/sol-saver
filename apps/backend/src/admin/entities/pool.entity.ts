import { UserStake } from 'src/users/entities/user-stake.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenName: string;

  @Column()
  tokenLogoUri: string;

  @Column()
  tokenSymbol: string;

  @Column({ unique: true })
  poolAddress: string;

  @Column()
  tokenVault: string;

  @Column({ nullable: true })
  tokenAddress: string;

  @OneToMany(() => UserStake, (userStake) => userStake.pool)
  userStakeEntries: UserStake[];

  // @OneToMany(() => Transaction, (transaction) => transaction.pool)
  // transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
