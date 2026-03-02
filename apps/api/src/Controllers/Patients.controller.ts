import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { AccessiblePatientQueryDTO, IAccessiblePatient } from 'Models/AccessControl/AccessControl.model';
import { IPatient, UpdatePatientBodyDTO } from 'Models/Patient/Patient.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { PatientsService } from 'Services/Patients.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientService: PatientsService,
  ) {}

  @Get('accessible')
  async getAccessiblePatients(
    @Query() query: AccessiblePatientQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAccessiblePatient[]> {
    return this.patientService.getAccessiblePatients(user, query);
  }

  @Get(':patientId')
  @Scopes('curation.sample.read')
  async getPatientById(
    @Param('patientId') patientId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPatient> {
    const patient = await this.patientService.getPatientById(patientId, user);

    if (!patient) {
      throw new NotFoundException('Could not find requested patient');
    }

    return patient;
  }

  @Patch(':patientId')
  @Scopes('curation.patient.write')
  @IsWriteEndpoint()
  async updatePatientById(
    @Param('patientId') patientId: string,
    @Body() body: UpdatePatientBodyDTO,
  ): Promise<void> {
    return this.patientService.updatePatientById(patientId, body);
  }
}
