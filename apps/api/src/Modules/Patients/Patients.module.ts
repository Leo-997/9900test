import { Module } from '@nestjs/common';
import { PatientsClient } from 'Clients/Patient.client';
import { PatientsController } from 'Controllers/Patients.controller';
import { PatientsService } from 'Services/Patients.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsClient, PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
