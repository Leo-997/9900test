import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IEvidence } from 'Models/Evidence/Evidence.model';
import { EvidenceQueryDTO } from 'Models/Evidence/Requests/EvidenceQuery.model';
import { CreateEvidenceDTO } from 'Models/Evidence/Requests/PostEvidenceBody.model';
import { UpdateEvidenceDTO } from 'Models/Evidence/Requests/UpdateEvidenceBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { EvidenceService } from 'Services/Evidence/Evidence.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/evidence/')
export class EvidenceController {
  constructor(
    private readonly evidenceService: EvidenceService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  async getEvidence(
    @Query() query: EvidenceQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IEvidence[]> {
    return this.evidenceService.getEvidence(query, user);
  }

  @Post()
  async postEvidence(
    @Body() createEvidenceBody: CreateEvidenceDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    const canAccess = await this.accessControlService.canAccessResource(
      true,
      user,
      {
        analysisSetId: createEvidenceBody.analysisSetId,
      },
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return this.evidenceService.postEvidence(
      createEvidenceBody,
      user,
    );
  }

  @Put()
  async updateEvidenceForEntity(
    @Body() body: UpdateEvidenceDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const canAccess = !body.analysisSetId || await this.accessControlService.canAccessResource(
      true,
      user,
      {
        analysisSetId: body.analysisSetId,
      },
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return this.evidenceService.updateEvidenceForEntity(
      body,
      user,
    );
  }

  @Delete('/:evidenceId')
  async deleteEvidenceById(
    @Param('evidenceId') evidenceId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.evidenceService.deleteEvidenceById(evidenceId, user);
  }
}
