import { UserStake } from 'src/users/entities/user-stake.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Prize } from '../../admin/entities/prize.entity';

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

  @Column({ type: 'bigint', default: BigInt(0) })
  supply: bigint;

  @Column({ default: 0 })
  supplyApy: number;

  @OneToMany(() => UserStake, (userStake) => userStake.pool)
  userStakeEntries: UserStake[];

  @OneToMany(() => Prize, (prize) => prize.pool)
  prizes: Prize[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
