import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PendingPrize } from '../../prize/entities/pending-prize.entity';
import { Day } from './day.entity';
import { Month } from './month.entity';
import { Week } from './week.entity';

@Entity()
@Unique(['number'])
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column()
  initsAt: Date;

  @Column()
  endsAt: Date;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => Month, (month) => month.season)
  months: Month[];

  @OneToMany(() => Week, (week) => week.season)
  weeks: Week[];

  @OneToMany(() => Day, (day) => day.season)
  days: Day[];

  @OneToMany(() => PendingPrize, (pendingRewards) => pendingRewards.season)
  pendingRewards: PendingPrize[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
