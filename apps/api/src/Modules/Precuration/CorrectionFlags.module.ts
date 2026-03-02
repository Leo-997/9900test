import { Module } from '@nestjs/common';

import { CorrectionFlagsClient } from 'Clients/Precuration/CorrectionFlags.client';
import { CorrectionFlagsController } from 'Controllers/Precuration/CorrectionFlags.controller';
import { AnalysisSetsModule } from 'Modules/Analysis/AnalysisSets.module';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { NotificationsModule } from 'Modules/Notifications/Notifications.module';
import { CorrectionFlagsService } from 'Services/Precuration/CorrectionFlags.service';

@Module({
  imports: [
    AnalysisSetsModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [CorrectionFlagsController],
  providers: [CorrectionFlagsClient, CorrectionFlagsService],
})
export class CorrectionFlagsModule {}
