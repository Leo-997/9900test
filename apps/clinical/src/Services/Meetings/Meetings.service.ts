import {
  BadRequestException, forwardRef, Inject, Injectable,
} from '@nestjs/common';
import { MeetingsClient } from 'Clients/Meetings/Meetings.client';
import { IncomingHttpHeaders } from 'http';
import { ISampleData, IUserWithMetadata } from 'Models';
import {
  IAssignMultipleMeetingsBody,
  IClinicalMeeting,
  IUpdateMeetingChairBody,
  IUpdateMeetingDashboardChairBody,
  IUpdateMeetingDateBody,
} from 'Models/Meetings/Meetings.model';
import { SampleService } from '../Sample/Sample.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingsClient: MeetingsClient,
    @Inject(forwardRef(() => SampleService))
    private readonly sampleService: SampleService,
  ) {}

  public async getMeetings(
    clinicalVersionId: string,
  ): Promise<IClinicalMeeting[]> {
    return this.meetingsClient.getMeetings(clinicalVersionId);
  }

  public async getMeetingDashboardChair(
    date: string | null,
  ): Promise<string> {
    return this.meetingsClient.getMeetingDashboardChair(date);
  }

  public async getMeetingDashboardSamples(
    date: string | null,
    page: number,
    limit: number,
    currentUser: IUserWithMetadata,
  ): Promise<ISampleData[]> {
    return this.sampleService.getClinicalRecords(
      {
        startMtb: date,
        endMtb: date,
        startHts: date,
        endHts: date,
        sortColumns: ['Patient ID'],
        sortDirections: ['asc'],
        page,
        limit,
      },
      currentUser,
    );
  }

  public async getMeetingsInSameMonth(
    date: string,
    currentUser: IUserWithMetadata,
  ): Promise<string[]> {
    return this.meetingsClient.getMeetingsInSameMonth(date, currentUser);
  }

  public async updateMeetingDate(
    clinicalVersionId: string,
    body: IUpdateMeetingDateBody,
  ): Promise<void> {
    return this.meetingsClient.updateMeetingDate(clinicalVersionId, body);
  }

  public async updateMeetingChair(
    clinicalVersionId: string,
    body: IUpdateMeetingChairBody,
    currentUser: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    this.meetingsClient.updateMeetingChair(clinicalVersionId, body);

    if (body.type === 'MTB') {
      await this.sampleService.removeReviewer(
        clinicalVersionId,
        'MTBChairs',
      );

      if (body.chairId) {
        await this.sampleService.addReviewer(
          clinicalVersionId,
          {
            group: 'MTBChairs',
            reviewerId: body.chairId,
          },
          currentUser,
          headers,
        );
      }
    }
  }

  public async updateMeetingDashboardChair(
    body: IUpdateMeetingDashboardChairBody,
    currentUser: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    // update dashboard chair of a clinical meeting
    const samplesToUpdateChair = await this.meetingsClient.updateMeetingDashboardChair(body);

    // update all samples that linked to that meeting
    await Promise.all(samplesToUpdateChair.map(
      async ({ clinicalVersionId, type }) => this.updateMeetingChair(
        clinicalVersionId,
        {
          type,
          chairId: body.chairId,
        },
        currentUser,
        headers,
      ),
    ));
  }

  public async updateMultipleMeetingSamples(
    user: IUserWithMetadata,
    {
      clinicalVersions,
      ...body
    }: IAssignMultipleMeetingsBody,
  ): Promise<void[]> {
    const versions = await Promise.all(
      clinicalVersions.map((v) => this.sampleService.getClinicalVersion(user, v, undefined, true)),
    );

    if (versions.length !== clinicalVersions.length) {
      throw new BadRequestException('Could not update versions with the provided IDs');
    }

    return Promise.all(clinicalVersions.map(
      (clinicalVersion) => this.updateMeetingDate(clinicalVersion, body),
    ));
  }
}
