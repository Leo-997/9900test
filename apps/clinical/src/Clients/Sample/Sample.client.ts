import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  ISampleData,
  ISampleFilters,
  IUpdateClinicalVersionData,
  IUser,
  IUserWithMetadata,
  ReviewerBodyDTO,
  UpdateReviewDTO,
} from 'Models';
import {
  IClinicalVersion,
  IReviewerData,
} from 'Models/ClinicalVersion/ClinicalVersion.model';
import { Group } from 'Models/Group/Group.model';
import { MeetingType } from 'Models/Meetings/Meetings.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withClinicalVersion } from 'Utils/Query/accessControl/withClinicalVersions.util';

@Injectable()
export class SampleClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private reviewTable = 'zcc_clinical_reviewer';

  private clinicalVersionTable = 'zcc_clinical_versions';

  private meetingsTable = 'zcc_clinical_meetings';

  private meetingVersionXrefTable = 'zcc_clinical_meeting_version_xref';

  public async getClinicalVersion(
    user: IUserWithMetadata,
    versionId?: string,
    analysisSetId?: string,
    checkWrite = false,
  ): Promise<IClinicalVersion> {
    return this.knex
      .select({
        id: 'version.id',
        version: 'version.version',
        analysisSetId: 'version.analysis_set_id',
        patientId: 'version.patient_id',
        status: 'version.status',
        pseudoStatus: 'version.pseudo_status',
        patientAgeAtDeath: 'version.patient_age_at_death',
        vitalStatus: 'version.patient_vital_status',
        clinicalHistory: 'version.clinical_history',
        expedite: 'version.expedite',
        frequencyUnits: 'version.frequency_units',
        cohort: 'version.cohort',
        histologicalDiagnosis: 'version.histological_diagnosis',
        zero2Category: 'version.zero2_category',
        zero2Subcat1: 'version.zero2_subcategory1',
        zero2Subcat2: 'version.zero2_subcategory2',
        zero2FinalDiagnosis: 'version.zero2_final_diagnosis',
        curatorId: 'version.curator_id',
        clinicianId: 'version.clinician_id',
        cancerGeneticistId: 'version.cancer_geneticist_id',
        discussionTitle: 'version.discussion_title',
        discussionNote: 'version.discussion_note',
        discussionColumns: 'version.discussion_columns',
        presentationModeScale: 'version.presentation_mode_scale',
      })
      .modify(withClinicalVersion, 'from', user, undefined, checkWrite)
      .modify(
        this.withMeeting,
        this.knex,
        this.meetingsTable,
        this.meetingVersionXrefTable,
      )
      .andWhere(function filter() {
        if (analysisSetId) {
          this.andWhere('version.analysis_set_id', analysisSetId);
        }
        if (versionId) {
          this.andWhere('version.id', versionId);
        }
      })
      .orderBy('version.version', 'desc')
      .first();
  }

  public async updateClinicalVersionData(
    clinicalVersionId: string,
    data: IUpdateClinicalVersionData,
    currentUser: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        status: data.status,
        pseudo_status: data.status ? null : data.pseudoStatus,
        clinical_history: data.clinicalHistory,
        expedite: data.expedite,
        is_germline_only: data.isGermlineOnly,
        frequency_units: data.frequencyUnits,
        clinician_id: data.clinicianId,
        curator_id: data.curatorId,
        cancer_geneticist_id: data.cancerGeneticistId,
        discussion_title: data.discussionTitle,
        discussion_note: data.discussionNote,
        discussion_columns: data.discussionColumns,
        presentation_mode_scale: data.presentationModeScale,
        slides_started_at: data.status === 'In Progress' ? this.knex.fn.now() : undefined,
        slides_finalised_at: data.status === 'Done' ? this.knex.fn.now() : undefined,
        updated_at: this.knex.fn.now(),
        updated_by: currentUser?.id,
      })
      .from(this.clinicalVersionTable)
      .where({ id: clinicalVersionId });
  }

  public async addReviewer(
    clinicalVersionId: string,
    {
      reviewerId,
      group,
    }: ReviewerBodyDTO,
    currentUser: IUser,
  ): Promise<void> {
    await this.knex
      .insert({
        clinical_version_id: clinicalVersionId,
        clinical_reviewer_id: reviewerId,
        role: group,
        status: 'Assigned',
        created_by: currentUser.id,
      })
      .into(this.reviewTable);
  }

  public async removeReviewer(
    clinicalVersionId: string,
    group: Group,
  ): Promise<void> {
    await this.knex
      .delete()
      .from(this.reviewTable)
      .where('clinical_version_id', clinicalVersionId)
      .andWhere('role', group);
  }

  public async updateReviewStatus(
    clinicalVersionId: string,
    {
      status,
      group,
    }: UpdateReviewDTO,
  ): Promise<void> {
    await this.knex(this.reviewTable)
      .update({
        status,
      })
      .where('clinical_version_id', clinicalVersionId)
      .andWhere('role', group);
  }

  public async getClinicalReviewers(
    clinicalVersionId?: string,
  ): Promise<IReviewerData[]> {
    return this.knex
      .select<IReviewerData[]>({
        reviewerId: 'a.clinical_reviewer_id',
        status: 'a.status',
        group: 'a.role',
      })
      .from({ a: 'zcc_clinical_reviewer' })
      .where('clinical_version_id', clinicalVersionId);
  }

  public async getClinicalRecords(
    filters: ISampleFilters,
    user: IUserWithMetadata,
  ): Promise<ISampleData[]> {
    const sortMapping = {

      'MTB Meeting Date': 'mtb_meeting.date',

      'HTS Meeting Date': 'hts_meeting.date',

      'Enrolment Date': 'patient.enrolment_date',

      'Patient ID': 'version.patient_id',
    };

    // sorting below ensures that null meeting are at the top
    // then newest to oldest after that
    const nullMeetingDateSort = {
      column: this.knex.raw(`
        CASE
          WHEN mtb_meeting.date IS NULL AND hts_meeting.date IS NULL THEN 1
          WHEN mtb_meeting.date IS NULL THEN 2
          WHEN hts_meeting.date IS NULL THEN 3
          ELSE 4
        END
      `),
      order: 'asc',
    };

    const nonNullMeetingDateSort = [
      {
        column: 'mtb_meeting.date',
        order: 'desc',
      },
      {
        column: 'hts_meeting.date',
        order: 'desc',
      },
    ];

    const defaultMeetingDateSort = [
      nullMeetingDateSort,
      ...nonNullMeetingDateSort,
    ];

    const defaultExpeditedSort = [
      {
        column: 'version.expedite',
        order: 'desc',
      },
      ...defaultMeetingDateSort,
    ];

    const customSort = filters?.sortColumns?.flatMap(
      (column, index) => {
        const sortBy = {
          column: sortMapping[column],
          order: filters.sortDirections[index],
        };
        return column === 'MTB Meeting Date' || column === 'HTS Meeting Date'
          ? [nullMeetingDateSort, sortBy]
          : [sortBy, ...defaultMeetingDateSort];
      },
    );

    const offset = (filters.page - 1) * filters.limit;
    return this.knex
      .select({
        clinicalVersionId: 'version.id',
        analysisSetId: 'version.analysis_set_id',
        patientId: 'version.patient_id',
        vitalStatus: 'version.patient_vital_status',
        clinicalStatus: 'version.status',
        pseudoStatus: 'version.pseudo_status',
        expedite: 'version.expedite',
        isGermlineOnly: 'version.is_germline_only',
        zero2FinalDiagnosis: 'version.zero2_final_diagnosis',
        curatorId: 'version.curator_id',
        clinicianId: 'version.clinician_id',
        cancerGeneticistId: 'version.cancer_geneticist_id',
        slidesStartedAt: 'version.slides_started_at',
        slidesFinalisedAt: 'version.slides_finalised_at',
        updatedAt: 'version.updated_at',
      })
      .modify(withClinicalVersion, 'from', user)
      .andWhereNot('version.status', 'Cancelled')
      .modify(
        this.withMeeting,
        this.knex,
        this.meetingsTable,
        this.meetingVersionXrefTable,
      )
      .modify(this.withIdFilters, filters)
      .modify(this.withAdditionalFilters, filters)
      .orderBy(customSort ?? defaultExpeditedSort)
      .offset(offset)
      .limit(filters.limit || 10);
  }

  async getClinicalRecordsCount(
    filters: ISampleFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.knex
      .select('version.id')
      .from({ version: this.clinicalVersionTable })
      .modify(withClinicalVersion, 'from', user)
      .modify(
        this.withMeeting,
        this.knex,
        this.meetingsTable,
        this.meetingVersionXrefTable,
      )
      .modify(this.withIdFilters, filters)
      .modify(this.withAdditionalFilters, filters)
      .whereNot('version.status', 'Cancelled')
      .then((rows) => rows?.length);
  }

  private withIdFilters(
    query: Knex.QueryBuilder,
    filters: ISampleFilters,
  ): void {
    query
      .where(function customWhereBuilder() {
        if (filters?.search?.length > 0) {
          for (const str of filters.search) {
            this.where('version.patient_id', 'like', `%${str}%`);
          }
        }
        if (filters?.analysisSetIds?.length > 0) {
          this.whereIn('version.analysis_set_id', filters.analysisSetIds);
        }
      });
  }

  private withAdditionalFilters(
    query: Knex.QueryBuilder,
    filters: ISampleFilters,
  ): void {
    query
      .where(() => {
        // if (filters?.gender?.length > 0) {
        //   this.whereIn('patient.sex', filters.gender);
        // }
      })
      .andWhere(function expeditedCasesQuery() {
        if (filters?.expedited) {
          this.andWhere('version.expedite', true);
        }
      })
      .andWhere(() => {
        // if (filters?.eventType?.length > 0) {
        //   this.whereIn('sample.sequenced_event', filters.eventType);
        // }
      })
      .andWhere(function vitalStatusQuery() {
        if (filters?.vitalStatus?.length > 0) {
          this.whereIn('version.patient_vital_status', filters.vitalStatus);
        }
      })
      .andWhere(() => {
        // if (filters?.ageRange) {
        //   this.whereBetween('sample.age_at_sample', [
        //     filters.ageRange[0],
        //     filters.ageRange[1],
        //   ]);
        // }
      })
      .andWhere(function assigneesQuery() {
        if (filters?.assignees?.length > 0) {
          this.whereIn('version.curator_id', filters.assignees)
            .orWhereIn('mtb_meeting.chair_id', filters.assignees)
            .orWhereIn('hts_meeting.chair_id', filters.assignees)
            .orWhereIn('version.clinician_id', filters.assignees)
            .orWhereIn('version.cancer_geneticist_id', filters.assignees);
        }
      })
      .andWhere(function statusQuery() {
        this.where(function pseudoStatusQuery() {
          if (filters.pseudoStatuses?.length) {
            this.orWhereIn('version.pseudo_status', filters.pseudoStatuses);
          }
          if (filters.clinicalStatus?.length) {
            this.orWhere(function clinicalStatusQuery() {
              this.whereIn('version.status', filters.clinicalStatus);
              this.whereNull('version.pseudo_status');
            });
          }
        });
      })
      .andWhere(function diagnosisQuery() {
        if (filters?.zero2FinalDiagnosis?.length > 0) {
          this.whereIn('version.zero2_final_diagnosis', filters.zero2FinalDiagnosis);
        }
      })
      .andWhere(function mtbDateQuery() {
        if (filters?.startMtb && filters?.endMtb) {
          this.whereBetween('mtb_meeting.date', [filters.startMtb, filters.endMtb]);
        } else if (filters?.startMtb) {
          this.andWhere('mtb_meeting.date', '>=', filters.startMtb);
        } else if (filters?.endMtb) {
          this.andWhere('mtb_meeting.date', '<=', filters.endMtb);
        }
      })
      .orWhere(function htsDateQuery() {
        if (filters?.startHts && filters?.endHts) {
          this.whereBetween('hts_meeting.date', [filters.startHts, filters.endHts]);
        } else if (filters?.startHts) {
          this.andWhere('hts_meeting.date', '>=', filters.startHts);
        } else if (filters?.endHts) {
          this.andWhere('hts_meeting.date', '<=', filters.endHts);
        }
      })
      .andWhere(() => {
        // if (filters?.startEnrolment && filters?.endEnrolment) {
        //   this.whereBetween(
        //     'patient.enrolment_date',
        //     [filters.startEnrolment, filters.endEnrolment]
        //   );
        // } else if (filters?.startEnrolment) {
        //   this.andWhere('patient.enrolment_date', '>=', filters.startEnrolment);
        // } else if (filters?.endEnrolment) {
        //   this.andWhere('patient.enrolment_date', '<=', filters.endEnrolment);
        // }
      });
  }

  // As this will be used as a callback function
  // Any references to 'this' will be undefined
  // Knex, and the table names will need to be passed in.
  private withMeeting(
    query: Knex.QueryBuilder,
    knex: Knex,
    meetingsTable: string,
    meetingVersionXrefTable: string,
    types: MeetingType[] = ['HTS', 'MTB'],
  ): void {
    types.forEach((type) => {
      query.leftJoin(
        knex
          .select({
            date: 'meeting.date',
            version: 'xref.clinical_version_id',
            chair_id: 'xref.chair_id',
          })
          .from({ meeting: meetingsTable })
          .innerJoin({ xref: meetingVersionXrefTable }, 'meeting.id', 'xref.meeting_id')
          .where('xref.type', type.toLowerCase())
          .as(`${type.toLowerCase()}_meeting`),
        `${type.toLowerCase()}_meeting.version`,
        'version.id',
      );
    });
  }
}
