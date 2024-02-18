import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pool } from './pool.entity';

@Entity()
export class Prize {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Pool, (pool) => pool.prizes)
  pool: Pool;

  @OneToMany(() => User, (user) => user.prizes)
  user: User;

  @Column({ type: 'bigint' })
  amount: bigint;

  @Column({ type: 'boolean', default: false })
  isClaimed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
