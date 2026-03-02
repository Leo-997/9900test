import { Module } from '@nestjs/common';

import { PathwaysCurationController } from 'Controllers/Curation/Pathways/Pathways.controller';
import { PathwaysCurationClient } from 'Clients/Curation/Pathways/Pathways.client';
import { PathwaysCurationService } from 'Services/Curation/Pathways/Pathways.service';

@Module({
  controllers: [PathwaysCurationController],
  providers: [PathwaysCurationClient, PathwaysCurationService],
})
export class PathwaysCurationModule {}
