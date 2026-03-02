import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { AuthService } from 'Services/Auth/Auth.service';
import { HTTPBearerStrategy } from 'Services/Auth/Strategies/HTTPBearer.strategy';
import { SampleModule } from '../Sample/Sample.module';
import { UserModule } from '../User/User.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: ['http-bearer'] }),
    UserModule,
    HttpModule,
    forwardRef(() => SampleModule),
  ],
  providers: [HTTPBearerStrategy, AuthService, AccessControlService],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
