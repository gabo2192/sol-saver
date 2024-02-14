import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signin';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() { message, signature, csrfToken }: SignInDto) {
    return this.authService.signIn({ message, signature, csrfToken });
  }
}
