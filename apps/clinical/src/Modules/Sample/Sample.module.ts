import { Module, forwardRef } from '@nestjs/common';
import { SampleClient } from 'Clients';
import { ReviewerClient } from 'Clients/Reviewer/Reviewer.client';
import { SlideTableSettingsClient } from 'Clients/Settings/SlideTable/SlideTableSettings.client';
import { SampleController } from 'Controllers';
import { SampleService } from 'Services';
import { ReviewerService } from 'Services/Reviewer/Reviewer.service';
import { AddendumModule } from '../Addendum/Addendum.module';
import { AuthModule } from '../Auth/Auth.module';
import { MeetingsModule } from '../Meetings/Meetings.module';
import { MolecularAlterationsModule } from '../MolecularAlterations/MolecularAlterations.module';
import { NotificationsModule } from '../Notifications/Notifications.module';
import { UserModule } from '../User/User.module';

@Module({
  imports: [
    AddendumModule,
    MolecularAlterationsModule,
    UserModule,
    NotificationsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MeetingsModule),
  ],
  controllers: [SampleController],
  providers: [
    SampleService,
    SampleClient,
    ReviewerService,
    ReviewerClient,
    SlideTableSettingsClient,
  ],
  exports: [SampleService],
})
export class SampleModule {}
