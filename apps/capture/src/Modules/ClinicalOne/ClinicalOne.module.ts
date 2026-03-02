import { Module } from '@nestjs/common';
import { ClinicalOneClient } from 'Clients/ClinicalOne/ClinicalOne.client';
import { ClinicalOneService } from 'Services/ClinicalOne/ClinicalOne.service';

@Module({
  providers: [ClinicalOneService, ClinicalOneClient],
  exports: [ClinicalOneService],
})
export class ClinicalOneModule {}
