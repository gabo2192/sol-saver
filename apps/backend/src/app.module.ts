import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SolanaModule } from './solana/solana.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'gabrielrojas',
      password: 'fuckko21',
      database: 'sol-saver',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AdminModule,
    AuthModule,
    UsersModule,
    SolanaModule,
  ],
})
export class AppModule {}
