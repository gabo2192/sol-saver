import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './entities/ranking.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
  ) {}

  async insertRanking({
    userId,
    points,
    type,
    seasonId,
  }: {
    userId: string;
    points: number;
    type:
      | 'first_deposit'
      | 'first_week'
      | 'first_month'
      | 'complete season'
      | 'balance';
    seasonId: number;
  }) {
    return this.rankingRepository.save({
      user: {
        id: userId,
      },
      points,
      type,
      season: {
        id: seasonId,
      },
    });
  }
}
