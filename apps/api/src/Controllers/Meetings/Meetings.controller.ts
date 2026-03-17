import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { GetMeetingsFilters, IMeeting, MeetingUpdateBodyDTO } from 'Models/Meetings/Meetings.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { MeetingsService } from 'Services/Meetings.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/meetings')
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Post()
  @Scopes('curation.sample.write')
  async addMeeting(
    @Body() data: MeetingUpdateBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const canAccess = await Promise.all(
      data.analysisSets.map(async (analysisSetId) => (
        this.accessControlService.canAccessResource(
          true,
          user,
          {
            analysisSetId,
          },
        )
      )),
    );
    if (canAccess.some((access) => !access)) {
      throw new ForbiddenException();
    }
    await this.meetingsService.addMeetings(data);
  }

  @Get('/month')
  @Scopes('curation.sample.read')
  async getMeetingsOnMonth(
    @Query() filters: GetMeetingsFilters,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMeeting[]> {
    return this.meetingsService.getMeetingsOnMonth(filters, user);
  }
}
