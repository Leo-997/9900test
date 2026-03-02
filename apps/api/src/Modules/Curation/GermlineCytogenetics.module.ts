import { Module } from '@nestjs/common';

import { CytogeneticsClient } from 'Clients/Curation/Cytogenetics/Cytogenetics.client';
import { GermlineCytogeneticsController } from 'Controllers/Curation/Cytogenetics/GermlineCytogenetics.controller';
import { Knex } from 'knex';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { CytogeneticsService } from 'Services/Curation/Cytogenetics/Cytogenetics.service';

@Module({
  imports: [AuthModule],
  controllers: [GermlineCytogeneticsController],
  providers: [
    {
      provide: CytogeneticsClient,
      useFactory: (knex: Knex): CytogeneticsClient => new CytogeneticsClient(knex, 'germline'),
      inject: [KNEX_CONNECTION],
    },
    CytogeneticsService],
})
export class GermlineCytogeneticsModule {}
