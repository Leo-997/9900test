import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import { ISampleData, IUserWithMetadata } from 'Models';
import {
  AssignMultipleMeetingsBodyDTO,
  DateQueryDTO,
  FetchSamplesDTO,
  UpdateMeetingChairBodyDTO,
  UpdateMeetingDashboardChairBodyDTO,
  UpdateMeetingDateBodyDTO,
} from 'Models/Meetings/Meetings.model';
import { MeetingsService } from 'Services/Meetings/Meetings.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/meetings')
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
  ) {}

  @Get('/chair')
  @Scopes('clinical.sample.read')
  async getMeetingDashboardChair(
    @Query() { date }: DateQueryDTO,
  ): Promise<string> {
    return this.meetingsService.getMeetingDashboardChair(date);
  }

  @Get('/records')
  @Scopes('clinical.sample.read')
  async getMeetingDashboardSamples(
    @Query() { page, limit, date }: FetchSamplesDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<ISampleData[]> {
    return this.meetingsService.getMeetingDashboardSamples(
      date,
      page,
      limit,
      currentUser,
    );
  }

  @Get('/month')
  @Scopes('clinical.sample.read')
  async getMeetingsInSameMonth(
    @Query() { date } : DateQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string[]> {
    return this.meetingsService.getMeetingsInSameMonth(date, user);
  }

  @Put('/multiple')
  @Scopes('clinical.sample.write')
  async assignMultipleMeetings(
    @Body() data: AssignMultipleMeetingsBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void[]> {
    return this.meetingsService.updateMultipleMeetingSamples(user, data);
  }

  @Put('/chair')
  @Scopes('clinical.sample.write')
  async updateMeetingDashboardChair(
    @Body() body: UpdateMeetingDashboardChairBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    return this.meetingsService.updateMeetingDashboardChair(body, currentUser, headers);
  }

  @Put('/:clinicalVersionId/date')
  @Scopes('clinical.sample.write')
  async updateMeetingDate(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: UpdateMeetingDateBodyDTO,
  ): Promise<void> {
    return this.meetingsService.updateMeetingDate(clinicalVersionId, body);
  }

  @Put('/:clinicalVersionId/chair')
  @Scopes('clinical.sample.write')
  async updateMeetingChair(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: UpdateMeetingChairBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    return this.meetingsService.updateMeetingChair(
      clinicalVersionId,
      body,
      currentUser,
      headers,
    );
  }
}
