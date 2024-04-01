import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Ranking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  points: number;

  @Column({
    type: 'enum',
    enum: [
      'first_deposit',
      'first_week',
      'first_month',
      'complete season',
      'balance',
    ],
  })
  type:
    | 'first_deposit'
    | 'first_week'
    | 'first_month'
    | 'complete season'
    | 'balance';

  @ManyToOne(() => User, (user) => user.rankings)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
