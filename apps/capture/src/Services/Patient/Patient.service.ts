import { Injectable } from '@nestjs/common';
import { PatientClient } from 'Clients/Patient/Patient.client';
import { IConfirmedDiagnosisResp, IPatientDemographics } from 'Models/Patient/Patient.model';
import { IGetPatientDemographicsQuery } from 'Models/Patient/Requests/GetPatientDetails.model';

@Injectable()
export class PatientService {
  constructor(
    private readonly patientClient: PatientClient,
  ) {}

  public async getNewDemographics(
    patientId: string,
    filters: IGetPatientDemographicsQuery,
  ): Promise<IPatientDemographics | null> {
    return this.patientClient.getNewDemographics(
      patientId,
      filters,
    );
  }

  public async getPatientDemographics(
    inputPatientId: string,
    filters: IGetPatientDemographicsQuery,
  ): Promise<IPatientDemographics> {
    const patientId = process.env.C1_HARDCODED_PATIENT || inputPatientId;
    const eventNumber = Number(process.env.C1_HARDCODED_EVENT) || filters.eventNumber;
    const remainingPatient = await this.patientClient.getRemainingPatient(patientId);
    if (remainingPatient && remainingPatient?.status !== 'Moved') {
      return this.getPatientClinicalData(patientId, { eventNumber });
    }
    return this.getNewDemographics(patientId, { eventNumber });
  }

  public async getPatientClinicalData(
    patientId: string,
    filters: IGetPatientDemographicsQuery,
  ): Promise<IPatientDemographics> {
    let demographics: IPatientDemographics = null;
    try {
      let demographicsBase: IPatientDemographics = null;
      let pathologistDiagnosis: IConfirmedDiagnosisResp = {};
      let events = [];
      let germlineConsent = false;
      let logData: Pick<IPatientDemographics, 'treatingOncologist' | 'site'> = null;
      await Promise.all([
        this.patientClient.getPatientDemographics(patientId)
          .then((resp) => { demographicsBase = resp; }),
        this.patientClient.getPatientEvents(patientId)
          .then((resp) => { events = resp; }),
        this.patientClient.getPathologistDiagnosis(
          patientId,
          filters,
        )
          .then((resp) => { pathologistDiagnosis = resp; }),
        this.patientClient.getPatientGermlineConsent(patientId)
          .then((resp) => { germlineConsent = resp; }),
        this.patientClient.getLogForm(patientId)
          .then((resp) => { logData = resp; }),
      ]);

      demographics = demographicsBase ? {
        ...demographicsBase,
        treatingOncologist: logData?.treatingOncologist
          ? logData.treatingOncologist
          : demographicsBase.treatingOncologist,
        site: logData?.site
          ? logData.site
          : demographicsBase.site,
        dateOfDeath: events.find((e) => e.event === 'Patient death (E)')?.date,
        events: events.filter((e) => e.event !== 'Patient death (E)'),
        germlineConsent,
        ...pathologistDiagnosis,
      } : null;
    } catch (error) {
      /* unable to connect to C1 */
      console.error(error);
    }

    return demographics;
  }

  public async getPatientConsent(
    inputPatientId: string,
  ): Promise<Pick<IPatientDemographics, 'germlineConsent' | 'category1Consent' | 'category2Consent'>> {
    const patientId = process.env.C1_HARDCODED_PATIENT || inputPatientId;
    let consent: Pick<IPatientDemographics, 'germlineConsent' | 'category1Consent' | 'category2Consent'> = null;
    try {
      const remainingPatient = await this.patientClient.getRemainingPatient(patientId);
      if (remainingPatient && remainingPatient?.status !== 'Moved') {
        const germlineConsent = await this.patientClient.getPatientGermlineConsent(patientId);
        consent = {
          germlineConsent,
        };
      } else {
        const demographics = await this.getNewDemographics(patientId, {});
        consent = {
          category1Consent: demographics.category1Consent,
          category2Consent: demographics.category2Consent,
        };
      }
    } catch (error) {
      /* unable to connect to C1 */
      console.error(error);
    }

    return consent;
  }
}
