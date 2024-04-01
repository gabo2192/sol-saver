import { Pool } from 'src/pool/entities/pool.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Day } from '../../season/entities/day.entity';
import { Month } from '../../season/entities/month.entity';
import { Season } from '../../season/entities/season.entity';
import { Week } from '../../season/entities/week.entity';

@Entity()
@Unique('unique_pending_prize', [
  'pool',
  'season',
  'month',
  'week',
  'day',
  'type',
])
export class PendingPrize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  amount: bigint;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'season', 'fee'],
  })
  type: 'daily' | 'weekly' | 'monthly' | 'season' | 'fee';

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @ManyToOne(() => Pool, (pool) => pool.pendingRewards)
  pool: Pool;

  @ManyToOne(() => Season, (season) => season.pendingRewards)
  season: Season;

  @ManyToOne(() => Month, (month) => month.pendingRewards)
  month: Month;

  @ManyToOne(() => Week, (week) => week.pendingRewards)
  week: Week;

  @ManyToOne(() => Day, (day) => day.pendingRewards)
  day: Day;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
