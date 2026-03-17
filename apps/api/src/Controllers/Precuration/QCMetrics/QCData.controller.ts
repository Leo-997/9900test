import {
  Controller, Get, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  IImmunoprofile,
  IRNASeqMetrics,
  ISeqMetrics,
} from 'Models/Precuration/QCData.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { QCDataService } from 'Services/Precuration/QCMetrics/QCData.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('qcdata/:biosampleId')
export class QCDataController {
  constructor(private readonly qcDataService: QCDataService) {}

  @Get('metrics')
  @Scopes('curation.sample.read')
  async getMetricsData(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISeqMetrics> {
    return this.qcDataService.getMetricsData(biosampleId, user);
  }

  @Get('rnaseq-metrics')
  @Scopes('curation.sample.read')
  async getRNASeqMetrics(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata
  ): Promise<IRNASeqMetrics> {
    return this.qcDataService.getRNASeqMetrics(biosampleId, user);
  }

  @Get('immunoprofile')
  @Scopes('curation.sample.read')
  async getImmunoprofile(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IImmunoprofile> {
    return this.qcDataService.getImmunoprofile(biosampleId, user);
  }

  @Get('report')
  @Scopes('curation.sample.read')
  async getReportLink(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    const data = await this.qcDataService.getReportLink(biosampleId, user);
    return data;
  }
}
