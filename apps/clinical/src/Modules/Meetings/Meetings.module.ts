import { forwardRef, Module } from '@nestjs/common';
import { MeetingsClient } from '../../Clients';
import { MeetingsController } from '../../Controllers';
import { MeetingsService } from '../../Services';
import { SampleModule } from '../Sample/Sample.module';

@Module({
  imports: [forwardRef(() => SampleModule)],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsClient],
  exports: [MeetingsService],
})

export class MeetingsModule {}
