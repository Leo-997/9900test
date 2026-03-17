import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  IRnaClassifierVersion,
  RnaClassifierVersionFiltersDTO,
  UpdateRnaClassifierBodyDTO,
} from 'Models/Curation/RNA/RnaClassifier.model';
import { RnaService } from 'Services/Curation/RNA/RNA.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('rna-classifiers')
export class RnaClassifiersController {
  constructor(
    private readonly rnaService: RnaService,
  ) {}

  @Get()
  @Scopes('curation.sample.read', 'atlas.read')
  async getClassifiers(
    @Query() query: RnaClassifierVersionFiltersDTO,
  ): Promise<IRnaClassifierVersion[]> {
    const data = await this.rnaService.getRnaClassifiers(query);
    return data;
  }

  @Patch(':classifierId')
  @Scopes('atlas.write')
  updateClassifierNote(
    @Param('classifierId') classifierId: string,
    @Body() body: UpdateRnaClassifierBodyDTO,
  ): Promise<void> {
    return this.rnaService.updateRnaClassifierNote(classifierId, body);
  }
}
