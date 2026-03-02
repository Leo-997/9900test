import { Logger } from '@nestjs/common';
import knex from 'knex';
import {
  CommentClient,
  DrugClient,
  EvidenceClient,
  MolecularAlterationsClient,
  RecommendationClient,
  SampleClient,
  TherapyClient,
} from 'Clients/index';
import {
  CommentService,
  DrugService,
  EvidenceService,
  InterpretationsService,
  MolecularAlterationsService,
  RecommendationService,
  SampleService,
  TherapyService,
} from 'Services/index';
import { HttpService } from '@nestjs/axios';
import { TrialsService } from 'Services/Trials/Trials.service';
import { TrialsClient } from 'Clients/Trials/Trials.client';
import { IFetchRecommendation } from 'Models/Recommendation/Recommendation.model';
import { IFetchTherapyDrug } from 'Models/index';
import { Node } from 'slate';
import fs from 'node:fs';
import os from 'os';
import { InterpretationsClient } from 'Clients/Interpretation/Interpretation.client';
import { SlideTableSettingsClient } from 'Clients/Settings/SlideTable/SlideTableSettings.client';
import { ReviewerService } from 'Services/Reviewer/Reviewer.service';
import { ReviewerClient } from 'Clients/Reviewer/Reviewer.client';
import { AddendumService } from 'Services/Addendum/Addendum.service';
import { AddendumClient } from 'Clients/Addendum/Addendum.client';
import { NotificationsService } from 'Services/Notifications/Notifications.service';
import { knexConnectionConfig } from '../../../knexfile';

const logger = new Logger('FetchRecommendations');
const httpService = new HttpService();
const clinicalKnex = knex(knexConnectionConfig);
const recommendationClient = new RecommendationClient(clinicalKnex);
const therapyClient = new TherapyClient(clinicalKnex);
const drugClient = new DrugClient(clinicalKnex);
const drugService = new DrugService(drugClient, httpService);
const trialClient = new TrialsClient(clinicalKnex);
const trialService = new TrialsService(trialClient, httpService);
const therapyService = new TherapyService(therapyClient, drugService, trialService);
const evidenceClient = new EvidenceClient(clinicalKnex);
const evidenceService = new EvidenceService(evidenceClient);
const molecularAlterationClient = new MolecularAlterationsClient(clinicalKnex);
const molecularAlterationsService = new MolecularAlterationsService(molecularAlterationClient);
const sampleClient = new SampleClient(clinicalKnex);
const slideTableSettingsClient = new SlideTableSettingsClient(clinicalKnex);
const reviewerClient = new ReviewerClient(clinicalKnex);
const reviewerService = new ReviewerService(reviewerClient);
const addendumClient = new AddendumClient(clinicalKnex);
const addendumService = new AddendumService(addendumClient);
const notificationService = new NotificationsService(new HttpService());
const sampleService = new SampleService(
  sampleClient,
  slideTableSettingsClient,
  reviewerService,
  addendumService,
  molecularAlterationsService,
  notificationService,
);

const commentClient = new CommentClient(clinicalKnex);
const commentService = new CommentService(commentClient, evidenceService, sampleService);
const interpretationsClient = new InterpretationsClient(clinicalKnex);
const interpretationsService = new InterpretationsService(
  interpretationsClient,
  commentService,
  molecularAlterationsService,
);

const recommendationService = new RecommendationService(
  recommendationClient,
  therapyService,
  trialService,
  evidenceService,
  interpretationsService,
  molecularAlterationsService,
);

type OptionType = 1 | 2 | 3 | 4;

interface IRecommendationCounts {
  type1Count: number;
  type2Count: number;
  type3Count: number;
  type4Count: number;
  totalRecommendations: number;
}

type Recommendation = IFetchRecommendation & {
  patientId: string,
  optionCounts: IRecommendationCounts,
}

function isTargetedDrug(drug: IFetchTherapyDrug): boolean {
  return !drug.class.name.includes('chemo only rec') && drug.class.name !== 'Unguided';
}

function getOptionType(option: IFetchRecommendation): OptionType {
  const drugs = option.therapy?.drugs ?? [];
  const hasChemoOrRadioTherapy = Boolean(
    option.therapy?.chemotherapy || option.therapy?.radiotherapy,
  );

  if (!hasChemoOrRadioTherapy && drugs.length === 1 && isTargetedDrug(drugs[0])) {
    return 1; // Targeted monotherapy
  }
  if (
    drugs.filter(isTargetedDrug).length === 1
    && (hasChemoOrRadioTherapy || drugs.some((d) => !isTargetedDrug(d)))
  ) {
    return 2; // Combination: Single targeted + non-targeted
  }
  if (drugs.filter(isTargetedDrug).length >= 1) {
    return 3; // 1 or more targeted agents +/- non-targeted
  }
  return 4; // none of the above 3
}

function getRecommendationKey(option: IFetchRecommendation): string {
  const optionType = getOptionType(option);
  const drugs = option.therapy?.drugs ?? [];
  const normalizedClassNames = drugs.map((drug) => {
    const className = drug.class.name;
    if (className.includes('chemo only rec') || className === 'Unguided') {
      return 'chemo-unguided';
    }
    return className;
  }).sort();

  const drugClassKey = normalizedClassNames.length > 0 ? normalizedClassNames.join('|') : 'no-class';
  return `${optionType}:${drugClassKey}`;
}

const countRecommendationsAndOptions = (
  options: IFetchRecommendation[],
): IRecommendationCounts => {
  const counts: IRecommendationCounts = {
    type1Count: 0,
    type2Count: 0,
    type3Count: 0,
    type4Count: 0,
    totalRecommendations: 0,
  };

  const uniqueRecommendationKeys = new Set<string>();

  for (const option of options) {
    const optionType = getOptionType(option);
    counts[`type${optionType}Count` as keyof IRecommendationCounts] += 1;

    const recommendationKey = getRecommendationKey(option);
    uniqueRecommendationKeys.add(recommendationKey);
  }
  counts.totalRecommendations = uniqueRecommendationKeys.size;
  return counts;
};

const descriptionJsonToText = (description: string): string => {
  try {
    const parsed = JSON.parse(description);
    const slateValue = parsed.value ?? parsed;
    return slateValue.map((n) => Node.string(n)).join('\n');
  } catch {
    return JSON.parse(description).blocks[0].text;
  }
};

const user = {
  id: 'sysadmin',
  azureId: 'sysadmin',
  givenName: 'System',
  familyName: 'Administrator',
  email: 'sysadmin',
  isActive: true,
  groups: [],
  roles: [],
  studies: [],
  sites: [],
  scopes: [],
  accessControls: [],
};

const headers = { authorization: process.argv[2] };

async function getRecommendationsByType(): Promise<Recommendation> {
  logger.log('Running script...');
  try {
    logger.log('Fetching all recommendations for cohort 1 and 2 patients');

    const versions = await clinicalKnex.from({ version: 'zcc_clinical_versions' })
      .select({
        clinicalVersionId: 'version.id',
        patientId: 'version.patient_id',
      })
      .whereIn('cohort', ['Cohort 1 : High-risk cancers', 'Cohort 2 : Rare tumour']);

    const recommendations: Recommendation[] = (await Promise.all(
      versions.map(async (version) => {
        const recs = await recommendationService.getAllRecommendations(
          version.clinicalVersionId,
          {
            types: ['THERAPY', 'GROUP'],
            entityType: 'REPORT',
          },
          1,
          100,
          headers,
          user,
        );
        return recs.map((rec) => ({
          ...rec,
          patientId: version.patientId,
          optionCounts: countRecommendationsAndOptions(rec.type === 'GROUP' ? (rec.recommendations ?? []) : [rec]),
          description: descriptionJsonToText(rec.description),
        }));
      }),
    )).flatMap((recs) => recs);

    const rowArrays = recommendations.map((rec) => {
      const {
        patientId,
        title,
        description,
        tier,
        type,
        optionCounts,
      } = rec;
      const {
        type1Count,
        type2Count,
        type3Count,
        type4Count,
        totalRecommendations,
      } = optionCounts;
      const options = rec.type === 'GROUP' ? rec.recommendations.filter((r) => r.type === 'THERAPY') : [rec];
      const therapyOptionsString = options.map(
        (option, index) => {
          const optionType = getOptionType(option);
          let drugs = `Option ${index + 1} (Type ${optionType}): `;
          drugs += option.therapy.drugs.map(
            (drug) => `${drug.class.name} ${drug.externalDrug ? `(${drug.externalDrug.name})` : ''}`,
          ).join(' + ');
          if (option.therapy.chemotherapy) drugs += ' + chemo';
          if (option.therapy.radiotherapy) drugs += ' + radio';
          return drugs;
        },
      ).join(';    ');
      return [
        patientId,
        `"${title}"`,
        `"${description}"`,
        tier,
        type,
        type1Count,
        type2Count,
        type3Count,
        type4Count,
        totalRecommendations,
        `"${therapyOptionsString}"`,
        rec.id,
      ];
    });

    const tableHeader = [
      'patient id',
      'title',
      'description',
      'tier',
      'recommendation type',
      'number of type1 options',
      'number of type2 options',
      'number of type3 option',
      'number of type4 options',
      'number of recommendations',
      'options',
      'recommendation Id',
    ];

    const csvContent = `${tableHeader.join(',')}\n${rowArrays.map((e) => e.join(',')).join('\n')}`;

    await fs.promises.writeFile(`${os.homedir()}/Downloads/recommendations.csv`, csvContent);
    logger.log(`Fetched ${rowArrays.length} recommendations.`);
    process.exit(0);
  } catch (error) {
    logger.error('Failed: ', error);
    process.exit(1);
  }
}

getRecommendationsByType();
