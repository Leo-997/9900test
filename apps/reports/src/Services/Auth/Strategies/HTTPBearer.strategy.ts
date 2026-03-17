import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from '../Auth.service';

@Injectable()
export class HTTPBearerStrategy extends PassportStrategy(Strategy, 'http-bearer') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<any> {
    const user = await this.authService.findUser(token);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
