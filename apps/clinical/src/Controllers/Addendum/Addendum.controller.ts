import {
    Body, Controller, Get, Param, Post, Put, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    IAddendum,
    ICreateAddendumBodyDTO,
    IHTSDrug,
    IHTSDrugBase,
    IUpdateAddendumBodyDTO,
    IUpdateHTSDrugBodyDTO,
    IUpdateHTSDrugHitBodyDTO,
    IUpdatePastRecommendationBodyDTO,
} from 'Models/Addendum/Addendum.model';
import { AddendumService } from 'Services/Addendum/Addendum.service';
import { CurrentUser } from '../../Decorators/CurrentUser.decorator';
import {
    IUser,
} from '../../Models';

@UseGuards(AuthGuard('http-bearer'))
@Controller('addendum')
export class AddendumController {
  constructor(private readonly addendumService: AddendumService) {}

  @Get('/drug-hits/:sampleId/:htsId/:addendumId')
  public async getHTSDrugHits(
    @Param('sampleId') sampleId: string,
    @Param('htsId') htsId: string,
    @Param('addendumId') addendumId: string,
  ): Promise<IHTSDrug[]> {
    return this.addendumService.getHTSDrugHits(sampleId, htsId, addendumId);
  }

  @Get('/drug-screen/:sampleId/:htsId')
  public async getHTSDrugsScreeningData(
    @Param('sampleId') sampleId: string,
    @Param('htsId') htsId: string,
  ): Promise<IHTSDrugBase[]> {
    return this.addendumService.getHTSDrugsScreeningData(sampleId, htsId);
  }

  @Get(':clinicalVersionId/active')
  public async getActiveAddendum(
    @Param('clinicalVersionId') clinicalVersionId: string,
  ): Promise<IAddendum | null> {
    return this.addendumService.getActiveAddendum(clinicalVersionId);
  }

  @Get('/:sampleId/:htsId')
  public async getHTSDrugs(
    @Param('sampleId') sampleId: string,
    @Param('htsId') htsId: string,
  ): Promise<IHTSDrugBase[]> {
    return this.addendumService.getHTSDrugs(sampleId, htsId);
  }

  @Get(':clinicalVersionId')
  public async getAddendumsByVersionId(
    @Param('clinicalVersionId') clinicalVersionId: string,
  ): Promise<IAddendum[]> {
    return this.addendumService.getAddendumsByVersionId(clinicalVersionId);
  }

  @Post('')
  public async createAddendum(
    @Body() createAddendumBody: ICreateAddendumBodyDTO,
    @CurrentUser() currentUser: IUser,
  ): Promise<number> {
    return this.addendumService.createAddendum(createAddendumBody, currentUser);
  }

  @Put('/past-recs/:addendumId')
  public async updatePastRecommendation(
    @Param('addendumId') addendumId: string,
    @Body() updatePastRecBody: IUpdatePastRecommendationBodyDTO,
  ): Promise<number> {
    return this.addendumService.updatePastRecommendation(addendumId, updatePastRecBody);
  }

  @Put('drug-hits/:addendumId/:drugId')
  public async updateHTSDrugHit(
    @Param('addendumId') addendumId: string,
    @Param('drugId') drugId: string,
    @Body() updateHTSDrugHitBody: IUpdateHTSDrugHitBodyDTO,
  ): Promise<number> {
    return this.addendumService.updateHTSDrugHit(addendumId, drugId, updateHTSDrugHitBody);
  }

  @Put(':sampleId/:htsId/:drugId')
  public async updateHTSDrug(
    @Param('sampleId') sampleId: string,
    @Param('htsId') htsId: string,
    @Param('drugId') drugId: string,
    @Body() updateHTSDrugBody: IUpdateHTSDrugBodyDTO,
    @CurrentUser() currentUser: IUser,
  ): Promise<number> {
    return this.addendumService.updateHTSDrug(
      sampleId,
      htsId,
      drugId,
      updateHTSDrugBody,
      currentUser,
    );
  }

  @Put('/:addendumId')
  public async updateAddendum(
    @Param('addendumId') addendumId: string,
    @Body() updateAddendumBody: IUpdateAddendumBodyDTO,
    @CurrentUser() currentUser: IUser,
  ): Promise<number> {
    return this.addendumService.updateAddendum(addendumId, updateAddendumBody, currentUser);
  }
}
