import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { InitStakeEntryDto } from './dtos/init-stake-entry.dto';
import { StakeDto } from './dtos/stake.dto';
import { UnstakeDto } from './dtos/unstake.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('init-stake-entry')
  async create(@Body() stakeEntry: InitStakeEntryDto) {
    await this.userService.initStakeEntry(stakeEntry);
    return;
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('stake')
  async stake(@Body() stake: StakeDto) {
    return this.userService.stake(stake);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('unstake')
  async unstake(@Body() unstake: UnstakeDto) {
    return this.userService.unstake(unstake);
  }
}
