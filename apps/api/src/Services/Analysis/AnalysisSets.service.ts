import {
  BadRequestException, Inject, Injectable,
} from '@nestjs/common';
import { AnalysisSetsClient } from 'Clients/Analysis/AnalysisSets.client';
import { IncomingHttpHeaders } from 'http';
import {
  DiagnosisFilters,
  IAnalysisPatient, IAnalysisSet, IAnalysisSetFilters, ICurationSummary,
  IDiagnosisOptionCombination,
  IMolecularConfirmation,
  ITriggerExportBody, IUpdateAnalysisSetBody, IUpdateCurationSummaryBody,
  UpdateMolecularConfirmationBody,
} from 'Models/Analysis/AnalysisSets.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { NotificationsService } from 'Services/Notifications/Notifications.service';
import { BiosamplesService } from './Biosamples.service';

@Injectable()
export class AnalysisSetsService {
  constructor(
    @Inject(AnalysisSetsClient) private readonly analysisSetsClient: AnalysisSetsClient,
    @Inject(BiosamplesService) private readonly biosamplesService: BiosamplesService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
  ) {}

  public async getAnalysisSets(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<IAnalysisSet[]> {
    const sets = await this.analysisSetsClient.getAnalysisSets(filters, user);

    return Promise.all(sets.map(async (set) => ({
      ...set,
      biosamples: filters.includeBiosamples ?? true
        ? await this.biosamplesService.getBiosamples(
          { analysisSetId: set.analysisSetId },
          user,
        ) : undefined,
      relatedCases: filters.includeRelatedCases
        ? await this.getAnalysisSets({
          publicSubjectId: set.publicSubjectId,
          includeRelatedCases: false,
        }, user).then((resp) => resp.filter((a) => a.analysisSetId !== set.analysisSetId))
        : undefined,
    })));
  }

  public async getAnalysisPatients(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<IAnalysisPatient[]> {
    const patients = await this.analysisSetsClient.getAnalysisSetPatients(filters, user);

    if (filters.enrolledOnlyCases || filters.withdrawnCases) {
      return patients.map((patient) => ({
        ...patient,
        analysisSets: [],
      }));
    }

    return Promise.all(patients.map(async (patient) => ({
      ...patient,
      analysisSets: await this.getAnalysisSets({
        publicSubjectId: patient.publicSubjectId,
        externalAssignedCases: filters.externalAssignedCases,
      }, user),
    })));
  }

  public async getAnalysisPatientsCount(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.analysisSetsClient.getAnalysisPatientsCount({ ...filters }, user);
  }

  public async getAnalysisSetsCount(
    filters: IAnalysisSetFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.analysisSetsClient.getAnalysisSetsCount({ ...filters }, user);
  }

  public async getAllStudies(user: IUserWithMetadata): Promise<string[]> {
    return this.analysisSetsClient.getAllStudies(user);
  }

  public async getZero2Categories(
    user: IUserWithMetadata,
    filters: DiagnosisFilters = {},
  ): Promise<string[]> {
    return this.analysisSetsClient.getZero2Categories(user, filters);
  }

  public async getZero2Subcategory1(
    user: IUserWithMetadata,
    filters: DiagnosisFilters = {},
  ): Promise<string[]> {
    return this.analysisSetsClient.getZero2Subcategory1(user, filters);
  }

  public async getZero2Subcategory2(
    user: IUserWithMetadata,
    filters: DiagnosisFilters = {},
  ): Promise<string[]> {
    return this.analysisSetsClient.getZero2Subcategory2(user, filters);
  }

  public async getZero2FinalDiagnosis(
    user: IUserWithMetadata,
    filters: DiagnosisFilters = {},
  ): Promise<string[]> {
    return this.analysisSetsClient.getZero2FinalDiagnosis(user, filters);
  }

  public async getZero2DiagnosisOptionCombinations(
    user: IUserWithMetadata,
  ): Promise<IDiagnosisOptionCombination[]> {
    return this.analysisSetsClient.getZero2DiagnosisOptionCombinations(
      user,
    );
  }

  public async getAnalysisSetById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<IAnalysisSet> {
    const set = await this.analysisSetsClient.getAnalysisSetById(id, user);
    if (set) {
      return {
        ...set,
        biosamples: await this.biosamplesService.getBiosamples(
          { analysisSetId: set.analysisSetId },
          user,
        ),
      };
    }

    return null;
  }

  public async updateAnalysisSetById(
    id: string,
    body: IUpdateAnalysisSetBody,
    user: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property needs to be set for update');
    }

    try {
      await this.analysisSetsClient.updateAnalysisSetById(id, body, user);
      const analysisSet = await this.getAnalysisSetById(id, user);

      const entityMetadata = {
        analysisSetId: analysisSet.analysisSetId,
        patientId: analysisSet.patientId,
      };

      if (body.curationStatus === 'Ready to Start') {
        this.notificationsService.sendNotification(
          headers,
          user,
          {
            type: 'CURATION_READY',
            title: `${analysisSet.patientId}: Ready to start`,
            description: `Case ${analysisSet.patientId} has been marked as 'Ready to start' by ${user.givenName} ${user.familyName}`,
            entityMetadata,
            modes: ['INTERNAL'],
            notifyUserIds: [analysisSet.primaryCuratorId],
          },
        );
      }

      if (body.primaryCuratorId) {
        this.notificationsService.sendNotification(
          headers,
          user,
          {
            type: 'CURATION_ASSIGNED',
            title: `${analysisSet.patientId}: Primary curator assigned`,
            description: `You have been assigned as a primary curator to case ${analysisSet.patientId} by ${user.givenName} ${user.familyName}`,
            entityMetadata,
            modes: ['INTERNAL'],
            notifyUserIds: [analysisSet.primaryCuratorId],
          },
        );
      }

      if (body.secondaryCuratorId) {
        this.notificationsService.sendNotification(
          headers,
          user,
          {
            type: 'CURATION_ASSIGNED',
            title: `${analysisSet.patientId}: Secondary curator assigned`,
            description: `You have been assigned as a secondary curator to case ${analysisSet.patientId} by ${user.givenName} ${user.familyName}`,
            entityMetadata,
            modes: ['INTERNAL'],
            notifyUserIds: [analysisSet.secondaryCuratorId],
          },
        );
      }

      if (body.secondaryCurationStatus === 'Ready for Review') {
        this.notificationsService.sendNotification(
          headers,
          user,
          {
            type: 'CURATION_REVIEW',
            title: `${analysisSet.patientId}: Ready for review`,
            description: `${user.givenName} ${user.familyName} has requested your review for case ${analysisSet.patientId}`,
            entityMetadata,
            modes: ['INTERNAL'],
            notifyUserIds: [analysisSet.secondaryCuratorId],
          },
        );
      }

      if (body.secondaryCurationStatus === 'Completed') {
        this.notificationsService.sendNotification(
          headers,
          user,
          {
            type: 'CURATION_REVIEW',
            title: `${analysisSet.patientId}: Review completed`,
            description: `${user.givenName} ${user.familyName} has completed the review for case ${analysisSet.patientId}`,
            entityMetadata,
            modes: ['INTERNAL'],
            notifyUserIds: [analysisSet.primaryCuratorId],
          },
        );
      }
    } catch {
      throw new BadRequestException('Could not update analysis set with the provided details, please try again');
    }
  }

  public async getSummaries(
    analysisSetId: string,
    uesr: IUserWithMetadata,
  ): Promise<ICurationSummary[]> {
    return this.analysisSetsClient.getSummaries(analysisSetId, uesr);
  }

  public async updateSummary(
    analysisSetId: string,
    body: IUpdateCurationSummaryBody,
  ): Promise<void> {
    await this.analysisSetsClient.updateSummary(analysisSetId, body);
  }

  public async triggerExport(
    analysisSetId: string,
    body: ITriggerExportBody,
  ): Promise<void> {
    await this.analysisSetsClient.triggerExport(analysisSetId, body);
  }

  public async getMolecularConfirmation(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<IMolecularConfirmation> {
    return this.analysisSetsClient.getMolecularConfirmation(analysisSetId, user);
  }

  public async updateMolecularConfirmation(
    analysisSetId: string,
    body: UpdateMolecularConfirmationBody,
  ): Promise<void> {
    await this.analysisSetsClient.updateMolecularConfirmation(analysisSetId, body);
  }
}
