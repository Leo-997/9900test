import {
    BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { UpdateResourceDTO, QueryResourceDTO, IResource } from 'Models/Resource/Resource.model';
import { IUser } from 'Models/User/User.model';
import { ResourceService } from 'Services/Resource/Resource.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard)
@Controller('/resource')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
  ) {}

  @Post('all')
  async getAllResources(
    @Body() filters: QueryResourceDTO,
  ): Promise<IResource[]> {
    return this.resourceService.getAllResources(filters);
  }

  @Get(':id')
  async getResourceById(
    @Param('id') id: string,
  ): Promise<IResource> {
    return this.resourceService.getResourceById(id);
  }

  @Put(':id')
  async updateResource(
    @Param('id') id: string,
    @Body() resource: UpdateResourceDTO,
    @CurrentUser() user: IUser,
  ): Promise<string> {
    if (Object.values(resource).every((v) => v === undefined)) {
      throw new BadRequestException('At least 1 field needs to defined');
    }
    return this.resourceService.updateResource(id, resource, user);
  }

  @Delete(':id')
  async deleteResource(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<void> {
    return this.resourceService.deleteResource(id, user);
  }
}
