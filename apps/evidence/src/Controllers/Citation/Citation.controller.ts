import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
    ICitation, UpdateCitationDTO, QueryCitationDTO,
    IExternalCitation,
    GetExternalCitationDTO,
} from 'Models/Citation/Citation.model';
import { IUser } from 'Models/User/User.model';
import { CitationService } from 'Services/Citation/Citation.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard)
@Controller('/citation')
export class CitationController {
  constructor(
    private readonly citationService: CitationService,
  ) {}

  @Post('all')
  async getAllCitations(
    @Body() filters: QueryCitationDTO,
  ): Promise<ICitation[]> {
    return this.citationService.getAllCitations(filters);
  }

  @Get('external')
  async getExternalCitation(
    @Query() query: GetExternalCitationDTO,
  ): Promise<IExternalCitation> {
    const { source, externalId } = query;
    try {
      if (source === 'PMC') {
        return await this.citationService.getPubMedCentralCitation(externalId);
      }

      return await this.citationService.getPubMedCitation(externalId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Error fetching PubMed citation:', error.response?.data || error.message || error);
      throw new InternalServerErrorException('Failed to fetch citation data from PubMed');
    }
  }

  @Get(':id')
  async getCitationById(
    @Param('id') id: string,
  ): Promise<ICitation> {
    return this.citationService.getCitationById(id);
  }

  @Put(':id')
  async updateCitation(
    @Param('id') id: string,
    @Body() citation: UpdateCitationDTO,
    @CurrentUser() user: IUser,
  ): Promise<string> {
    return this.citationService.updateCitation(id, citation, user);
  }

  @Delete(':id')
  async deleteCitation(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<void> {
    return this.citationService.deleteCitation(id, user);
  }
}
