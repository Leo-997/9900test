import {
  Body, Controller, ForbiddenException, Get, Param, Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PrecurationValidationService } from 'Services/Precuration/PrecurationValidation.service';

import { UpdateAcknowledgementDTO } from 'Models/Precuration/Requests/UpdatePrecurationValidationBody.model';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { BadRequestError } from 'Errors/BadRequest.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('validation/:analysisSetId')
export class PrecurationValidationController {
  constructor(
    private readonly precurationValidationService: PrecurationValidationService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  async checkWarningAcknowledgement(
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<boolean> {
    return this.precurationValidationService.checkWarningAcknowledgement(
      analysisSetId,
      user,
    );
  }

  @Post()
  @IsWriteEndpoint()
  async addWarningAcknowledgement(
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
    @Body() acknowledgementBody: UpdateAcknowledgementDTO,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      { analysisSetId },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    if (
      acknowledgementBody.contaminationNote === undefined
      || acknowledgementBody.statusNote === undefined
    ) {
      throw new BadRequestError('Note cannot be undefined');
    }

    await this.precurationValidationService.addWarningAcknowledgement(
      analysisSetId,
      user.id,
      acknowledgementBody,
    );
  }
}
