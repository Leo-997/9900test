import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TrialsClient } from 'Clients/Trials/Trials.client';
import { TrialsService } from 'Services/Trials/Trials.service';
import { AuthModule } from '../Auth/Auth.module';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [],
  providers: [TrialsService, TrialsClient],
  exports: [TrialsService],
})
export class TrialsModule {}
