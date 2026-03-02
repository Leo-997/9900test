import { Module } from '@nestjs/common';
import { MeetingsClient } from 'Clients/Meetings/Meetings.client';
import { MeetingsController } from 'Controllers/Meetings/Meetings.controller';
import { AnalysisSetsModule } from 'Modules/Analysis/AnalysisSets.module';
import { MeetingsService } from 'Services/Meetings.service';

@Module({
  imports: [
    AnalysisSetsModule,
  ],
  controllers: [MeetingsController],
  providers: [MeetingsClient, MeetingsService],
  exports: [MeetingsClient, MeetingsService],
})
export class MeetingsModule {}
