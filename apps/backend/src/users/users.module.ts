import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from 'src/admin/admin.module';
import { SolanaModule } from 'src/solana/solana.module';
import { UserStake } from './entities/user-stake.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    AdminModule,
    SolanaModule,
    TypeOrmModule.forFeature([User, UserStake]),
    JwtModule.register({
      global: true,
      secret: process.env.NEXTAUTH_SECRET,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
