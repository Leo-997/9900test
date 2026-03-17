import { forwardRef, Module } from '@nestjs/common';
import { ReportsClient } from 'Clients/Reports/Reports.client';
import { ReportsController } from 'Controllers/Reports/Reports.controller';
import { ReportsService } from 'Services/Reports/Reports.service';
import { ReportsResolver } from 'Resolvers/Reports/Reports.resolver';
import { ApprovalsModule } from '../Approvals/Approvals.module';

@Module({
  imports: [forwardRef(() => ApprovalsModule)],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsClient, ReportsResolver],
  exports: [ReportsService],
})
export class ReportsModule {}
