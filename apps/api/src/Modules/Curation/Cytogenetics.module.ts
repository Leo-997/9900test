import { Module } from '@nestjs/common';

import { CytogeneticsClient } from 'Clients/Curation/Cytogenetics/Cytogenetics.client';
import { CytogeneticsController } from 'Controllers/Curation/Cytogenetics/Cytogenetics.controller';
import { Knex } from 'knex';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { CytogeneticsService } from 'Services/Curation/Cytogenetics/Cytogenetics.service';

@Module({
  imports: [AuthModule],
  controllers: [CytogeneticsController],
  providers: [
    {
      provide: CytogeneticsClient,
      useFactory: (knex: Knex): CytogeneticsClient => new CytogeneticsClient(knex, 'somatic'),
      inject: [KNEX_CONNECTION],
    },
    CytogeneticsService],
})
export class CytogeneticsModule {}
