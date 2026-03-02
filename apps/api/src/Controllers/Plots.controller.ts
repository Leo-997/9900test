import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { NotFoundError } from 'Errors/NotFound.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import { ResponseBody } from 'Models/Common/Common.model';
import {
  HTSCulturePlots,
  HTSDrugHitsPlots,
  ICircosPlots,
  ILinxPlot,
  IMethPlots,
  IMutSigPlots,
  IPlot,
  IQCPlots,
  IRNASeqClassifierPlots,
} from 'Models/Common/Plot.model';
import { GenerateLinxPlotBodyDTO } from 'Models/Common/Requests/GeneratePlotBody.model';
import { GetHTHitsPlotsFiltersDTO } from 'Models/Common/Requests/GetHTSPlots.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { PlotsService } from 'Services/Plots.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/plot/:biosampleId')
export class PlotsController {
  constructor(
    private readonly plotsService: PlotsService,
    private readonly authService: AuthService,
  ) {}

  @Get('linx')
  @Scopes('curation.sample.read')
  public async getLinxPlots(
    @Param('biosampleId') biosampleId: string,
  ): Promise<ILinxPlot[]> {
    return this.plotsService.getLinxPlots(biosampleId);
  }

  @Post('linx/generate')
  @Scopes('curation.sample.download')
  @IsWriteEndpoint()
  public async generateLinxPlot(
    @Param('biosampleId') biosampleId: string,
    @Body() data: GenerateLinxPlotBodyDTO,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<ResponseBody> {
    if (!data.genes && !data.chr) {
      throw new BadRequestException('IPlot cannot be generated without gene(s) or chromosome');
    }

    return this.plotsService.generateLinxPlot(biosampleId, data, headers);
  }

  @Delete('linx/delete/:fileId')
  @Scopes('curation.sample.download')
  @IsWriteEndpoint()
  public async deleteLinxPlot(
    @Param('biosampleId') biosampleId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.plotsService.deleteLinxPlot(fileId, user);
  }

  @Get('qc')
  @Scopes('curation.sample.read')
  async getQCPlots(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IQCPlots> {
    const plots = await this.plotsService.getQCPlots(biosampleId, user);

    const isEmpty = !Object.values(plots).some(
      (x) => x !== null && x !== '' && JSON.stringify(x) !== JSON.stringify({}) && x !== undefined,
    );
    if (isEmpty) {
      throw new NotFoundError(`Not Found: any plots for ${biosampleId}`);
    }

    return plots;
  }

  @Get('circos')
  @Scopes('curation.sample.read')
  async getCircosPlots(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICircosPlots> {
    const plots = await this.plotsService.getCircosPlots(biosampleId, user);

    if (plots.circos === undefined && plots.circosRaw === undefined) {
      throw new NotFoundError(`Not Found: circos plots for ${biosampleId}`);
    }

    return plots;
  }

  @Get('mutsig')
  @Scopes('curation.sample.read')
  async getMutSigPlots(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMutSigPlots> {
    const plots = await this.plotsService.getMutSigPlots(biosampleId, user);
    return plots;
  }

  @Get('meth')
  @Scopes('curation.sample.read')
  async getMethPlots(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMethPlots> {
    const plots = await this.plotsService.getMethPlots(biosampleId, user);
    return plots;
  }

  @Post('mgmt')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5000000 } }))
  @IsWriteEndpoint()
  async postMGMTplot(
    @Param('biosampleId') biosampleId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      { biosampleId },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    this.plotsService.postMGMTplot(biosampleId, file);
  }

  @Get('meth/:gene')
  @Scopes('curation.sample.read')
  async getMethGenePlot(
    @Param('biosampleId') biosampleId: string,
    @Param('gene') gene: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPlot> {
    const plotURL = await this.plotsService.getMethGenePlot(
      biosampleId,
      gene,
      user,
    );

    if (plotURL === undefined) {
      throw new NotFoundError(`Not Found: plot for ${biosampleId} and ${gene}`);
    }

    return plotURL;
  }

  @Get('rna')
  @Scopes('curation.sample.read')
  async getRNASeqClassifierPlot(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IRNASeqClassifierPlots> {
    const plotURL = await this.plotsService.getRNASeqClassifierPlot(
      biosampleId,
      user,
    );

    if (plotURL === undefined) {
      throw new NotFoundError(`Not Found: plot for ${biosampleId} classifier`);
    }

    return plotURL;
  }

  @Get('/rna/fusion/:startGene/:endGene')
  @Scopes('curation.sample.read')
  async getFusionPlot(
    @Param('biosampleId') biosampleId: string,
    @Param('startGene') startGene: string,
    @Param('endGene') endGene: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPlot> {
    const plotURL = await this.plotsService.getFusionPlot(user, biosampleId, startGene, endGene);
    if (plotURL === undefined) {
      throw new NotFoundError(`Not Found: plot for ${biosampleId} fusion between ${startGene} and ${endGene}`);
    }

    return plotURL;
  }

  @Get('/rna/:geneId')
  @Scopes('curation.sample.read')
  async getRNASeqGenePlot(
    @Param('biosampleId') biosampleId: string,
    @Param('geneId') geneId: number,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPlot> {
    const plotURL = await this.plotsService.getRNASeqGenePlot(
      biosampleId,
      geneId,
      user,
    );

    if (plotURL === undefined) {
      throw new NotFoundError(`Not Found: plot for ${biosampleId} and ${geneId}`);
    }

    return plotURL;
  }

  @Post('rna/:geneId')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5000000 } }))
  @Scopes('curation.sample.download')
  @IsWriteEndpoint()
  async postRNASeqGenePlot(
    @Param('biosampleId') biosampleId: string,
    @Param('geneId') geneId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IPlot> {
    const plotURL = await this.plotsService.postRNASeqGenePlot(
      biosampleId,
      geneId,
      file.buffer,
      file.size,
    );

    if (plotURL === undefined) {
      throw new NotFoundError(`Not Found: plot for ${biosampleId} and ${geneId}`);
    }

    return plotURL;
  }

  @Get('hts')
  @Scopes('curation.sample.read')
  public async getHTSCulturePlots(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<HTSCulturePlots> {
    return this.plotsService.getHTSCulturePlots(biosampleId, user);
  }

  @Get('hts/:drugId')
  @Scopes('curation.sample.read')
  public async getHTSCulturePlotsByDrugId(
    @Param('biosampleId') biosampleId: string,
    @Param('drugId') drugId: string,
    @Query() filters: GetHTHitsPlotsFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<HTSDrugHitsPlots> {
    return this.plotsService.getHTSDrugHitsPlots(biosampleId, drugId, filters, user);
  }
}
