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
import { Season } from './season.entity';
import { Week } from './week.entity';

@Entity()
@Unique(['season', 'number'])
export class Month {
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

  @ManyToOne(() => Season, (season) => season.months)
  season: Season;

  @OneToMany(() => Week, (week) => week.month)
  weeks: Week[];

  @OneToMany(() => Day, (day) => day.month)
  days: Day[];

  @OneToMany(() => PendingPrize, (pendingRewards) => pendingRewards.month)
  pendingRewards: PendingPrize[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
