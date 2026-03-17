import { Module } from '@nestjs/common';

import { MethylationClient } from 'Clients/Curation/Methylation/Methylation.client';
import { MethylationController } from 'Controllers/Curation/Methylation/Methylation.controller';
import { MethylationClassifiersController } from 'Controllers/Curation/Methylation/MethylationClassifiers.controller';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { MethylationService } from 'Services/Curation/Methylation/Methylation.service';

@Module({
  imports: [AuthModule],
  controllers: [MethylationController, MethylationClassifiersController],
  providers: [MethylationClient, MethylationService],
})
export class MethylationModule {}
