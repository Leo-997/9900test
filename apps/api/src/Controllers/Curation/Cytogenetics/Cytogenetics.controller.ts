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
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { NotFoundError } from 'Errors/NotFound.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  IAnnotations, IArmRanges, ICytobandCN, ICytogeneticsData, ISampleCytoband,
} from 'Models/Curation/Cytogenetics/Cytogenetics.model';
import { CreateCytobandBodyDTO } from 'Models/Curation/Cytogenetics/Requests/CreateCytobandBody.model';
import { GetAverageCopyNumberQueryDTO } from 'Models/Curation/Cytogenetics/Requests/GetAverageCopyNumberQueryDTO.model';
import { GetChromosomeBandsQueryDTO } from 'Models/Curation/Cytogenetics/Requests/GetChromosomeBandsQuery.model';
import { GetCytobandsQueryDTO } from 'Models/Curation/Cytogenetics/Requests/GetCytobandsQuery.model';
import { UpdateCytobandBodyDTO } from 'Models/Curation/Cytogenetics/Requests/UpdateCtyobandBody.model';
import { UpdateCytoBody } from 'Models/Curation/Cytogenetics/Requests/UpdateCytoBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { CytogeneticsService } from 'Services/Curation/Cytogenetics/Cytogenetics.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/cytogenetics')
export class CytogeneticsController {
  constructor(
    private readonly cytogeneticsService: CytogeneticsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  async getCytogeneticsData(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICytogeneticsData[]> {
    const data = await this.cytogeneticsService.getCytogeneticsData(biosampleId, user);
    return data;
  }

  @Get('genes')
  @Scopes('curation.sample.read')
  async getAnnotations(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAnnotations> {
    const data = await this.cytogeneticsService.getAnnotations(biosampleId, user);
    return data;
  }

  @Get('cytobands')
  @Scopes('curation.sample.read')
  async getCytobands(
    @Param('biosampleId') biosampleId: string,
    @Query() query: GetCytobandsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISampleCytoband[]> {
    const data = await this.cytogeneticsService.getCytobands(biosampleId, query, user);
    return data;
  }

  @Post('cytoband')
  @IsWriteEndpoint()
  async createCytoband(
    @Param('biosampleId') biosampleId: string,
    @Body() newCytobandBody: CreateCytobandBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.cytogeneticsService.createCytoband(
      biosampleId,
      newCytobandBody,
    );
  }

  @Get('chromosomeBands')
  @Scopes('curation.sample.read')
  async getChromosomeBands(
    @Query() query: GetChromosomeBandsQueryDTO,
  ): Promise<IArmRanges[]> {
    const data = await this.cytogeneticsService.getChromosomeBands(query);
    return data;
  }

  @Get('avgCopyNumber')
  @Scopes('curation.sample.read')
  async getAverageCopyNumber(
    @Param('biosampleId') biosampleId:string,
    @Query() query: GetAverageCopyNumberQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICytobandCN> {
    return this.cytogeneticsService.getAverageCopyNumber(biosampleId, query, user);
  }

  @Get('genes/:variantId')
  @Scopes('curation.sample.read')
  async getAnnotationsByChromosome(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAnnotations> {
    const data = await this.cytogeneticsService.getAnnotationsByChromosome(
      biosampleId,
      variantId,
      user,
    );
    return data;
  }

  @Get(':variantId')
  async getCytogeneticsByChromosome(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICytogeneticsData[]> {
    return this.cytogeneticsService.getCytogeneticsByChromosome(biosampleId, variantId, user);
  }

  @Put(':chr/cytoband/:cytoband')
  @IsWriteEndpoint()
  async updateCytoband(
    @Param('biosampleId') biosampleId: string,
    @Param('chr') chr: string,
    @Param('cytoband') cytoband: string,
    @Body() updateCytobandBody: UpdateCytobandBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.cytogeneticsService.updateCytoband(biosampleId, chr, cytoband, updateCytobandBody);
  }

  @Delete(':chr/cytoband/:cytoband')
  @IsWriteEndpoint()
  async deleteCytoband(
    @Param('biosampleId') biosampleId: string,
    @Param('chr') chr: string,
    @Param('cytoband') cytoband: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.cytogeneticsService.deleteCytoband(biosampleId, chr, cytoband);
  }

  @Put('update')
  @IsWriteEndpoint()
  public async updateCytogenetics(
    @Param('biosampleId') biosampleId: string,
    @Body() updatedCytoBody: UpdateCytoBody,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.cytogeneticsService.updateCytogenetics(
      biosampleId,
      updatedCytoBody,
    );

    if (numRowsUpdated) {
      return {
        message: `${numRowsUpdated} records updated`,
      };
    }

    throw new NotFoundError('Could not find cytogenetics sample to update');
  }
}
