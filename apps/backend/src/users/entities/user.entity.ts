import { Prize } from 'src/prize/entities/prize.entity';
import { Ranking } from 'src/ranking/entities/ranking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStake } from './user-stake.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  publicKey: string;

  @OneToMany(() => UserStake, (userStake) => userStake.user)
  stakeEntries: UserStake[];

  @OneToMany(() => Prize, (prize) => prize.user)
  prizes: Prize[];

  @OneToMany(() => Ranking, (ranking) => ranking.user)
  rankings: Ranking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
