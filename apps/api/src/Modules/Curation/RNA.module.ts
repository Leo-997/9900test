import { Module } from '@nestjs/common';
import { RnaController } from 'Controllers/Curation/RNA/RNA.controller';
import { RnaClassifiersController } from 'Controllers/Curation/RNA/RnaClassifiers.controller';
import { PlotsController } from 'Controllers/Plots.controller';
import { RnaService } from 'Services/Curation/RNA/RNA.service';
import { SeqRnaClient } from 'Clients/Curation/RNA/RNA.client';
import { PlotsModule } from 'Modules/Plots/Plots.module';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PlotsModule,
    AuthModule,
    HttpModule,
  ],
  controllers: [RnaController, RnaClassifiersController, PlotsController],
  providers: [
    SeqRnaClient,
    RnaService,
  ],
})
export class RnaModule {}
