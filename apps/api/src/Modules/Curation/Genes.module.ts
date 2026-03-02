import { Module } from '@nestjs/common';

import { GenesController } from 'Controllers/Curation/Genes/Genes.controller';
import { GenesClient } from 'Clients/Curation/Genes/Genes.client';
import { GenesService } from 'Services/Curation/Genes/Genes.service';

@Module({
  controllers: [GenesController],
  providers: [GenesClient, GenesService],
  exports: [GenesService],
})
export class GenesModule {}
