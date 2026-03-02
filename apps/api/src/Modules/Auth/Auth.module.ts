import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AnalysisSetsModule } from 'Modules/Analysis/AnalysisSets.module';
import { UsersModule } from 'Modules/Users/Users.module';
import { AuthService } from 'Services/Auth/Auth.service';
import { HTTPBearerStrategy } from 'Services/Auth/Strategies/HTTPBearer.strategy';

@Module({
  imports: [
    HttpModule,
    UsersModule,
    forwardRef(() => AnalysisSetsModule),
    PassportModule.register({ defaultStrategy: ['http-bearer'] }),
  ],
  providers: [AuthService, HTTPBearerStrategy],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
