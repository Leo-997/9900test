import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from '../Auth.service';

@Injectable()
export class HTTPBearerStrategy extends PassportStrategy(Strategy, 'http-bearer') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<any> {
    try {
      const user = await this.authService.findUser(token);

      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
