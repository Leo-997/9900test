import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  ClassifierVersionFiltersDTO,
  type IClassifierVersion,
  UpdateClassifierBodyDTO,
} from 'Models/Curation/Classifiers/Classifiers.model';
import {
  GetMethGroupQueryDTO,
  IClassifierGroup,
} from 'Models/Curation/Methylation/Methylation.model';
import { MethylationService } from 'Services/Curation/Methylation/Methylation.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('methylation-classifiers')
export class MethylationClassifiersController {
  constructor(
    private readonly methylationService: MethylationService,
  ) {}

  @Get()
  @Scopes('curation.sample.read', 'atlas.read')
  async getClassifiers(
    @Query() query: ClassifierVersionFiltersDTO,
  ): Promise<IClassifierVersion[]> {
    const data = await this.methylationService.getClassifiers(query);
    return data;
  }

  @Patch(':classifierId')
  @Scopes('atlas.write')
  updateClassifierNote(
    @Param('classifierId') classifierId: string,
    @Body() body: UpdateClassifierBodyDTO,
  ): Promise<void> {
    return this.methylationService.updateClassifier(classifierId, body);
  }

  @Get('groups')
  @Scopes('curation.sample.read')
  async getClassifierGroups(
    @Query() filters: GetMethGroupQueryDTO,
  ): Promise<IClassifierGroup[]> {
    const data = await this.methylationService.getClassifierGroups(filters);
    return data;
  }
}
