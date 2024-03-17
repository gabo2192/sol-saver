import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { InitStakeEntryDto } from './dtos/init-stake-entry.dto';
import { StakeDto } from './dtos/stake.dto';
import { UsersService } from './users.service';
import { IRequest } from './interfaces/common';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('init-stake-entry')
  async create(@Req() req: IRequest, @Body() stakeEntry: InitStakeEntryDto) {
    const pubkey = req.pubkey;
    const payload = { ...stakeEntry, pubkey };
    return this.userService.initStakeEntry(payload);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('stake')
  async stake(@Req() req: IRequest, @Body() stake: StakeDto) {
    const pubkey = req.pubkey;
    const payload = { ...stake, pubkey };
    return this.userService.stake(payload);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('unstake')
  async unstake(@Req() req: IRequest) {
    const pubkey = req.pubkey;
    return this.userService.unstake({ pubkey });
  }
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  async getUserByPublicKey(@Req() req: IRequest) {
    const pubkey = req.pubkey;
    return this.userService.getUserByPublicKey(pubkey);
  }
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('claim-prize')
  async claimPrize(
    @Req() req: IRequest,
    @Body() { prizeId }: { prizeId: number },
  ) {
    const pubkey = req.pubkey;
    console.log({ pubkey, prizeId });
    return this.userService.claimPrize(pubkey, prizeId);
  }
}
