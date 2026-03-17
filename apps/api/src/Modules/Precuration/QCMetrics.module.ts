import { Module } from '@nestjs/common';
import { QCDataController } from 'Controllers/Precuration/QCMetrics/QCData.controller';
import { PlotsController } from 'Controllers/Plots.controller';
import { QCDataClient } from 'Clients/Precuration/QCMetrics/QCData.client';
import { QCDataService } from 'Services/Precuration/QCMetrics/QCData.service';
import { FileTrackerModule } from 'Modules/FileTracker/FileTracker.module';
import { PlotsModule } from 'Modules/Plots/Plots.module';
import { AuthModule } from 'Modules/Auth/Auth.module';

@Module({
  imports: [
    FileTrackerModule,
    PlotsModule,
    AuthModule,
  ],
  controllers: [PlotsController, QCDataController],
  providers: [
    QCDataClient,
    QCDataService,
  ],
})
export class QCMetricsModule {}
