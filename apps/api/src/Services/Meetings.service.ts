import { Inject, Injectable } from '@nestjs/common';
import { MeetingsClient } from 'Clients/Meetings/Meetings.client';
import { IGetMeetingsFilters, IMeeting, IMeetingUpdateBody } from 'Models/Meetings/Meetings.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AnalysisSetsService } from './Analysis/AnalysisSets.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingsClient: MeetingsClient,
    @Inject(AnalysisSetsService) private readonly analysisSetsService: AnalysisSetsService,
  ) {}

  public async addMeetings(data: IMeetingUpdateBody): Promise<void> {
    return this.meetingsClient.addMeetings(data);
  }

  public async getMeetingsOnMonth(
    filters: IGetMeetingsFilters,
    user: IUserWithMetadata,
  ): Promise<IMeeting[]> {
    return this.meetingsClient.getMeetingsOnMonth(filters, user)
      .then(async (resp) => (
        Promise.all(
          resp.map(async (meeting) => ({
            ...meeting,
            analysisSets: filters.includeAnalysisSets
              ? await this.analysisSetsService.getAnalysisSets({
                startCuration: meeting.date,
                endCuration: meeting.date,
                includeRelatedCases: false,
              }, user) : [],
          })),
        )
      ));
  }
}
