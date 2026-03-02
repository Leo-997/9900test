import { Module } from '@nestjs/common';
import { ReportableVariantsClient } from 'Clients/ReportableVariants/ReportableVariants.client';
import { ReportableVariantsController } from 'Controllers/Curation/ReportableVariants/ReportableVariants.controller';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { ReportableVariantsService } from 'Services/ReportableVariants/ReportableVariants.service';

@Module({
  imports: [AuthModule],
  controllers: [ReportableVariantsController],
  providers: [ReportableVariantsClient, ReportableVariantsService],
  exports: [ReportableVariantsService],
})
export class ReportableVariantsModule {}
