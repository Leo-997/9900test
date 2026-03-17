import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import {
  CreateEvidenceDTO, GetEvidenceQueryDTO, IEvidence, UpdateEvidenceDTO,
} from 'Models/Evidence/Evidence.model';
import { EvidenceService } from 'Services/Evidence/Evidence.service';
import { Scopes } from '../../Decorators/Scope/Scope.decorator';
import { ScopeGuard } from '../../Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from '../../Models';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/evidence')
export class EvidenceController {
  constructor(
    @Inject(EvidenceService) private evidenceService: EvidenceService,
  ) {}

  @Get()
  @Scopes('clinical.sample.read')
  public async getEvidence(
    @Query() query: GetEvidenceQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IEvidence[]> {
    return this.evidenceService.getEvidence(query, user);
  }

  @Get('count')
  @Scopes('clinical.sample.read')
  public async getEvidenceCount(
    @Query() query: GetEvidenceQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.evidenceService.getEvidenceCount(query, user);
  }

  @Get(':id')
  @Scopes('clinical.sample.read')
  public async getEvidenceById(
    @Param('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IEvidence> {
    return this.evidenceService.getEvidenceById(id, user);
  }

  @Post(':clinicalVersionId')
  public async createEvidence(
    @Body() body: CreateEvidenceDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.evidenceService.createEvidence(body, user);
  }

  @Put()
  public async updateEvidence(
    @Body() body: UpdateEvidenceDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.evidenceService.updateEvidenceForEntity(body, user);
  }
}
