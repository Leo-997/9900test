import {
  BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GenesService } from 'Services/Curation/Genes/Genes.service';

import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  IExtendedGene, IFilteredGenes, IGene, IGeneList,
} from 'Models/Curation/Genes/Gene.model';
import { AddGeneListBodyDTO } from 'Models/Curation/Genes/Requests/AddGeneListBody.model';
import {
  GetAllGeneListsQueryDTO,
  GetAllGenesQueryDTO,
  GetFilteredGenesQueryDTO,
  GetGenesByIdsQueryDTO,
  IGetAllGenesQuery,
} from 'Models/Curation/Genes/Requests/GetAllGenesQuery.model';
import { IUser } from 'Models/Users/Users.model';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller()
export class GenesController {
  constructor(private readonly genesService: GenesService) {}

  @Get('genes')
  @Scopes('curation.sample.read')
  async getGenes(
    @Query() { page, limit, ...filters }: GetAllGenesQueryDTO,
  ): Promise<IGetAllGenesQuery[]> {
    return this.genesService.getGenes(filters, page, limit);
  }

  @Get('genes/:geneId')
  @Scopes('curation.sample.read')
  async getGene(
    @Param('geneId') geneId: number,
  ): Promise<IExtendedGene> {
    return this.genesService.getGene(geneId);
  }

  @Get('filtered_genes')
  @Scopes('curation.sample.read')
  async getFilteredGenes(
    @Query() { genes }: GetFilteredGenesQueryDTO,
  ): Promise<IFilteredGenes> {
    return this.genesService.getFilteredGenes(genes);
  }

  @Get('gene_lists')
  @Scopes('curation.sample.read')
  async getGeneLists(
    @Query() { page, limit, ...filters }: GetAllGeneListsQueryDTO,
  ): Promise<IGeneList[]> {
    return this.genesService.getGeneLists(filters, page, limit);
  }

  @Post('gene_list')
  @Scopes('curation.gene.list.write')
  async addGeneList(
    @Body() addGeneListBody: AddGeneListBodyDTO,
    @CurrentUser() user: IUser,
  ): Promise<{ message: string }> {
    const { listName, genes } = addGeneListBody;
    if (!listName) {
      throw new BadRequestException('List must have a name');
    }

    if (!genes || genes.length === 0) {
      throw new BadRequestException('Gene list must not be empty');
    }

    await this.genesService.addGeneList(addGeneListBody, user);

    return {
      message: 'New list added',
    };
  }

  @Post('genes')
  @Scopes('curation.sample.read')
  async getGenesByIds(
    @Body() filters: GetGenesByIdsQueryDTO,
  ): Promise<IGene[]> {
    return this.genesService.getGenesByIds(filters);
  }
}
