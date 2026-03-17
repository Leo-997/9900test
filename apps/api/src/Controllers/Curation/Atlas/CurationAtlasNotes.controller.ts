import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { CurationAtlasNotesService } from 'Services/Curation/Atlas/CurationAtlasNotes.service';
import { type CurationAtlasNote, GetCurationAtlasNotesFilterDTO, UpdateCurationAtlasNoteDTO } from '@zero-dash/types';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('curation-atlas-notes')
export class CurationAtlasNotesController {
  constructor(
    private readonly curationAtlasNotesService: CurationAtlasNotesService,
  ) {}

  @Get()
  @Scopes('atlas.read')
  async getNotes(
    @Query() query: GetCurationAtlasNotesFilterDTO,
  ): Promise<CurationAtlasNote[]> {
    const data = await this.curationAtlasNotesService.getNotes(query);
    return data;
  }

  @Patch()
  @Scopes('atlas.write')
  async upsertNote(
    @Body() body: UpdateCurationAtlasNoteDTO,
  ): Promise<void> {
    await this.curationAtlasNotesService.upsertNote(body);
  }
}
