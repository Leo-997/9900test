import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from 'Services/Auth/Auth.service';
import { HTTPBearerStrategy } from 'Services/Auth/Strategies/HTTPBearer.strategy';
import { UserModule } from '../User/User.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: ['http-bearer'] }),
    UserModule,
    HttpModule,
  ],
  providers: [HTTPBearerStrategy, AuthService],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
