import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, addMonths } from 'date-fns';
import { Repository } from 'typeorm';
import { Day } from './entities/day.entity';
import { Month } from './entities/month.entity';
import { Season } from './entities/season.entity';
import { Week } from './entities/week.entity';
@Injectable()
export class SeasonService {
  @InjectRepository(Week)
  private weekRepository: Repository<Week>;
  @InjectRepository(Month)
  private monthRepository: Repository<Month>;
  @InjectRepository(Day)
  private dayRepository: Repository<Day>;
  @InjectRepository(Season)
  private seasonRepository: Repository<Season>;
  constructor() {}

  async getCurrentDay(): Promise<Day> {
    const day = await this.dayRepository.findOne({
      where: { isActive: true },
      relations: ['month', 'week', 'season'],
    });
    return day;
  }
  async getCurrentSeason(): Promise<Season> {
    const season = await this.seasonRepository.findOne({
      where: { isActive: true },
    });
    return season;
  }
  async incrementDay() {
    const day = await this.dayRepository.findOne({
      where: { isActive: true },
      relations: ['month', 'week', 'season'],
    });
    let week = day.week;
    let month = day.month;
    let season = day.season;
    const date = new Date();
    const newDayDate = addDays(date, 1);
    console.dir({ day }, { depth: Infinity });
    await this.dayRepository.update(day.id, { isActive: false });
    if (day.number === 7) {
      await this.weekRepository.update(day.week.id, { isActive: false });
      const date = new Date();
      if (day.week.number === 4) {
        await this.monthRepository.update(day.month.id, { isActive: false });
        if (day.month.number === 3) {
          await this.seasonRepository.update(day.season.id, {
            isActive: false,
          });
          season = await this.seasonRepository.save({
            number: season.number + 1,
            isActive: true,
            initsAt: date,
            endsAt: addMonths(date, 3),
          });
        }

        const newMonthDay = addMonths(date, 1);
        console.log('here');
        month = await this.monthRepository.save({
          number: month.number === 3 ? 1 : month.number + 1,
          isActive: true,
          initsAt: date,
          endsAt: newMonthDay,
          season: {
            id: season.id,
          },
        });
      }
      const newWeekDate = addDays(date, 7);
      week = await this.weekRepository.save({
        number: day.week.number === 4 ? 1 : day.week.number + 1,
        isActive: true,
        initsAt: date,
        endsAt: newWeekDate,
        season: {
          id: season.id,
        },
        month: {
          id: month.id,
        },
      });
    }
    await this.dayRepository.save({
      number: day.number === 7 ? 1 : day.number + 1,
      isActive: true,
      initsAt: date,
      endsAt: newDayDate,
      month: {
        id: month.id,
      },
      week: {
        id: week.id,
      },
      season: {
        id: season.id,
      },
    });
  }
  async startSeason() {
    const season = await this.seasonRepository.save({
      initsAt: new Date(),
      endsAt: addMonths(new Date(), 3),
      isActive: true,
      number: 1,
    });
    const month = await this.monthRepository.save({
      number: 1,
      initsAt: new Date(),
      endsAt: addMonths(new Date(), 1),
      season: {
        id: season.id,
      },
      isActive: true,
    });
    const week = await this.weekRepository.save({
      number: 1,
      initsAt: new Date(),
      endsAt: addDays(new Date(), 7),
      season: {
        id: season.id,
      },
      month: {
        id: month.id,
      },
      isActive: true,
    });
    await this.dayRepository.save({
      number: 1,
      initsAt: new Date(),
      endsAt: addDays(new Date(), 1),
      season: {
        id: season.id,
      },
      month: {
        id: month.id,
      },
      week: {
        id: week.id,
      },
      isActive: true,
    });
    return true;
  }
}
