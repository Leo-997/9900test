import { Knex } from 'knex';

import { Inject, Injectable } from '@nestjs/common';
import { IGetMeetingsFilters, IMeeting, IMeetingUpdateBody } from 'Models/Meetings/Meetings.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';

@Injectable()
export class MeetingsClient {
  private meetingTable = 'zcc_curation_meeting';

  private meetingSamplesTable = 'zcc_curation_meeting_samples';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async addMeetings(data: IMeetingUpdateBody): Promise<void> {
    await this.knex.transaction(async (trx) => {
      await trx
        .del()
        .from(this.meetingSamplesTable)
        .whereIn('analysis_set_id', data.analysisSets);

      if (data.date) {
        await trx
          .insert({
            date: data.date,
          })
          .into(this.meetingTable)
          .onConflict()
          .ignore();

        await trx
          .insert(
            data.analysisSets.map((set) => ({
              meeting_id: trx.select('meeting_id').from(this.meetingTable).where('date', data.date).first(),
              analysis_set_id: set,
            })),
          )
          .into(this.meetingSamplesTable)
          .onConflict()
          .ignore();
      }
    });
  }

  public async getMeetingsOnMonth(
    filters: IGetMeetingsFilters,
    user: IUserWithMetadata,
  ): Promise<IMeeting[]> {
    return this.knex
      .distinct({
        meetingId: 'meeting.meeting_id',
        date: 'meeting.date',
      })
      .from({ meeting: this.meetingTable })
      .innerJoin(
        { meetingSamples: this.meetingSamplesTable },
        'meetingSamples.meeting_id',
        'meeting.meeting_id',
      )
      .modify(withAnalysisSet, 'innerJoin', user, 'meetingSamples.analysis_set_id')
      .where(function addFilters() {
        if (filters.date && filters.window === 'month') {
          this.whereRaw(
            'MONTH(meeting.date) = MONTH(?) AND YEAR(meeting.date) = YEAR(?)',
            [filters.date, filters.date],
          );
        }

        if (filters.date && filters.window === 'day') {
          this.where('meeting.date', filters.date);
        }
      });
  }
}
