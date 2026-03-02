import {
  Controller, Get, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IPatientDemographics } from 'Models/Patient/Patient.model';
import { PatientService } from 'Services/Patient/Patient.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/patient/:patientId')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  @Get('demographics')
  async getPatientClinicalData(
  // @Param('patientId') patientId: string,
  // @Query() filters: GetPatientDemographicsQueryDTO,
  ): Promise<IPatientDemographics> {
    return {
      firstName: 'Bruce',
      lastName: 'Wayne',
      dateOfBirth: '03-Mar-2020',
      treatingOncologist: 'Alfred Pennyworth',
      site: 'Starship Hospital',
      events: [{ eventNumber: '1', event: 'Diagnosis of cancer/non-cancer condition (D)', date: '22-Mar-2024' }, { eventNumber: '1', event: 'Relapse (R)', date: '' }, { eventNumber: '1', event: 'Disease progression (P)', date: '21-Oct-2024' }, {
        eventNumber: '1', event: 'Other clinical scenario (O)', date: '19-Nov-2024', otherClinicalScenarios: 'Primary refractory',
      }],
      pathologist: 'John Bishop',
      histologicalDiagnosis: 'Cancer',
      category1Consent: true,
      category2Consent: false,
    };
  }

  @Get('consent')
  async getPatientConsent(
  // @Param('patientId') patientId: string,
  ): Promise<Pick<IPatientDemographics, 'germlineConsent' | 'category1Consent' | 'category2Consent'>> {
    return {
      category1Consent: true,
      category2Consent: false,
    };
  }
}
