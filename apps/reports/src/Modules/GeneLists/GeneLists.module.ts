import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeneListsClient } from 'Clients/GeneLists/GeneLists.client';
import { GeneListsController } from 'Controllers/GeneLists/GeneLists.controller';
import { GeneListsService } from 'Services/GeneLists/GeneLists.service';

@Module({
  imports: [HttpModule],
  controllers: [GeneListsController],
  providers: [GeneListsService, GeneListsClient],
  exports: [],
})
export class GeneListsModule {}
