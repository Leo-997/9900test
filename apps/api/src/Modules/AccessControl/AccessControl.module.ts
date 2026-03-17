import { Global, Module } from '@nestjs/common';
import { PatientsModule } from 'Modules/Patients/Patients.module';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';

@Global()
@Module({
  imports: [PatientsModule],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
