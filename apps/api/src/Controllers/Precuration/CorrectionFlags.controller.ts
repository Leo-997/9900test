import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CorrectionFlagsService } from 'Services/Precuration/CorrectionFlags.service';

import { ICorrection } from 'Models/Precuration/CorrectionFlags.model';
import { AddCorrectionFlagBodyDTO } from 'Models/Precuration/Requests/AddCorrectionFlagBody.model';
import { UpdateCorrectionFlagBodyDTO } from 'Models/Precuration/Requests/UpdateCorrectionFlagBody.model';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { BadRequestError } from 'Errors/BadRequest.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { AuthService } from 'Services/Auth/Auth.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('correction-flags')
export class CorrectionFlagsController {
  constructor(
    private readonly correctionFlagsService: CorrectionFlagsService,
    private readonly authService: AuthService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  async getAllCorrectionFlags(
    @Query('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICorrection[]> {
    return this.correctionFlagsService.getAllCorrectionFlags(analysisSetId, user);
  }

  @Post()
  async addCorrectionFlag(
    @Body() addCorrectionFlagBody: AddCorrectionFlagBodyDTO,
    @Headers() headers: IncomingHttpHeaders,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Record<'id', number>> {
    const canAccess = await this.accessControlService.canAccessResource(
      true,
      user,
      {
        analysisSetId: addCorrectionFlagBody.analysisSetId,
      },
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      { analysisSetId: addCorrectionFlagBody.analysisSetId },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    const resp = await this.correctionFlagsService.addCorrectionFlag(
      addCorrectionFlagBody,
      headers,
      user,
    );

    return resp;
  }

  @Patch('/:analysisSetId/:flagId')
  @IsWriteEndpoint()
  async updateCorrectionFlag(
    @Param('analysisSetId') analysisSetId: string,
    @Param('flagId') flagId: number,
    @Body() udpateCorrectionFlagBody: UpdateCorrectionFlagBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<{ message: string }> {
    const flag = await this.correctionFlagsService.getFlagById(flagId, user);
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      {
        analysisSetId,
      },
      user,
    ) || flag.assignedResolverId === user.id;

    if (!isAuthorised) throw new ForbiddenException();

    if (Object.values(udpateCorrectionFlagBody).every((value) => value === undefined)) {
      throw new BadRequestError('At least one value must be set to update');
    }
    const numRowsUpdated = await this.correctionFlagsService.updateCorrectionFlag(
      udpateCorrectionFlagBody,
      flagId,
      user,
      headers,
    );
    return {
      message: `${numRowsUpdated} records updated`,
    };
  }
}
