import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AnalysisSetsClient } from 'Clients/Analysis/AnalysisSets.client';
import { AnalysisSetsController } from 'Controllers/Analysis/AnalysisSets.controller';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { NotificationsModule } from 'Modules/Notifications/Notifications.module';
import { AnalysisSetsService } from 'Services/Analysis/AnalysisSets.service';
import { BiosamplesModule } from './Biosamples.module';

@Module({
  imports: [BiosamplesModule, HttpModule, NotificationsModule, forwardRef(() => AuthModule)],
  exports: [AnalysisSetsService],
  controllers: [AnalysisSetsController],
  providers: [AnalysisSetsService, AnalysisSetsClient],
})
export class AnalysisSetsModule {}
