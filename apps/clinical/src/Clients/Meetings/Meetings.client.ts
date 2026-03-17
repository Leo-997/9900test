import { Knex } from 'knex';

import { Inject, Injectable } from '@nestjs/common';
import {
  IClinicalMeeting,
  IUpdateMeetingChairBody,
  IUpdateMeetingDashboardChairBody,
  IUpdateMeetingDateBody,
  IUpdateSampleChair,
} from 'Models/Meetings/Meetings.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withClinicalVersion } from 'Utils/Query/accessControl/withClinicalVersions.util';
import { IUserWithMetadata } from 'Models/index';

@Injectable()
export class MeetingsClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private meetingsTable = 'zcc_clinical_meetings';

  private meetingVersionXrefTable = 'zcc_clinical_meeting_version_xref';

  public async getMeetings(
    clinicalVersionId: string,
  ): Promise<IClinicalMeeting[]> {
    return this.knex
      .select({
        type: 'xref.type',
        chairId: 'xref.chair_id',
        date: 'meeting.date',
      })
      .from({ xref: this.meetingVersionXrefTable })
      .innerJoin({ meeting: this.meetingsTable }, 'meeting.id', 'xref.meeting_id')
      .where('xref.clinical_version_id', clinicalVersionId);
  }

  public async getMeetingDashboardChair(
    date: string | null,
  ): Promise<string> {
    const result = await this.knex
      .select('chair_id')
      .from(this.meetingsTable)
      .where('date', date)
      .first();

    return result?.chair_id ?? null;
  }

  public async getMeetingsInSameMonth(
    date: string,
    user: IUserWithMetadata,
  ): Promise<string[]> {
    return this.knex
      .select('date')
      .from({ m: this.meetingsTable })
      .whereRaw(
        'extract(month from date) = extract(month from ?)',
        [date],
      )
      .whereExists(function hasMeetingSamples() {
        this.select('*')
          .from({ xref: 'zcc_clinical_meeting_version_xref' })
          .modify(withClinicalVersion, 'innerJoin', user, 'xref.clinical_version_id')
          .whereRaw('xref.meeting_id = m.id');
      })
      .pluck('date');
  }

  public async updateMeetingDashboardChair({
    chairId,
    date,
  }: IUpdateMeetingDashboardChairBody): Promise<IUpdateSampleChair[]> {
    await this.knex
      .update({
        chair_id: chairId,
      })
      .from(this.meetingsTable)
      .where('date', date);

    return this.knex
      .select({
        clinicalVersionId: 'xref.clinical_version_id',
        type: 'xref.type',
      })
      .from({ xref: 'zcc_clinical_meeting_version_xref' })
      .leftJoin({ meetings: 'zcc_clinical_meetings' }, 'xref.meeting_id', 'meetings.id')
      .where('meetings.date', date);
  }

  public async updateMeetingChair(
    clinicalVersionId: string,
    {
      chairId,
      type,
    }: IUpdateMeetingChairBody,
  ): Promise<void> {
    await this.knex
      .update({ chair_id: chairId })
      .from(this.meetingVersionXrefTable)
      .where('clinical_version_id', clinicalVersionId)
      .andWhere('type', type);
  }

  public async updateMeetingDate(
    clinicalVersionId: string,
    {
      date,
      type,
    }: IUpdateMeetingDateBody,
  ): Promise<void> {
    return this.knex.transaction(async (trx) => {
      // delete xref records that link current version
      // to any previous of the same type
      await trx
        .delete()
        .from(this.meetingVersionXrefTable)
        .where('clinical_version_id', clinicalVersionId)
        .andWhere('type', type);

      if (date) {
        // insert a new meeting in the meeting table
        // with the same type as requested if it
        // does not already exist
        await trx
          .insert({ date })
          .into(this.meetingsTable)
          .onConflict()
          .ignore();

        // insert new xref record for the new date
        await trx
          .insert({
            meeting_id: trx
              .select('id')
              .from(this.meetingsTable)
              .where('date', date)
              .first(),
            clinical_version_id: clinicalVersionId,
            type,
          })
          .into(this.meetingVersionXrefTable);
      }
    });
  }
}
