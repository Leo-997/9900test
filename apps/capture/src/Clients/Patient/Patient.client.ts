import { Inject, Injectable } from '@nestjs/common';
import { eventsOfInterest } from 'Constants/Patient.constant';
import { Knex } from 'knex';
import {
  IConfirmedDiagnosis,
  ILog,
  IPatientEvents,
  ISubjectConsent,
  ISubjectRegistration,
} from 'Models/ClinicalOne/ClinicalOne.model';
import { IC1Data, IDataElement, IFormAssociations } from 'Models/ClinicalOne/V1ClinicalOne.model';
import {
  IConfirmedDiagnosisResp, IEvent, IPatientDemographics, IRemainingPatient, PatientEvent,
} from 'Models/Patient/Patient.model';
import { IGetPatientDemographicsQuery } from 'Models/Patient/Requests/GetPatientDetails.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { ClinicalOneService } from 'Services/ClinicalOne/ClinicalOne.service';
import getHistologicDiagnosis from 'Utils/Helpers/getHistologicDiagnosis';
import { normalizeString } from 'Utils/string.util';

@Injectable()
export class PatientClient {
  constructor(
    @Inject(ClinicalOneService) private readonly clinicalOneService: ClinicalOneService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getRemainingPatient(
    patientId: string,
  ): Promise<IRemainingPatient | undefined> {
    return this.knex
      .select({
        patientId: 'c1_subjectNum',
        c1SubectId: 'c1_subjectId',
        c1NewSubectId: 'c1_new_subjectId',
        status: 'status',
      })
      .from('c1_subjects_remaining')
      .where('c1_subjectNum', patientId)
      .first();
  }

  private getAnswerFromData(
    data: IC1Data[],
    visitName: string,
    formName: string,
    questionLabel: string,
    repeatSequenceNumber?: number,
    otherValue?: string,
    otherQuestionLabel?: string,
  ): IDataElement {
    let baseValue = data.flatMap((d) => d.dataElements).find((e) => (
      e.questionLabel === questionLabel
      && e.formName === formName
      && e.visitName === visitName
      && (!repeatSequenceNumber || e.repeatSequenceNumber === repeatSequenceNumber)
    ));
    if (
      baseValue
      && otherValue
      && otherQuestionLabel
      && otherValue === baseValue.itemValue
    ) {
      baseValue = data.flatMap((d) => d.dataElements).find((e) => (
        e.questionLabel === otherQuestionLabel
        && e.formName === formName
        && e.visitName === visitName
        && (!repeatSequenceNumber || e.repeatSequenceNumber === repeatSequenceNumber)
      ));
    }

    return baseValue ? {
      ...baseValue,
      itemValue: !baseValue.itemValue && baseValue.dataFlagLabel
        ? baseValue.dataFlagLabel.replace('Flag: ', '')
        : baseValue.itemValue,
    } : baseValue;
  }

  private getEventsFromData(
    data: IC1Data[],
  ): IEvent[] {
    const maxRepeatNumber = Math.max(
      ...data
        .flatMap((d) => d.dataElements)
        .filter((e) => (
          e.visitName === 'Patient Events'
          && e.formName === 'Patient Events'
          && e.questionLabel === 'Patient event'
        ))
        .map((e) => e.repeatSequenceNumber)
        .filter((num) => !!num),
    );
    const events: IEvent[] = [];
    for (let i = 1; i <= maxRepeatNumber; i += 1) {
      const event = this.getAnswerFromData(
        data,
        'Patient Events',
        'Patient Events',
        'Patient event',
        i,
      )?.itemValue || '';
      if (eventsOfInterest.includes(event as PatientEvent)) {
        events.push({
          eventNumber: this.getAnswerFromData(
            data,
            'Patient Events',
            'Patient Events',
            'Patient event number',
            i,
          )?.itemValue || '',
          event: event as PatientEvent,
          date: this.getAnswerFromData(
            data,
            'Patient Events',
            'Patient Events',
            'Event date',
            i,
          )?.itemValue || '',
          otherClinicalScenarios: this.getAnswerFromData(
            data,
            'Patient Events',
            'Patient Events',
            'Specify other clinical scenario',
            i,
          )?.itemValue,
        });
      }
    }
    return events;
  }

  private getFormAssociation(
    data: IC1Data[],
    srcEventName: string,
    srcFormName: string,
    srcItemLabel: string,
    associatedEventName: string,
    associatedFormName: string,
    associatedRepeatSequenceNumber: number,
  ): IFormAssociations {
    return data
      .flatMap((d) => d.formsAssociations)
      .find((a) => (
        a.srcEventName === srcEventName
        && a.srcFormName === srcFormName
        && a.srcItemLabel === srcItemLabel
        && a.associatedEventName === associatedEventName
        && a.associatedFormName === associatedFormName
        && a.associatedRepeatSequenceNumber === associatedRepeatSequenceNumber
      ));
  }

  private getConsentFromData(
    data: IC1Data[],
  ): Pick<IPatientDemographics, 'category1Consent' | 'category2Consent'> {
    const repeatNumbers = new Set(data
      .flatMap((d) => d.dataElements)
      .filter((e) => (
        e.visitName === 'Consent'
          && e.formName === 'Consent'
          && e.questionLabel === 'Consent form'
      ))
      .map((e) => e.repeatSequenceNumber));

    for (const repeat of Array.from(repeatNumbers).sort((a, b) => (b - a))) {
      const form = this.getAnswerFromData(
        data,
        'Consent',
        'Consent',
        'Consent form',
        repeat,
      );
      if (form?.itemValue === 'Withdrawal of Participation') {
        const type = this.getAnswerFromData(
          data,
          'Consent',
          'Consent',
          'Type of withdrawal form',
          repeat,
        );
        if (type?.itemValue === 'Withdrawal from return of genetic cancer risk results') {
          const parentOrParticipant = this.getAnswerFromData(
            data,
            'Consent',
            'Consent',
            'Type of consent form (return of genetic cancer risk results withdrawal)',
            repeat,
          );
          if (parentOrParticipant.itemValue === 'Parent/Guardian') {
            const parts = this.getAnswerFromData(
              data,
              'Consent',
              'Consent',
              'Genetic Cancer Risk: Select which part(s) of the study the participant has been withdrawn from',
              repeat,
            );
            if (parts?.itemValue.includes('Disclosure of Category 2 Genetic Cancer Risk Results to the treating doctor and parent/guardian')) {
              return {
                category1Consent: true,
                category2Consent: false,
              };
            }
          } else if (parentOrParticipant.itemValue === 'Participant') {
            const parts = this.getAnswerFromData(
              data,
              'Consent',
              'Consent',
              'Genetic Cancer Risk (participant): Select which part(s) of the study the participant has withdrawn from',
              repeat,
            );
            if (parts?.itemValue.includes('Disclosure of genetic cancer risk results to the treating doctor and participant')) {
              return {
                category1Consent: false,
                category2Consent: false,
              };
            }
          }
        }
      } else if (form?.itemValue === 'Return of Genetic Cancer Risk Results Consent Form') {
        const parentOrParticipant = this.getAnswerFromData(
          data,
          'Consent',
          'Consent',
          'Type of consent form (Return of genetic cancer risk)',
          repeat,
        );
        if (parentOrParticipant.itemValue === 'Parent/Guardian') {
          const parts = this.getAnswerFromData(
            data,
            'Consent',
            'Consent',
            'Has the parent/guardian consented to the disclosure of Category 2 Genetic Cancer Risk Results found in the study to the treating doctor and themselves?',
            repeat,
          );
          if (parts?.itemValue === 'Yes, consented') {
            return {
              category1Consent: true,
              category2Consent: true,
            };
          }
          return {
            category1Consent: true,
            category2Consent: false,
          };
        } if (parentOrParticipant.itemValue === 'Participant') {
          const parts = this.getAnswerFromData(
            data,
            'Consent',
            'Consent',
            'Has the participant consented to the disclosure of genetic cancer risk results found in the study to the treating doctor and themselves?',
            repeat,
          );
          if (parts?.itemValue === 'Yes, consented') {
            return {
              category1Consent: true,
              category2Consent: true,
            };
          }
          return {
            category1Consent: false,
            category2Consent: false,
          };
        }
      }
    }
    return {
      category1Consent: false,
      category2Consent: false,
    };
  }

  public async getNewDemographics(
    patientId: string,
    filters: IGetPatientDemographicsQuery,
  ): Promise<IPatientDemographics | null> {
    try {
      const resp = await this.clinicalOneService.makeV2APICall({
        subject_number: patientId,
        visit_list: [
          'Registration',
          'General Patient Information Log',
          'Patient Events',
          'Confirmation of Diagnosis and Risk - Entered by Oncologist',
          'Consent',
        ],
      });

      const cdrfAssociation = filters.eventNumber
        ? this.getFormAssociation(
          resp.data,
          'Confirmation of Diagnosis and Risk - Entered by Oncologist',
          'Confirmation of Diagnosis and Risk - entered by Oncologist',
          'Select row that represents the appropriate event at this timepoint',
          'Patient Events',
          'Patient Events',
          filters.eventNumber,
        ) : undefined;

      const events = this.getEventsFromData(resp.data);
      const consent = this.getConsentFromData(resp.data);
      return {
        firstName: this.getAnswerFromData(
          resp.data,
          'Registration',
          'Patient Demographics',
          'First name',
        )?.itemValue || '',
        lastName: this.getAnswerFromData(
          resp.data,
          'Registration',
          'Patient Demographics',
          'Last name',
        )?.itemValue || '',
        dateOfBirth: this.getAnswerFromData(
          resp.data,
          'Registration',
          'Patient Demographics',
          'Date of birth',
        )?.itemValue || '',
        treatingOncologist: this.getAnswerFromData(
          resp.data,
          'General Patient Information Log',
          'Current hospital/clinician details',
          'Current treating oncologist',
          undefined,
          'Unlisted',
          'Name of current treating oncologist',
        )?.itemValue || '',
        site: this.getAnswerFromData(
          resp.data,
          'General Patient Information Log',
          'Current hospital/clinician details',
          'Current treating hospital',
          undefined,
          'Other',
          'Specify the current treating hospital',
        )?.itemValue || '',
        events,
        dateOfDeath: events.find((e) => e.event === 'Patient death (E)')?.date,
        pathologist: cdrfAssociation
          ? this.getAnswerFromData(
            resp.data,
            'Confirmation of Diagnosis and Risk - Entered by Oncologist',
            'Confirmation of Diagnosis and Risk - entered by Oncologist',
            'Reporting pathologist',
            cdrfAssociation.srcRepeatSequenceNumber,
            'Unlisted',
            'Name of reporting pathologist',
          )?.itemValue || null
          : undefined,
        histologicalDiagnosis: cdrfAssociation
          ? this.getAnswerFromData(
            resp.data,
            'Confirmation of Diagnosis and Risk - Entered by Oncologist',
            'Confirmation of Diagnosis and Risk - entered by Oncologist',
            'Pre-molecular histology or immunophenotype-based diagnosis',
            cdrfAssociation.srcRepeatSequenceNumber,
            'Unlisted',
            'Enter unlisted histology/diagnosis',
          )?.itemValue || null
          : undefined,
        ...consent,
      };
    } catch {
      return null;
    }
  }

  public async getPatientDemographics(
    patientId: string,
  ): Promise<IPatientDemographics | null> {
    const demographics = await this.clinicalOneService.makeAPICall<ISubjectRegistration>({
      patient: patientId,
      eventRequest: 'Registration',
    });

    if (
      demographics.content.length > 0
      && demographics.content[0].forms
      && demographics.content[0].forms['Patient Demographics']
    ) {
      const forms = Object.values(demographics.content[0].forms['Patient Demographics']);
      if (forms.length > 0) {
        const enrolmentOncologist = forms[0]['Enrolling oncologist'][0]?.label === 'Unlisted Clinician'
          ? forms[0]['Enrolling Oncologist is unlisted, please specify here']
          : forms[0]['Enrolling oncologist'][0]?.label;
        const treatingOncologist = forms[0]['Current treating oncologist'][0]?.label === 'Unlisted Clinician'
          ? forms[0]['Current treating Oncologist is unlisted, please specify here']
          : forms[0]['Current treating oncologist'][0]?.label;
        const site = forms[0]['Treating Hospital at registration'][0]?.label === 'Other'
          ? forms[0]['Other specify']
          : forms[0]['Treating Hospital at registration'][0]?.label;
        return {
          firstName: normalizeString(forms[0]['First Name']),
          lastName: normalizeString(forms[0]['Last Name']),
          dateOfBirth: normalizeString(forms[0].Age_SMARTITEM_02_DOB),
          enrolmentOncologist: normalizeString(enrolmentOncologist),
          treatingOncologist: normalizeString(
            treatingOncologist === 'Same as enrolling'
              ? enrolmentOncologist
              : treatingOncologist,
          ),
          site: normalizeString(site),
          dateOfEnrolment: normalizeString(demographics.content[0].visitDate),
        };
      }
    }

    return null;
  }

  public async getPatientEvents(
    patientId: string,
  ): Promise<IEvent[]> {
    const patientEvents = await this.clinicalOneService.makeAPICall<IPatientEvents>({
      patient: patientId,
      eventRequest: 'Patient Events',
    });

    const events: IEvent[] = [];
    if (
      patientEvents.content.length > 0
      && patientEvents.content[0].forms
      && patientEvents.content[0].forms['Patient Events']
    ) {
      const forms = Object.values(patientEvents.content[0].forms['Patient Events']);
      for (const form of forms) {
        const event = form['Patient Event :'][0];

        if (event && eventsOfInterest.includes(event.label as PatientEvent)) {
          events.push({
            eventNumber: normalizeString(form['Event number'][0].label),
            event: normalizeString(event.label) as PatientEvent,
            date: normalizeString(form['Event date']),
            otherClinicalScenarios: normalizeString(form['Other clinical scenarios, please specify']),
          });
        }
      }
    }

    return events;
  }

  public async getPatientGermlineConsent(
    patientId: string,
  ): Promise<boolean | null> {
    const subjectConsent = await this.clinicalOneService.makeAPICall<ISubjectConsent>({
      patient: patientId,
      eventRequest: 'Consent',
    });

    if (
      subjectConsent.content.length > 0
      && subjectConsent.content[0].forms
      && subjectConsent.content[0].forms.Consent
    ) {
      const forms = Object.values(subjectConsent.content[0].forms.Consent);
      for (const form of forms.reverse()) {
        const consentType = form['Consent Type'][0]?.label || '';
        if (consentType === 'Germline Return of Results') {
          const withdrawals = form['Withdrawal from (please tick all that apply)'];
          if (withdrawals && Array.isArray(withdrawals) && withdrawals.map((w) => w.label).includes('Disclosure of germline findings')) {
            return false;
          }
          const consent = form['Consent to the disclosure of Germline findings'][0]?.label || '';
          return consent === 'Yes';
        }
      }
    }

    return null;
  }

  public async getPathologistDiagnosis(
    patientId: string,
    filters: IGetPatientDemographicsQuery,
  ): Promise<IConfirmedDiagnosisResp> {
    const formName = 'Confirmation of Diagnosis and Risk - entered by Oncologist';
    const confirmedDiag = await this.clinicalOneService.makeAPICall<IConfirmedDiagnosis>({
      patient: patientId,
      eventRequest: 'Confirmation of Diagnosis and Risk - entered by Oncologist',
    });

    if (
      confirmedDiag.content.length > 0
      && confirmedDiag.content[0].forms
      && confirmedDiag.content[0].forms[formName]
    ) {
      const forms = Object.values(confirmedDiag.content[0].forms[formName]);
      if (filters.eventNumber !== undefined) {
        for (const form of forms) {
          if (form.associatedForms.map((a) => parseInt(a, 10)).includes(filters.eventNumber)) {
            const pathologistRaw = form['Reporting pathologist'];
            const pathologist = typeof pathologistRaw === 'string'
              ? pathologistRaw
              : pathologistRaw[0]?.label || '';
            return {
              pathologist: normalizeString(
                pathologist === 'Unlisted pathologist' || pathologist === 'Unlisted'
                  ? form['Reporting pathologist is unlisted, please enter name']
                  : pathologist,
              ),
              histologicalDiagnosis: normalizeString(getHistologicDiagnosis(form)),
            };
          }
        }
      }

      return {
        pathologist: null,
        histologicalDiagnosis: null,
      };
    }

    return null;
  }

  public async getLogForm(
    patientId: string,
  ): Promise<Pick<IPatientDemographics, 'treatingOncologist' | 'site'>> {
    const log = await this.clinicalOneService.makeAPICall<ILog>({
      patient: patientId,
      eventRequest: 'LOG',
    });

    if (
      log.content.length > 0
      && log.content[0].forms
      && log.content[0].forms['Contact Details']
    ) {
      const forms = Object.values(log.content[0].forms['Contact Details']);
      const latestForm = forms[forms.length - 1];
      const treatingOncologist = latestForm['Treating Clinician'][0]?.label || '';
      const site = latestForm['Treating Hospital'][0]?.label === 'Other'
        ? latestForm['Other Hospital, specify']
        : latestForm['Treating Hospital'][0]?.label;
      return {
        treatingOncologist: normalizeString(
          treatingOncologist === 'Unlisted Clinician'
            ? latestForm['Enter Treating Clinician name, if not in drop down']
            : treatingOncologist,
        ),
        site: normalizeString(site || ''),
      };
    }

    return null;
  }
}
