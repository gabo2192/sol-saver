import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PendingPrize } from '../../prize/entities/pending-prize.entity';
import { Month } from './month.entity';
import { Season } from './season.entity';
import { Week } from './week.entity';

@Entity()
@Unique(['season', 'month', 'week', 'number'])
export class Day {
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

  @ManyToOne(() => Season, (season) => season.days)
  season: Season;

  @ManyToOne(() => Month, (month) => month.days)
  month: Month;

  @ManyToOne(() => Week, (week) => week.days)
  week: Week;

  @OneToMany(() => PendingPrize, (pendingRewards) => pendingRewards.day)
  pendingRewards: PendingPrize[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
