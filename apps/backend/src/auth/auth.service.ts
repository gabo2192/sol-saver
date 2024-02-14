import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SigninMessage } from '../../utils/sign-in-message';
import { SignInDto } from './dtos/signin';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn({ message, signature, csrfToken }: SignInDto) {
    console.log({ message, signature, csrfToken });
    const signinMessage = new SigninMessage(JSON.parse(message || '{}'));
    console.log({ signinMessage });
    const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
    if (signinMessage.domain !== nextAuthUrl.host) {
      return null;
    }
    if (signinMessage.nonce !== csrfToken) {
      return null;
    }
    const validationResult = await signinMessage.validate(signature || '');
    if (!validationResult)
      throw new Error('Could not validate the signed message');
    const user = await this.usersService.getUser(signinMessage.publicKey);
    if (!user) {
      await this.usersService.createUser(signinMessage.publicKey);
    }
    return { id: signinMessage.publicKey };
  }
}
