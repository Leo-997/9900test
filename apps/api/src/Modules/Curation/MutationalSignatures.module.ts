import { Module } from '@nestjs/common';

import { MutationalSignaturesController } from 'Controllers/Curation/MutationalSignatures/MutationalSignatures.controller';
import { MutationalSignaturesClient } from 'Clients/Curation/MutationalSignatures/MutationalSignatures.client';
import { MutationalSignaturesService } from 'Services/Curation/MutationalSignatures/MutationalSignatures.service';
import { AuthModule } from 'Modules/Auth/Auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MutationalSignaturesController],
  providers: [MutationalSignaturesClient, MutationalSignaturesService],
})
export class MutationalSignaturesModule {}
