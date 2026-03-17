import {
  Body,
  Controller, Get,
  Headers, Inject, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import {
  CreateGeneListBodyDTO, GetGeneListFiltersDTO, GetPanelReportableNotesDTO, IGeneList,
  IPanelReportableNote,
  UpdateGeneNoteDTO,
  UpdatePanelReprotableNoteDTO,
} from 'Models/GeneLists/GeneLists.model';
import { GeneListsService } from 'Services/GeneLists/GeneLists.service';

@Controller('gene-lists')
@UseGuards(AuthGuard('http-bearer'), ScopeGuard)
export class GeneListsController {
  constructor(
    @Inject(GeneListsService) private readonly geneListsService: GeneListsService,
  ) {}

  @Get()
  public async getGeneLists(
    @Query() filters: GetGeneListFiltersDTO,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<IGeneList[]> {
    return this.geneListsService.getGeneLists(filters, headers);
  }

  @Get('reportable-notes')
  @Scopes('atlas.read')
  public async getReportableNotes(
    @Query() filters: GetPanelReportableNotesDTO,
  ): Promise<IPanelReportableNote[]> {
    return this.geneListsService.getReportableNotes(filters);
  }

  @Post('reportable-notes')
  @Scopes('atlas.write')
  public async updateReportableNote(
    @Body() body: UpdatePanelReprotableNoteDTO,
  ): Promise<IPanelReportableNote> {
    return this.geneListsService.updateReportableNote(body);
  }

  @Post('gene-note')
  @Scopes('atlas.write')
  public async updateGeneNote(
    @Body() body: UpdateGeneNoteDTO,
  ): Promise<void> {
    return this.geneListsService.updateGeneNote(body);
  }

  @Get(':id')
  public async getGeneListById(
    @Param('id') id: string,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<IGeneList> {
    return this.geneListsService.getGeneListById(id, headers);
  }

  @Post()
  @Scopes('atlas.write')
  public async createGeneList(
    @Body() geneList: CreateGeneListBodyDTO,
  ): Promise<IGeneList> {
    return this.geneListsService.createGeneList(geneList);
  }
}
