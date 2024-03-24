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
import { AuthRequest } from 'src/auth/interfaces/AuthRequest.interface';
import { InitStakeEntryDto } from './dtos/init-stake-entry.dto';
import { StakeDto } from './dtos/stake.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('init-stake-entry')
  async create(
    @Req() request: AuthRequest,
    @Body() stakeEntry: InitStakeEntryDto,
  ) {
    return this.userService.initStakeEntry({
      ...stakeEntry,
      pubkey: request.pubkey,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('stake')
  async stake(@Req() { pubkey }: AuthRequest, @Body() stake: StakeDto) {
    return this.userService.stake({ ...stake, pubkey });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('unstake')
  async unstake(@Req() { pubkey }: AuthRequest) {
    return this.userService.unstake({ pubkey });
  }
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getUserByPublicKey(@Req() { pubkey }: AuthRequest) {
    return this.userService.getUserByPublicKey(pubkey);
  }
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('claim-prize')
  async claimPrize(
    @Req() { pubkey }: AuthRequest,
    @Body() { prizeId }: { prizeId: number },
  ) {
    return this.userService.claimPrize(pubkey, prizeId);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('airdrop')
  async airdrop(
    @Req() { pubkey }: AuthRequest,
    @Body() { mint }: { mint: string },
  ) {
    return this.userService.airdrop(pubkey, mint);
  }
}
