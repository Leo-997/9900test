import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SampleClient } from 'Clients/Sample/Sample.client';
import { SlideTableSettingsClient } from 'Clients/Settings/SlideTable/SlideTableSettings.client';
import { IncomingHttpHeaders } from 'http';
import {
  ISampleData,
  ISampleFilters,
  IUpdateClinicalVersionData, IUserWithMetadata,
  ReviewerBodyDTO,
  UpdateReviewDTO,
} from 'Models';
import {
  IClinicalVersion,
} from 'Models/ClinicalVersion/ClinicalVersion.model';
import { Group } from 'Models/Group/Group.model';
import { IZeroDashClinicalMeta } from 'Models/Notifications/Notifications.model';
import { AddendumService } from '../Addendum/Addendum.service';
import { MeetingsService } from '../Meetings/Meetings.service';
import { MolecularAlterationsService } from '../MolecularAlterations/MolecularAlterations.service';
import { NotificationsService } from '../Notifications/Notifications.service';
import { ReviewerService } from '../Reviewer/Reviewer.service';

@Injectable()
export class SampleService {
  constructor(
    @Inject(SampleClient) private sampleClient: SampleClient,
    @Inject(SlideTableSettingsClient)
      private readonly slideTableSettingsClient: SlideTableSettingsClient,
    @Inject(ReviewerService) private reviewerService: ReviewerService,
    @Inject(AddendumService) private addendumService: AddendumService,
    @Inject(MolecularAlterationsService)
      private readonly molecularAlterationsService: MolecularAlterationsService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => MeetingsService)) private readonly meetingService?: MeetingsService,
  ) {}

  public async updateClinicalVersionData(
    clinicalVersionId: string,
    data: IUpdateClinicalVersionData,
    currentUser: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    const clinicalVersion = await this.getClinicalVersion(
      currentUser,
      clinicalVersionId,
      undefined,
      true,
    );

    const { slideTableSettings, ...versionUpdates } = data;
    await this.sampleClient.updateClinicalVersionData(
      clinicalVersionId,
      versionUpdates,
      currentUser,
    );

    if (slideTableSettings) {
      await this.slideTableSettingsClient.upsertSettings(
        clinicalVersionId,
        slideTableSettings,
      );
    }

    const entityMetadata: IZeroDashClinicalMeta = {
      analysisSetId: clinicalVersion.analysisSetId,
      patientId: clinicalVersion.patientId,
      clinicalVersionId,
    };

    if (data.curatorId) {
      this.notificationsService.sendNotification(
        headers,
        currentUser,
        {
          type: 'CLINICAL_ASSIGNED',
          title: `${clinicalVersion.patientId}: Clinical Curator assigned`,
          description: `You have been assigned as a Curator to clinical case ${clinicalVersion.patientId} by ${currentUser.givenName} ${currentUser.familyName}`,
          entityMetadata,
          modes: ['INTERNAL'],
          notifyUserIds: [clinicalVersion.curatorId],
        },
      );
    }

    if (data.clinicianId) {
      this.notificationsService.sendNotification(
        headers,
        currentUser,
        {
          type: 'CLINICAL_ASSIGNED',
          title: `${clinicalVersion.patientId}: Clinician assigned`,
          description: `You have been assigned as a Clinician to clinical case ${clinicalVersion.patientId} by ${currentUser.givenName} ${currentUser.familyName}`,
          entityMetadata,
          modes: ['EMAIL'],
          notifyUserIds: [clinicalVersion.clinicianId],
          emailTemplate: 'ZERO_DASH',
        },
      );
    }

    if (data.cancerGeneticistId) {
      this.notificationsService.sendNotification(
        headers,
        currentUser,
        {
          type: 'CLINICAL_ASSIGNED',
          title: `${clinicalVersion.patientId}: Genetic Clinician assigned`,
          description: `You have been assigned as a Genetic Clinician to clinical case ${clinicalVersion.patientId} by ${currentUser.givenName} ${currentUser.familyName}`,
          entityMetadata,
          modes: ['EMAIL'],
          notifyUserIds: [clinicalVersion.cancerGeneticistId],
          emailTemplate: 'ZERO_DASH',
        },
      );
    }
  }

  public async getLatestClinicalVersion(
    user: IUserWithMetadata,
    analysisSetId: string,
    checkWrite = false,
  ): Promise<IClinicalVersion> {
    const result = await this.sampleClient.getClinicalVersion(
      user,
      undefined,
      analysisSetId,
      checkWrite,
    );
    if (!result) {
      throw new NotFoundException(
        `No clinical version found for sample ${analysisSetId}`,
      );
    }
    result.slideTableSettings = await this.slideTableSettingsClient.getSettings(result.id);
    result.meetings = await this.meetingService.getMeetings(result.id);
    const reviewers = await this.reviewerService.getReviewersByVersionId(result.id);
    result.reviewerIds = reviewers || [];

    return result;
  }

  public async getClinicalVersion(
    user: IUserWithMetadata,
    version: string,
    analysisSetId?: string,
    checkWrite = false,
  ): Promise<IClinicalVersion> {
    const result = await this.sampleClient.getClinicalVersion(
      user,
      version,
      analysisSetId,
      checkWrite,
    );
    if (!result) {
      throw new NotFoundException(`Clinical version ${version} not found`);
    }
    result.slideTableSettings = await this.slideTableSettingsClient.getSettings(result.id);
    result.meetings = await this.meetingService.getMeetings(result.id);
    const reviewers = await this.reviewerService.getReviewersByVersionId(result.id);
    result.reviewerIds = reviewers || [];

    return result;
  }

  public async addReviewer(
    clinicalVersionId: string,
    reviewerBody: ReviewerBodyDTO,
    currentUser: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    if (!clinicalVersionId || !reviewerBody) {
      throw new BadRequestException(
        'Clinical version id and clinical reviewer id must be defined',
      );
    }

    await this.sampleClient.addReviewer(
      clinicalVersionId,
      reviewerBody,
      currentUser,
    );

    const clinicalVersion = await this.getClinicalVersion(
      currentUser,
      clinicalVersionId,
      undefined,
      true,
    );

    const entityMetadata: IZeroDashClinicalMeta = {
      analysisSetId: clinicalVersion.analysisSetId,
      patientId: clinicalVersion.patientId,
      clinicalVersionId,
    };

    const groupNameMap: Partial<Record<Group, string>> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Clinicians: 'Reviewing Clinician',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CancerGeneticists: 'Reviewing Genetic Clinician',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Curators: 'Reviewing Curator',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      MTBChairs: 'MTB Chair',
    };

    this.notificationsService.sendNotification(
      headers,
      currentUser,
      {
        type: 'CLINICAL_ASSIGNED',
        title: `${clinicalVersion.patientId}: ${groupNameMap[reviewerBody.group]} assigned`,
        description: `You have been assigned as a ${groupNameMap[reviewerBody.group]} to clinical case ${clinicalVersion.patientId} by ${currentUser.givenName} ${currentUser.familyName}`,
        entityMetadata,
        modes: reviewerBody.group === 'Curators' ? ['INTERNAL'] : ['EMAIL'],
        notifyUserIds: [reviewerBody.reviewerId],
        emailTemplate: 'ZERO_DASH',
      },
    );
  }

  public async removeReviewer(
    clinicalVersionId: string,
    group: Group,
  ): Promise<void> {
    if (!clinicalVersionId || !group) {
      throw new BadRequestException(
        'Clinical version id and user role must be defined',
      );
    }

    return this.sampleClient.removeReviewer(
      clinicalVersionId,
      group,
    );
  }

  public async updateReviewStatus(
    clinicalVersionId: string,
    updateReviewBody: UpdateReviewDTO,
    currentUser: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    if (!clinicalVersionId || !updateReviewBody) {
      throw new BadRequestException(
        'Clinical version id and clinical reviewer id must be defined',
      );
    }

    await this.sampleClient.updateReviewStatus(
      clinicalVersionId,
      updateReviewBody,
    );

    const reviews = await this.sampleClient.getClinicalReviewers(clinicalVersionId);
    const review = reviews.find((r) => r.group === updateReviewBody.group);

    const clinicalVersion = await this.getClinicalVersion(
      currentUser,
      clinicalVersionId,
      undefined,
      true,
    );

    const entityMetadata: IZeroDashClinicalMeta = {
      analysisSetId: clinicalVersion.analysisSetId,
      patientId: clinicalVersion.patientId,
      clinicalVersionId,
    };

    const groupNameMap: Partial<Record<Group, keyof IClinicalVersion>> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      MolecularOncologists: 'clinicianId',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CancerGeneticists: 'cancerGeneticistId',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Curators: 'curatorId',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      MTBChairs: 'clinicianId',
    };

    if (updateReviewBody.status === 'Ready for Review') {
      this.notificationsService.sendNotification(
        headers,
        currentUser,
        {
          type: 'CLINICAL_REVIEW',
          title: `${clinicalVersion.patientId}: Review requested`,
          description: `Your review has been requested for clinical case ${clinicalVersion.patientId} by ${currentUser.givenName} ${currentUser.familyName}`,
          entityMetadata,
          modes: updateReviewBody.group === 'Curators' ? ['INTERNAL'] : ['EMAIL'],
          notifyUserIds: [review.reviewerId],
          emailTemplate: 'ZERO_DASH',
        },
      );
    }

    if (updateReviewBody.status === 'Completed') {
      this.notificationsService.sendNotification(
        headers,
        currentUser,
        {
          type: 'CLINICAL_REVIEW',
          title: `${clinicalVersion.patientId}: Review completed`,
          description: `${currentUser.givenName} ${currentUser.familyName} has completed a review for clinical case ${clinicalVersion.patientId}`,
          entityMetadata,
          modes: updateReviewBody.group === 'Curators' ? ['INTERNAL'] : ['EMAIL'],
          notifyUserIds: groupNameMap[updateReviewBody.group]
            ? [clinicalVersion[groupNameMap[updateReviewBody.group]] as string]
            : [],
          emailTemplate: 'ZERO_DASH',
        },
      );
    }
  }

  public async getClinicalRecords(
    filters: ISampleFilters,
    user: IUserWithMetadata,
  ): Promise<ISampleData[]> {
    const samples = await this.sampleClient.getClinicalRecords(filters, user);

    // Prepare all sample addendums and meeting records
    const promises: Promise<void>[] = [];
    for (const sample of samples) {
      promises.push(
        this.meetingService.getMeetings(
          sample.clinicalVersionId,
        ).then((meetings) => {
          sample.meetings = meetings;
        }),
        this.addendumService.getAddendumsByVersionId(
          sample.clinicalVersionId,
        )
          .then((addendums) => {
            sample.addendums = addendums;
          }),
        this.sampleClient.getClinicalReviewers(sample.clinicalVersionId)
          .then((reviewers) => {
            sample.reviewerIds = reviewers;
          }),
        this.molecularAlterationsService.getMolecularAlterations(
          sample.clinicalVersionId,
          {},
        )
          .then((alterations) => {
            sample.hasGermlineFindings = alterations.some(
              (alteration) => alteration.mutationType.includes('GERMLINE'),
            );
          }),
      );
    }

    await Promise.all(promises);

    return samples;
  }

  async getClinicalRecordsCount(
    filters: ISampleFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.sampleClient.getClinicalRecordsCount(filters, user);
  }
}
