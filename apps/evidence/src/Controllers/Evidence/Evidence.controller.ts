import {
    Body, Controller, Delete, Get, Param, Post, Put, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
    CreateEvidenceDTO, IEvidence, UpdateEvidenceDTO, QueryEvidenceDTO,
} from 'Models/Evidence/Evidence.model';
import { IUser } from 'Models/User/User.model';
import { EvidenceService } from 'Services/Evidence/Evidence.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard)
@Controller()
export class EvidenceController {
  constructor(
    private readonly evidenceService: EvidenceService,
  ) {}

  @Post('all')
  async getAllEvidences(
    @Body() filters: QueryEvidenceDTO,
  ): Promise<IEvidence[]> {
    return this.evidenceService.getAllEvidences(filters);
  }

  @Post('count')
  async getEvidenceCount(
    @Body() filters: QueryEvidenceDTO,
  ): Promise<number> {
    return this.evidenceService.getEvidenceCount(filters);
  }

  @Get(':id')
  async getEvidenceById(
    @Param('id') id: string,
  ): Promise<IEvidence> {
    return this.evidenceService.getEvidenceById(id);
  }

  @Post()
  async createEvidence(
    @Body() data: CreateEvidenceDTO,
    @CurrentUser() user: IUser,
  ): Promise<string> {
    return this.evidenceService.createEvidence(data, user);
  }

  @Put(':id')
  async updateEvidence(
    @Param('id') id: string,
    @Body() evidence: UpdateEvidenceDTO,
    @CurrentUser() user: IUser,
  ): Promise<string> {
    return this.evidenceService.updateEvidence(id, evidence, user);
  }

  @Delete(':id')
  async deleteEvidence(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<void> {
    return this.evidenceService.deleteEvidence(id, user);
  }
}
