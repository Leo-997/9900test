import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { IncomingHttpHeaders } from 'http';
import {
  CreateRecommendationDTO,
  CreateRecommendationLinkDTO,
  FetchRecommendationDTO,
  IFetchRecommendation,
  RecLinkEntityType,
  UpdateRecommendationDTO,
  UpdateRecommendationOrderDTO,
} from 'Models/Recommendation/Recommendation.model';
import { RecommendationService } from 'Services/Recommendation/Recommendation.service';
import { CurrentUser } from '../../Decorators/CurrentUser.decorator';
import { Scopes } from '../../Decorators/Scope/Scope.decorator';
import { ScopeGuard } from '../../Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from '../../Models';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/:clinicalVersionId/recommendations')
export class RecommendationController {
  constructor(
    @Inject(RecommendationService) private recommendationService: RecommendationService,
  ) {}

  @Get()
  @Scopes('clinical.sample.read')
  public async getAllRecommendations(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Query() { page, limit, ...filters }: FetchRecommendationDTO,
    @Headers() headers: IncomingHttpHeaders,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IFetchRecommendation[]> {
    return this.recommendationService.getAllRecommendations(
      clinicalVersionId,
      filters,
      page,
      limit,
      headers,
      user,
    );
  }

  @Get('/:recommendationId')
  @Scopes('clinical.sample.read')
  public async getRecommendationById(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('recommendationId') recommendationId: string,
    @Headers() headers: IncomingHttpHeaders,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IFetchRecommendation> {
    return this.recommendationService.getRecommendationById(
      clinicalVersionId,
      recommendationId,
      headers,
      user,
    );
  }

  @Get('/:addendumId/hts')
  @Scopes('clinical.sample.read')
  public async getRecommendationsByAddendumId(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('addendumId') addendumId: string,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<IFetchRecommendation[]> {
    return this.recommendationService.getRecommendationsByAddendumId(
      clinicalVersionId,
      addendumId,
      headers,
    );
  }

  @Post()
  @IsWriteEndpoint()
  public async createRecommendation(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() createRecommendationBody: CreateRecommendationDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.recommendationService.createRecommendation(
      clinicalVersionId,
      createRecommendationBody,
      user,
    );
  }

  @Put('/order')
  @IsWriteEndpoint()
  public async updateRecommendationOrder(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: UpdateRecommendationOrderDTO,
  ): Promise<void> {
    return this.recommendationService.updateRecommendationOrder(
      clinicalVersionId,
      body,
    );
  }

  @Put('/:recommendationId')
  @IsWriteEndpoint()
  public async updateRecommendation(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('recommendationId') recommendationId: string,
    @Body() updateRecommendationBody: UpdateRecommendationDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    return this.recommendationService.updateRecommendation(
      clinicalVersionId,
      recommendationId,
      updateRecommendationBody,
      user,
      headers,
    );
  }

  @Delete('/:recommendationId')
  @IsWriteEndpoint()
  public async deleteRecommendation(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('recommendationId') recommendationId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.recommendationService.deleteRecommendation(
      clinicalVersionId,
      recommendationId,
      user,
    );
  }

  @Delete('/drugVersion/:drugVersionId')
  @IsWriteEndpoint()
  public async deleteRecommendationsWithRejectedDrug(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('drugVersionId') drugVersionId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.recommendationService.deleteRecommendationsWithRejectedDrug(
      clinicalVersionId,
      drugVersionId,
      user,
    );
  }

  @Post('link')
  @IsWriteEndpoint()
  public async createRecommendationsLink(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: CreateRecommendationLinkDTO,
  ): Promise<void> {
    return this.recommendationService.createRecommendationLink(
      clinicalVersionId,
      body,
    );
  }

  @Delete('/:recommendationId/:entityType/:entityId')
  @IsWriteEndpoint()
  public async deleteRecommendationLink(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('recommendationId') recommendationId: string,
    @Param('entityType') entityType: RecLinkEntityType,
    @Param('entityId') entityId: string,
  ): Promise<void> {
    return this.recommendationService.deleteRecommendationLink(
      clinicalVersionId,
      recommendationId,
      entityType,
      entityId,
    );
  }
}
