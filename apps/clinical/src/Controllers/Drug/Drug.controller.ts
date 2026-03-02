import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { IncomingHttpHeaders } from 'http';
import { Scopes } from '../../Decorators/Scope/Scope.decorator';
import { ScopeGuard } from '../../Guards/Scope/ScopeGuard.guard';
import {
  DowngradeClinicalDrugVersionDTO,
  DrugBaseBodyDTO,
  DrugFiltersDTO,
  IReportDrug,
  UpdateDrugBodyDTO,
} from '../../Models';
import { DrugService } from '../../Services';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller(':clinicalVersionId/drug')
export class DrugController {
  constructor(
    private readonly drugService: DrugService,
  ) {}

  @Get('/detailed')
  @Scopes('clinical.sample.read')
  public async getDetailedReportDrugs(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Query() filters: DrugFiltersDTO,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<IReportDrug[]> {
    return this.drugService.getDetailedReportDrugs(clinicalVersionId, filters, headers);
  }

  @Post()
  @IsWriteEndpoint()
  public async addReportDrug(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() createDrugBody: DrugBaseBodyDTO,
  ): Promise<string> {
    return this.drugService.addReportDrug(
      clinicalVersionId,
      createDrugBody,
    );
  }

  @Patch('/downgrade')
  @IsWriteEndpoint()
  public async downgradeClinicalDrugVersion(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: DowngradeClinicalDrugVersionDTO,
  ): Promise<void> {
    return this.drugService.downgradeClinicalDrugVersion(
      clinicalVersionId,
      body,
    );
  }

  @Patch(':drugId')
  @IsWriteEndpoint()
  public async updateReportDrug(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('drugId') drugId: string,
    @Body() body: UpdateDrugBodyDTO,
  ): Promise<void> {
    await this.drugService.updateReportDrug(
      clinicalVersionId,
      drugId,
      body,
    );
  }

  @Delete(':drugId')
  @IsWriteEndpoint()
  public async deleteReportDrug(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('drugId') drugId: string,
  ): Promise<void> {
    await this.drugService.deleteReportDrug(
      clinicalVersionId,
      drugId,
    );
  }
}
