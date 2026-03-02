import { Inject, Injectable } from '@nestjs/common';

import { CorrectionFlagsClient } from 'Clients/Precuration/CorrectionFlags.client';
import { correctionReasons } from 'Constants/CorrectionFlags/CorrectionFlags.constant';
import { NotFoundError } from 'Errors/NotFound.error';
import { ICorrection } from 'Models/Precuration/CorrectionFlags.model';
import { IAddCorrectionFlagBody } from 'Models/Precuration/Requests/AddCorrectionFlagBody.model';
import { UpdateCorrectionFlagBodyDTO } from 'Models/Precuration/Requests/UpdateCorrectionFlagBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AnalysisSetsService } from 'Services/Analysis/AnalysisSets.service';
import { NotificationsService } from 'Services/Notifications/Notifications.service';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class CorrectionFlagsService {
  constructor(
    @Inject(CorrectionFlagsClient) private readonly correctionFlagsClient: CorrectionFlagsClient,
    @Inject(AnalysisSetsService) private readonly analysisSetsService: AnalysisSetsService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
  ) {}

  public async getAllCorrectionFlags(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<ICorrection[]> {
    return this.correctionFlagsClient.getAllCorrectionFlags(analysisSetId, user);
  }

  public async getFlagById(
    id: number,
    user: IUserWithMetadata,
  ): Promise<ICorrection> {
    return this.correctionFlagsClient.getFlagById(id, user);
  }

  public async addCorrectionFlag(
    flagData: IAddCorrectionFlagBody,
    headers: IncomingHttpHeaders,
    user: IUserWithMetadata,
  ): Promise<Record<'id', number>> {
    const resp = await this.correctionFlagsClient.addCorrectionFlag(
      flagData,
      user,
    );

    const analysisSet = await this.analysisSetsService.getAnalysisSetById(
      flagData.analysisSetId,
      user,
    );

    if (analysisSet) {
      this.notificationsService.sendNotification(
        headers,
        user,
        {
          type: 'FLAG_CREATED',
          title: `New flag for correction created by ${user.givenName} ${user.familyName} for ${analysisSet.patientId}`,
          description: flagData.reasonNote,
          entityMetadata: {
            analysisSetId: flagData.analysisSetId,
            patientId: analysisSet.patientId,
            assignedResolverId: flagData.assignedResolverId,
            reason: correctionReasons[flagData.reason],
          },
          modes: ['SLACK_CHANNEL'],
          notifyUserIds: [flagData.assignedResolverId],
          slackChannel: 'zerodash-flags',
          slackTemplate: 'ZERO_DASH_FLAG',
        },
      );
    }

    return resp;
  }

  public async updateCorrectionFlag(
    flagFieldsToUpdate: UpdateCorrectionFlagBodyDTO,
    flagId: number,
    user: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<number> {
    const numRowsUpdated = await this.correctionFlagsClient.updateCorrectionFlag(
      flagFieldsToUpdate,
      flagId,
      user,
    );

    const flag = await this.getFlagById(flagId, user);
    const analysisSet = await this.analysisSetsService.getAnalysisSetById(flag.analysisSetId, user);

    if (analysisSet && flagFieldsToUpdate.isCorrected) {
      this.notificationsService.sendNotification(
        headers,
        user,
        {
          type: 'FLAG_RESOLVED',
          title: `${analysisSet.patientId}: Flag resolved`,
          description: flag.correctionNote,
          entityMetadata: {
            analysisSetId: analysisSet.analysisSetId,
            patientId: analysisSet.patientId,
            assignedResolverId: flag.assignedResolverId,
            reason: correctionReasons[flag.reason],
          },
          modes: ['INTERNAL'],
          notifyUserIds: [analysisSet.primaryCuratorId],
        },
      );
    }

    if (numRowsUpdated) return numRowsUpdated;

    throw new NotFoundError(
      'Could not find patient id and sample id to update',
    );
  }
}
