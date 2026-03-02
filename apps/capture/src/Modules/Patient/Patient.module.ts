import { Module } from '@nestjs/common';
import { PatientClient } from 'Clients/Patient/Patient.client';
import { PatientController } from 'Controllers/Patient/Patient.controller';
import { PatientService } from 'Services/Patient/Patient.service';
import { ClinicalOneModule } from '../ClinicalOne/ClinicalOne.module';

@Module({
  imports: [ClinicalOneModule],
  controllers: [PatientController],
  providers: [PatientService, PatientClient],
  exports: [PatientService],
})
export class PatientModule {}
