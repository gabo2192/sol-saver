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
import { Day } from './day.entity';
import { Month } from './month.entity';
import { Season } from './season.entity';

@Entity()
@Unique(['season', 'month', 'number'])
export class Week {
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

  @ManyToOne(() => Season, (season) => season.weeks)
  season: Season;

  @ManyToOne(() => Month, (month) => month.weeks)
  month: Month;

  @OneToMany(() => Day, (day) => day.week)
  days: Day[];

  @OneToMany(() => PendingPrize, (pendingRewards) => pendingRewards.week)
  pendingRewards: PendingPrize[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
