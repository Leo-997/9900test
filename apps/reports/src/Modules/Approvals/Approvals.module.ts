import { forwardRef, Module } from '@nestjs/common';
import { ApprovalsClient } from 'Clients/Approvals/Approvals.client';
import { ApprovalsController } from 'Controllers/Approvals/Approvals.controller';
import { ApprovalsService } from 'Services/Approvals/Approvals.service';
import { ApprovalsResolver } from 'Resolvers/Approvals/Approvals.resolver';
import { NotificationsModule } from '../Notifications/Notifications.module';
import { ReportsModule } from '../Reports/Reports.module';
import { UserModule } from '../User/User.module';

@Module({
  imports: [
    forwardRef(() => ReportsModule),
    NotificationsModule,
    UserModule,
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, ApprovalsClient, ApprovalsResolver],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
