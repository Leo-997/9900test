import { QueueServiceClient, StorageSharedKeyCredential } from '@azure/storage-queue';
import {
  Inject, Injectable, InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig, ISecrets } from 'Config/configuration';
import { Knex } from 'knex';
import {
  DiagnosisFilters,
  IAnalysisPatient, IAnalysisSet,
  IAnalysisSetFilters,
  ICurationSummary,
  IDiagnosisOptionCombination,
  IMolecularConfirmation,
  ITriggerExportBody,
  IUpdateAnalysisSetBody,
  IUpdateCurationSummaryBody,
  UpdateMolecularConfirmationBody,
} from 'Models/Analysis/AnalysisSets.model';
import { ReportType } from 'Models/Reports/Reports.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withAnalysisSetBiosampleXref } from 'Utilities/query/accessControl/withAnalysisSetBiosampleXref.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { withPatient } from 'Utilities/query/accessControl/withPatient.util';
import { withPagination } from 'Utilities/query/misc.util';
import { dashboardActiveStateSort, taskDashboardActiveStateSort } from 'Utilities/transformers/SortMapping.util';
import { v4 } from 'uuid';

@Injectable()
export class AnalysisSetsClient {
  private readonly purityTable = 'zcc_purity';

  private readonly meetingSamplesTable = 'zcc_curation_meeting_samples';

  private readonly meetingTable = 'zcc_curation_meeting';

  private readonly summaryTable = 'zcc_sample_summary_notes';

  private readonly molecularConfirmationTable = 'zcc_molecular_confirmation';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    @Inject(ConfigService) private readonly configService: ConfigService<IConfig>,
  ) {}

  public async getAnalysisSetPatients(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<IAnalysisPatient[]> {
    let returnedQuery: Knex.QueryBuilder;

    if (filters.enrolledOnlyCases || filters.withdrawnCases) {
      returnedQuery = this.getSamplelessPatientBase(user)
        .modify(this.withSamplelessPatientFilters, filters);
    } else {
      const allPublicSubjectIds: number[] = await this.getAnalysisSetBase(user)
        .modify(this.withFilters, filters, user, this)
        .pluck('analysis.public_subject_id');

      returnedQuery = this.getAnalysisPatientBase(user)
        .modify(this.withPublicSubjectIdFilters, allPublicSubjectIds);
    }

    if (filters.page !== undefined && filters.limit !== undefined) {
      returnedQuery.modify(withPagination, filters.page, filters.limit);
    }

    return returnedQuery;
  }

  public async getAnalysisSets(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<IAnalysisSet[]> {
    const query = this.getAnalysisSetBase(user)
      .modify(this.withFilters, filters, user, this);

    if (filters.page !== undefined && filters.limit !== undefined) {
      query.modify(withPagination, filters.page, filters.limit);
    }

    return query;
  }

  public async getAnalysisPatientsCount(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    let data: { count: number } | undefined;

    if (filters.enrolledOnlyCases || filters.withdrawnCases) {
      data = await this.knex.count('* as count')
        .from(
          this.getSamplelessPatientBase(user)
            .modify(this.withSamplelessPatientFilters, filters)
            .as('samplelessPatient'),
        )
        .first();
    } else {
      const allPublicSubjectIds = await this.getAnalysisSetBase(user)
        .modify(this.withFilters, filters, user, this)
        .clearSelect()
        .select('analysis.public_subject_id')
        .pluck('analysis.public_subject_id');

      data = await this.knex.count('* as count')
        .from(
          this.getAnalysisPatientBase(user)
            .modify(this.withPublicSubjectIdFilters, allPublicSubjectIds)
            .as('analysisPatient'),
        )
        .first();
    }

    return data?.count ?? 0;
  }

  public async getAnalysisSetsCount(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.getAnalysisSetBase(user)
      .modify(this.withFilters, filters, user, this)
      .clearSelect()
      .count<Record<string, number>>('* as count')
      .first();

    return data?.count ?? 0;
  }

  public async getAllStudies(
    user: IUserWithMetadata,
  ): Promise<string[]> {
    return this.knex
      .distinct('analysis.study')
      .whereNotNull('analysis.study')
      .modify(withAnalysisSet, 'from', user)
      .pluck('analysis.study');
  }

  private withDiagnosisFilters(
    qb: Knex.QueryBuilder,
    {
      zero2Category,
      zero2Subcat1,
      zero2Subcat2,
      zero2FinalDiagnosis,
    }: DiagnosisFilters,
  ): void {
    qb.where(function hasFilters() {
      if (zero2Category && zero2Category.length > 0) {
        this.whereIn('zero2_category', zero2Category);
      }
      if (zero2Subcat1 && zero2Subcat1.length > 0) {
        this.whereIn('zero2_subcategory1', zero2Subcat1);
      }
      if (zero2Subcat2 && zero2Subcat2.length > 0) {
        this.whereIn('zero2_subcategory2', zero2Subcat2);
      }
      if (zero2FinalDiagnosis && zero2FinalDiagnosis.length > 0) {
        this.whereIn('zero2_final_diagnosis', zero2FinalDiagnosis);
      }
    });
  }

  public async getZero2Categories(
    user: IUserWithMetadata,
    filters: DiagnosisFilters,
  ): Promise<string[]> {
    return this.knex
      .distinct('zero2_category')
      .whereNotNull('zero2_category')
      .modify(withAnalysisSet, 'from', user)
      .modify(this.withDiagnosisFilters, filters)
      .pluck('zero2_category');
  }

  public async getZero2Subcategory1(
    user: IUserWithMetadata,
    filters: DiagnosisFilters,
  ): Promise<string[]> {
    return this.knex
      .distinct('zero2_subcategory1')
      .whereNotNull('zero2_subcategory1')
      .modify(withAnalysisSet, 'from', user)
      .modify(this.withDiagnosisFilters, filters)
      .pluck('zero2_subcategory1');
  }

  public async getZero2Subcategory2(
    user: IUserWithMetadata,
    filters: DiagnosisFilters,
  ): Promise<string[]> {
    return this.knex
      .distinct('zero2_subcategory2')
      .whereNotNull('zero2_subcategory2')
      .modify(withAnalysisSet, 'from', user)
      .modify(this.withDiagnosisFilters, filters)
      .pluck('zero2_subcategory2');
  }

  public async getZero2FinalDiagnosis(
    user: IUserWithMetadata,
    filters: DiagnosisFilters,
  ): Promise<string[]> {
    return this.knex
      .distinct('zero2_final_diagnosis')
      .whereNotNull('zero2_final_diagnosis')
      .modify(withAnalysisSet, 'from', user)
      .modify(this.withDiagnosisFilters, filters)
      .pluck('zero2_final_diagnosis');
  }

  public async getZero2DiagnosisOptionCombinations(
    user: IUserWithMetadata,
  ): Promise<IDiagnosisOptionCombination[]> {
    const rows = await this.knex
      .select<IDiagnosisOptionCombination[]>({
        zero2Category: 'zero2_category',
        zero2Subcat1: 'zero2_subcategory1',
        zero2Subcat2: 'zero2_subcategory2',
        zero2FinalDiagnosis: 'zero2_final_diagnosis',
      })
      .modify(withAnalysisSet, 'from', user)
      .whereNotNull('zero2_category')
      .whereNotNull('zero2_subcategory1')
      .whereNotNull('zero2_subcategory2')
      .whereNotNull('zero2_final_diagnosis')
      .distinct('zero2_category', 'zero2_subcategory1', 'zero2_subcategory2', 'zero2_final_diagnosis');

    return rows.map(((row) => ({
      zero2Category: row.zero2Category,
      zero2Subcat1: row.zero2Subcat1,
      zero2Subcat2: row.zero2Subcat2,
      zero2FinalDiagnosis: row.zero2FinalDiagnosis,
    })));
  }

  public async getAnalysisSetById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<IAnalysisSet> {
    return this.getAnalysisSetBase(user)
      .where('analysis.analysis_set_id', id)
      .andWhereNot('curation_status', 'Withdrawn')
      .first();
  }

  public async updateAnalysisSetById(
    id: string,
    body: IUpdateAnalysisSetBody,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    await this.knex
      .update({
        expedite: body.expedite,
        targetable: body.targetable,
        ctc_candidate: body.ctcCandidate,
        research_candidate: body.researchCandidate,
        curation_status: body.curationStatus,
        pseudo_status: body.pseudoStatus,
        failed_status_reason: body.failedStatusReason,
        curation_started_at: body.curationStatus === 'Ready to Start' ? this.knex.fn.now() : undefined,
        curation_finalised_at: body.curationStatus === 'Done' ? this.knex.fn.now() : undefined,
        case_finalised_at: body.finaliseCase ? this.knex.fn.now() : undefined,
        secondary_curation_status: body.secondaryCurationStatus,
        hts_status: body.htsStatus,
        primary_curator_id: body.primaryCuratorId,
        secondary_curator_id: body.secondaryCuratorId,
        updated_at: this.knex.fn.now(),
        updated_by: currentUser.id,
      })
      .from('zcc_analysis_set')
      .where('analysis_set_id', id);
  }

  public async getSummaries(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<ICurationSummary[]> {
    return this.knex
      .select({
        analysisSetId: 'summary.analysis_set_id',
        note: 'summary.note',
        type: 'summary.type',
        date: 'summary.date',
      })
      .from<ICurationSummary>({ summary: this.summaryTable })
      .where('summary.analysis_set_id', analysisSetId)
      .modify(withAnalysisSet, 'innerJoin', user, 'summary.analysis_set_id');
  }

  public async updateSummary(
    analysisSetId: string,
    {
      type,
      note,
      date,
    }: IUpdateCurationSummaryBody,
  ): Promise<void> {
    await this.knex
      .insert({
        analysis_set_id: analysisSetId,
        note,
        type,
        date,
      })
      .into(this.summaryTable)
      .onConflict(['analysis_set_id', 'type'])
      .merge(['note', 'date']);
  }

  public async triggerExport(
    analysisSetId: string,
    body: ITriggerExportBody,
  ): Promise<void> {
    const {
      storageAccountName,
      storageAccountUrl,
      storageAccountKey,
      storageQueue,
      htsStorageQueue,
    } = this.configService.get<ISecrets>('secrets');
    try {
      const queue = body.type === 'CASE' ? storageQueue : htsStorageQueue;
      const sharedKeyCredential = new StorageSharedKeyCredential(
        storageAccountName,
        storageAccountKey,
      );
      const queueServiceClient = new QueueServiceClient(
        storageAccountUrl,
        sharedKeyCredential,
        {
          retryOptions: { maxTries: 4 }, // Retry options
        },
      );
      const queueClient = queueServiceClient.getQueueClient(queue);
      const message = btoa(JSON.stringify(body.type === 'CASE'
        ? { analysisSetId, clinicalStatus: body.clinicalStatus }
        : { analysisSetId }));
      await queueClient.sendMessage(message);
    } catch (error) {
      console.error(`Export failed: ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('Workflow could not be triggered');
    }
  }

  public async getMolecularConfirmation(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<IMolecularConfirmation | null> {
    const molecularConfirmation = await this.knex.select({
      changeOrRefinement: 'confirmation.change_or_refinement',
      changeOrRefinementNotes: 'confirmation.change_or_refinement_notes',
      pathologistAgreement: 'confirmation.pathologist_agreement',
      pathologistCommunicationMethod: 'confirmation.pathologist_communication_method',
      pathologistAgreementNotes: 'confirmation.pathologist_agreement_notes',
      finalDiagnosisUpdated: 'confirmation.final_diagnosis_updated',
      diagnosisSubtype: 'confirmation.diagnosis_subtype',
      zero2ConfirmedSubtype: 'confirmation.zero2_confirmed_subtype',
    })
      .from({ confirmation: this.molecularConfirmationTable })
      .modify(
        withAnalysisSet,
        'innerJoin',
        user,
        'confirmation.analysis_set_id',
      )
      .where('confirmation.analysis_set_id', analysisSetId)
      .first();

    return molecularConfirmation ?? null;
  }

  public async updateMolecularConfirmation(
    analysisSetId: string,
    body: UpdateMolecularConfirmationBody,
  ): Promise<void> {
    const insertObj: Record<string, string> = {
      id: v4(),
      analysis_set_id: analysisSetId,
    };

    const camelToSnakeMap: Record<string, string> = {
      changeOrRefinement: 'change_or_refinement',
      changeOrRefinementNotes: 'change_or_refinement_notes',
      pathologistAgreement: 'pathologist_agreement',
      pathologistCommunicationMethod: 'pathologist_communication_method',
      pathologistAgreementNotes: 'pathologist_agreement_notes',
      finalDiagnosisUpdated: 'final_diagnosis_updated',
      diagnosisSubtype: 'diagnosis_subtype',
      zero2ConfirmedSubtype: 'zero2_confirmed_subtype',
    };

    const mergeKeys: string[] = [];

    for (const apiKey in body) {
      if (body[apiKey] !== undefined) {
        const dbKey = camelToSnakeMap[apiKey];
        insertObj[dbKey] = body[apiKey];
        mergeKeys.push(dbKey);
      }
    }

    await this.knex
      .insert(insertObj)
      .into(this.molecularConfirmationTable)
      .onConflict('analysis_set_id')
      .merge(mergeKeys);
  }

  private getSamplelessPatientBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .distinct({
        publicSubjectId: 'patient.public_subject_id',
        patientId: 'patient.patient_id',
        gender: 'patient.sex',
        vitalStatus: 'patient.vital_status',
        ageAtDiagnosis: 'patient.age_at_diagnosis',
        ageAtDeath: 'patient.age_at_death',
        study: 'patient.study',
        ageAtEnrolment: 'patient.age_at_enrolment',
        enrolmentDate: 'patient.enrolment_date',
        registrationDate: 'patient.registration_date',
        stage: 'patient.stage',
        comments: 'patient.comments',
      })
      .modify(withPatient, 'from', user, undefined, undefined)
      .leftJoin({ analysis: 'zcc_analysis_set' }, function join() {
        this.on('analysis.patient_id', 'patient.patient_id')
          .andOn('analysis.study', 'patient.study');
      });
  }

  // For enrolled-only ("unwithdrawn" or no record on zcc_analysis_set) or withdrawn patients
  private withSamplelessPatientFilters(
    qb: Knex.QueryBuilder,
    filters: IAnalysisSetFilters,
  ): void {
    if (filters.study?.length) {
      qb.whereIn('patient.study', filters.study);
    }
    if (filters.search?.length) {
      qb.where(function searchQuery() {
        for (const id of filters.search) {
          this.orWhere('patient.patient_id', 'LIKE', `%${id}%`);
        }
      });
    }
    if (filters.enrolledOnlyCases) {
      qb
        .whereNull('analysis.patient_id')
        .andWhere(function correctStage() {
          this.whereNot('patient.stage', 'Withdrawn');
          this.orWhereNull('patient.stage');
        });
    } else if (filters.withdrawnCases) {
      qb.where('patient.stage', 'Withdrawn');
    }

    qb.orderBy([
      {
        column: 'patient.registration_date',
        order: 'desc',
      },
      {
        column: 'patient.public_subject_id',
      },
    ]);
  }

  private getAnalysisPatientBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        publicSubjectId: 'patient.public_subject_id',
        vitalStatus: this.knex.raw('ANY_VALUE(patient.vital_status)'),
        gender: this.knex.raw('ANY_VALUE(patient.sex)'),
        ageAtDiagnosis: this.knex.raw('ANY_VALUE(patient.age_at_diagnosis)'),
        ageAtDeath: this.knex.raw('ANY_VALUE(patient.age_at_death)'),
        ageAtEnrolment: this.knex.raw('ANY_VALUE(patient.age_at_enrolment)'),
      })
      .modify(withAnalysisSet, 'from', user)
      .modify(withPatient, 'innerJoin', user, 'analysis.patient_id', 'analysis.study')
      .groupBy('patient.public_subject_id');
  }

  private getAnalysisSetBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        analysisSetId: 'analysis.analysis_set_id',
        patientId: 'analysis.patient_id',
        publicSubjectId: 'analysis.public_subject_id',
        c1EventNum: 'analysis.c1_event_num',
        sequencedEvent: 'analysis.sequenced_event',
        diagnosisEvent: 'analysis.diagnosis_event',
        analysisEvent: 'analysis.analysis_event',
        cohort: 'analysis.cohort',
        cohortRationale: 'analysis.cohort_rationale',
        cancerSubtype: 'analysis.cancer_subtype',
        highRisk: 'analysis.high_risk',
        study: 'analysis.study',
        genePanel: 'analysis.gene_panel',
        histologicDiagnosis: 'analysis.histologic_diagnosis',
        confirmedDiagnosis: 'analysis.confirmed_diagnosis',
        zero2Category: 'analysis.zero2_category',
        zero2Subcategory1: 'analysis.zero2_subcategory1',
        zero2Subcategory2: 'analysis.zero2_subcategory2',
        zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
        whoGrade: 'analysis.who_grade',
        histology: 'analysis.histology',
        molecularConfirmation: 'analysis.molecular_confirmation',
        priSite: 'analysis.pri_site',
        sampleSite: 'analysis.sample_site',
        sampleMetSite: 'analysis.sample_met_site',
        metDisease: 'analysis.met_disease',
        ncitTerm: 'analysis.ncit_term',
        ncitCode: 'analysis.ncit_code',
        somMissenseSnvs: 'analysis.som_missense_snvs',
        expedite: 'analysis.expedite',
        finalPass: 'analysis.final_pass',
        mutBurdenMb: 'analysis.mut_burden_mb',
        lohProportion: 'analysis.loh_proportion',
        targetable: 'analysis.targetable',
        ctcCandidate: 'analysis.ctc_candidate',
        researchCandidate: 'analysis.research_candidate',
        curationStatus: 'analysis.curation_status',
        pseudoStatus: 'analysis.pseudo_status',
        failedStatusReason: 'analysis.failed_status_reason',
        curationStartedAt: 'analysis.curation_started_at',
        curationFinalisedAt: 'analysis.curation_finalised_at',
        caseFinalisedAt: 'analysis.case_finalised_at',
        htsStatus: 'analysis.hts_status',
        secondaryCurationStatus: 'analysis.secondary_curation_status',
        failed: 'analysis.failed',
        primaryCuratorId: 'analysis.primary_curator_id',
        secondaryCuratorId: 'analysis.secondary_curator_id',
        createdAt: 'analysis.created_at',
        updatedAt: 'analysis.updated_at',
        createdBy: 'analysis.created_by',
        updatedBy: 'analysis.updated_by',

        vitalStatus: 'patient.vital_status',
        gender: 'patient.sex',

        purity: 'purity.purity',
        ploidy: 'purity.ploidy',

        meetingDate: 'meeting.date',
      })
      .modify(withAnalysisSet, 'from', user)
      .modify(withPatient, 'innerJoin', user, 'analysis.patient_id', 'analysis.study')
      .leftJoin(
        { purity: this.purityTable },
        'purity.analysis_set_id',
        'analysis.analysis_set_id',
      )
      .leftJoin(
        { meetingSample: this.meetingSamplesTable },
        'meetingSample.analysis_set_id',
        'analysis.analysis_set_id',
      )
      .leftJoin(
        { meeting: this.meetingTable },
        'meeting.meeting_id',
        'meetingSample.meeting_id',
      );
  }

  private withPublicSubjectIdFilters(
    qb: Knex.QueryBuilder,
    allPublicSubjectIds: string[],
  ): void {
    qb.whereIn('patient.public_subject_id', allPublicSubjectIds);
    if (allPublicSubjectIds.length) {
      qb.orderByRaw(
        `field(patient.public_subject_id, ${allPublicSubjectIds.map(() => '?').join(',')})`,
        allPublicSubjectIds,
      );
    }
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
    analysisSetClient: AnalysisSetsClient,
  ): void {
    const sortMapping: Record<string, string> = {

      'Curation Date': 'meeting.date',

      'Enrolment Date': 'patient.enrolment_date',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Purity: 'purity.purity',

      'Mutation Burden': 'mut_burden_mb',
    };

    const biosampleQuery = analysisSetClient
      .knex
      .select('xref.analysis_set_id')
      .modify(withAnalysisSetBiosampleXref, 'from', user)
      .modify(withBiosample, 'innerJoin', user, 'xref.biosample_id')
      .where(function searchIds() {
        if (filters.search) {
          for (const id of filters.search) {
            this.orWhere('biosample.patient_id', 'LIKE', `%${id}%`);
            this.orWhere('biosample.biosample_id', 'LIKE', `%${id}%`);
            this.orWhere('biosample.lm_subj_id', 'LIKE', `%${id}%`);
            this.orWhere(
              'biosample.manifest_name',
              'LIKE',
              `%${id}%`,
            );
          }
        }
      });

    qb
      .andWhereNot('curation_status', 'Withdrawn')
      .andWhere(function searchQuery() {
        if (filters.search) {
          for (const id of filters.search) {
            this.orWhere('analysis.patient_id', 'LIKE', `%${id}%`);
            this.orWhere('analysis.public_subject_id', 'LIKE', `%${id}%`);
            this.orWhereIn('analysis.analysis_set_id', biosampleQuery);
          }
        }
      })
      .andWhere(function analysisSetIdsFilter() {
        if (filters.analysisSetIds?.length) {
          this.whereIn('analysis.analysis_set_id', filters.analysisSetIds);
        }
      })
      .andWhere(function patientIdFilter() {
        if (filters.patientId) {
          this.where('analysis.patient_id', filters.patientId);
        }
      })
      .andWhere(function publicSubjectIdFilter() {
        if (filters.publicSubjectId) {
          this.where('analysis.public_subject_id', filters.publicSubjectId);
        }
      })
      .andWhere(function genderQuery() {
        if (filters.gender && filters.gender.length) {
          this.whereIn('patient.sex', filters.gender);
        }
      })
      .andWhere(function vitalStatusQuery() {
        if (filters.vitalStatus && filters.vitalStatus.length) {
          this.whereIn('patient.vital_status', filters.vitalStatus);
        }
      })
      .andWhere(function ageRangeQuery() {
        if (filters.ageRange) {
          this.andWhere(
            'patient.age_at_diagnosis',
            '>=',
            filters.ageRange[0],
          );
          this.andWhere(
            'patient.age_at_diagnosis',
            '<=',
            filters.ageRange[1],
          );
        }
      })
      .andWhere(function cohortQuery() {
        if (filters.cohort && filters.cohort.length > 0) {
          this.whereIn('cohort', filters.cohort);
        }
      })
      .andWhere(function categoryQuery() {
        if (filters.zero2Category && filters.zero2Category.length > 0) {
          this.whereIn('zero2_category', filters.zero2Category);
        }
      })
      .andWhere(function subCat1Query() {
        if (filters.zero2Subcat1 && filters.zero2Subcat1.length > 0) {
          this.whereIn('zero2_subcategory1', filters.zero2Subcat1);
        }
      })
      .andWhere(function subCat2Query() {
        if (filters.zero2Subcat2 && filters.zero2Subcat2.length > 0) {
          this.whereIn('zero2_subcategory2', filters.zero2Subcat2);
        }
      })
      .andWhere(function finalDiagnosisQuery() {
        if (filters.zero2FinalDiagnosis && filters.zero2FinalDiagnosis.length > 0) {
          this.whereIn('zero2_final_diagnosis', filters.zero2FinalDiagnosis);
        }
      })
      .andWhere(function eventTypeQuery() {
        if (filters.eventType && filters.eventType.length) {
          this.whereIn('analysis.sequenced_event', filters.eventType);
        }
      })
      .andWhere(function enrolmentQuery() {
        if (filters.startEnrolment) {
          this.andWhere(
            'patient.enrolment_date',
            '>=',
            filters.startEnrolment,
          );
        }
        if (filters.endEnrolment) {
          this.andWhere(
            'patient.enrolment_date',
            '<=',
            filters.endEnrolment,
          );
        }
      })
      .andWhere(function curationMeetingDate() {
        if (filters.startCuration) {
          this.andWhere(
            'meeting.date',
            '>=',
            filters.startCuration,
          );
        }
        if (filters.endCuration) {
          this.andWhere(
            'meeting.date',
            '<=',
            filters.endCuration,
          );
        }
      })
      .andWhere(function studyTypeQuery() {
        if (filters.study && filters.study.length) {
          this.whereIn('analysis.study', filters.study);
        }
      })
      .andWhere(function secondaryCuratorQuery() {
        if (filters.secondaryCuratorId === null) {
          this.orWhereNull('analysis.secondary_curator_id');
        } else if (filters.secondaryCuratorId) {
          this.andWhere(
            'analysis.secondary_curator_id',
            filters.secondaryCuratorId,
          );
        }
      })
      .andWhere(function hiddenCasesQuery() {
        if (!filters.all) {
          this.andWhereNot('analysis.curation_status', 'Retro');
        }
      })
      .andWhere(function expediteCasesQuery() {
        if (filters.expedited) {
          this.andWhere('analysis.expedite', true);
        }
      })
      .andWhere(function statusQuery() {
        this.where(function pseudoStatusQuery() {
          if (filters.pseudoStatuses?.length) {
            this.orWhereIn('analysis.pseudo_status', filters.pseudoStatuses);
          }
          if (filters.curationStatus?.length) {
            this.orWhere(function curationStatusQuery() {
              this.whereIn('analysis.curation_status', filters.curationStatus);
              this.whereNull('analysis.pseudo_status');
            });
          }
        });
      })
      .andWhere(function curatorsQuery() {
        if (filters.primaryCurators && filters.primaryCurators.length) {
          filters.primaryCurators.forEach((curator) => {
            if (curator === 'null') {
              this.orWhereNull('analysis.primary_curator_id');
            } else {
              this.orWhere('analysis.primary_curator_id', curator);
            }
          });
        }
        if (filters.secondaryCurators && filters.secondaryCurators.length) {
          filters.secondaryCurators.forEach((curator) => {
            if (curator === 'null') {
              this.orWhereNull('analysis.secondary_curator_id');
            } else {
              this.orWhere('analysis.secondary_curator_id', curator);
            }
          });
        }
      })
      .andWhere(function purityQuery() {
        if (filters.purity) {
          this.whereNotNull('purity.purity')
            .andWhere('purity.purity', '>=', filters.purity[0])
            .andWhere('purity.purity', '<=', filters.purity[1]);
        }
      })
      .andWhere(function mutBurdenQuery() {
        if (filters.mutBurden) {
          this.andWhere('analysis.mut_burden_mb', '>=', filters.mutBurden[0]);
          if (filters.mutBurden[1] < Infinity) {
            this.andWhere(
              'analysis.mut_burden_mb',
              '<=',
              filters.mutBurden[1],
            );
          }
        }
      })
      .andWhere(function activeCasesQuery() {
        if (filters.activeCases) {
          this.andWhere('analysis.case_finalised_at', null);
        }
      })
      .andWhere(function getOverdueReportCases() {
        const dayThresholdsMap: Record<ReportType, number> = {
          MOLECULAR_REPORT: 3,
          GERMLINE_REPORT: 30,
          MTB_REPORT: 30,
          PRECLINICAL_REPORT: 30,
        };
        if (filters.pendingReports?.length) {
          for (const report of filters.pendingReports) {
            const [asetId, type] = report.split('::');
            if (asetId && type) {
              this.orWhere('analysis.analysis_set_id', asetId)
                .andWhereRaw(
                  // This expression checks the number of business days between
                  // now and the curation finalised at date
                  // solution from this Stack overflow: https://stackoverflow.com/a/6762805
                  `5 * (
                    DATEDIFF(now(), analysis.curation_finalised_at) DIV 7
                  ) + MID(
                    '0123444401233334012222340111123400001234000123440',
                    7 * WEEKDAY(analysis.curation_finalised_at) + WEEKDAY(now()) + 1,
                    1
                  ) > ?`,
                  [dayThresholdsMap[type]],
                );
            }
          }
        }
      })
      .andWhereNot('analysis.sequenced_event', null);

    if (filters.sortColumns?.length && filters.sortDirections?.length) {
      for (const [index, column] of filters.sortColumns.entries()) {
        qb.orderBy(
          sortMapping[column],
          filters.sortDirections[index],
        );
      }
    }

    if (filters.externalAssignedCases?.length) {
      qb.orderByRaw(taskDashboardActiveStateSort(user, filters.externalAssignedCases))
        .orderByRaw('CASE WHEN analysis.case_finalised_at IS NULL THEN 0 ELSE 1 END')
        .orderBy('analysis.case_finalised_at', 'desc');
    }

    qb.orderByRaw(dashboardActiveStateSort(user))
      .orderBy('analysis.created_at', 'desc')
      .orderBy('analysis.analysis_set_id', 'desc');
  }
}
