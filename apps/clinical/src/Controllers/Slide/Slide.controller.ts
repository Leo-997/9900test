import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import {
  CreateSlideAttachmentDTO,
  IAddFileResponse,
  ISlideAttachmentBase,
  IUserWithMetadata,
  UpdateSlideAttachmentDetailsDTO,
  UpdateSlideAttachmentOrderDTO,
  UpdateSlideAttachmentSettingsDTO,
} from 'Models';
import { UpdateOrderDTO } from 'Models/Common/Order.model';
import {
  ICreateSlideResponse,
  ISlide,
  ISlideSection,
  PostSectionDTO,
  PostSlideDTO,
  UpdateMolAlterationGroupDTO,
  UpdateSectionDTO,
  UpdateSlideDTO,
  UpdateSlideOrderDTO,
  UpdateSlideSettingDTO,
} from 'Models/Slide/Slide.model';
import { AuthService } from 'Services';
import { SlideService } from 'Services/Slide/Slide.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/:clinicalVersionId/slide')
export class SlideController {
  constructor(
    private readonly slideService: SlideService,
    private readonly authService: AuthService,
  ) {}

  @Get('slides')
  @Scopes('clinical.sample.read')
  async getSlidesByVersionId(
    @Param('clinicalVersionId') clinicalVersionId: string,
  ): Promise<ISlide[]> {
    return this.slideService.getSlidesByVersionId(clinicalVersionId);
  }

  @Get(':slideId')
  @Scopes('clinical.sample.read')
  async getSlideById(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
  ): Promise<ISlide> {
    return this.slideService.getSlideById(clinicalVersionId, slideId);
  }

  @Post('')
  @IsWriteEndpoint()
  async createSlide(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() data: PostSlideDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICreateSlideResponse> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.createSlide(clinicalVersionId, data, user);
  }

  @Patch('order')
  @IsWriteEndpoint()
  async updateSlideOrder(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() data: UpdateSlideOrderDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateSlideOrder(clinicalVersionId, data, user);
  }

  @Patch(':slideId')
  @IsWriteEndpoint()
  async updateSlide(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() data: UpdateSlideDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    // allow unassigned users in 'common.sample.suggestion.write' scope
    // to update comments in slideNote
    if (!isAuthorised && !data.slideNote) throw new ForbiddenException();

    return this.slideService.updateSlide(clinicalVersionId, slideId, data, user);
  }

  @Patch(':slideId/setting')
  @IsWriteEndpoint()
  async updateSlideSetting(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() data: UpdateSlideSettingDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateSlideSetting(clinicalVersionId, slideId, data);
  }

  @Patch('mol-group/:slideId')
  @IsWriteEndpoint()
  async updateMolecularGroup(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() data: UpdateMolAlterationGroupDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateMolecularGroup(clinicalVersionId, slideId, data, user);
  }

  @Delete(':slideId')
  @IsWriteEndpoint()
  async deleteSlide(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.deleteSlide(clinicalVersionId, slideId, user, headers);
  }

  @Get(':slideId/section')
  @Scopes('clinical.sample.read')
  async getSectionsBySlideId(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
  ): Promise<ISlideSection[]> {
    return this.slideService.getSectionsBySlideId(clinicalVersionId, slideId);
  }

  @Post(':slideId/section')
  @IsWriteEndpoint()
  async createSection(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() data: PostSectionDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.createSection(clinicalVersionId, slideId, data, user);
  }

  @Patch(':sectionId/section')
  @IsWriteEndpoint()
  async updateSection(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('sectionId') sectionId: string,
    @Body() data: UpdateSectionDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    // allow unassigned users in 'common.sample.suggestion.write' scope
    // to update comments in germline section
    if (!isAuthorised && !data.description) throw new ForbiddenException();

    return this.slideService.updateSection(clinicalVersionId, sectionId, data, user);
  }

  @Patch('section/order')
  @IsWriteEndpoint()
  async updateSectionOrder(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() data: UpdateOrderDTO[],
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateSectionOrder(clinicalVersionId, data, user);
  }

  @Delete(':sectionId/section')
  @IsWriteEndpoint()
  async deleteSection(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.deleteSection(clinicalVersionId, sectionId, user);
  }

  @Get(':slideId/file')
  @Scopes('clinical.sample.read')
  async getFilesBySlide(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
  ): Promise<ISlideAttachmentBase[]> {
    return this.slideService.getFilesBySlide(clinicalVersionId, slideId);
  }

  @Get(':slideId/file/:fileId')
  @Scopes('clinical.sample.read')
  async getFileById(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Param('fileId') fileId: string,
  ): Promise<ISlideAttachmentBase> {
    return this.slideService.getFileById(clinicalVersionId, slideId, fileId);
  }

  @Post(':slideId/file')
  @IsWriteEndpoint()
  async addFileToSlide(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() data: CreateSlideAttachmentDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAddFileResponse> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    try {
      return this.slideService.addFileToSlide(clinicalVersionId, slideId, data, user);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':slideId/file/order')
  @IsWriteEndpoint()
  async updateFileOrder(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() data: UpdateSlideAttachmentOrderDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateFileOrder(
      clinicalVersionId,
      slideId,
      data,
      user,
    );
  }

  @Patch(':slideId/file/:fileId/settings')
  @IsWriteEndpoint()
  async updateFileSettings(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Param('fileId') fileId: string,
    @Body() data: UpdateSlideAttachmentSettingsDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateFileSettings(
      clinicalVersionId,
      slideId,
      fileId,
      data,
      user,
    );
  }

  @Patch(':slideId/file/:fileId/details')
  @IsWriteEndpoint()
  async updateFileDetails(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Param('fileId') fileId: string,
    @Body() data: UpdateSlideAttachmentDetailsDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.slideService.updateFileDetails(
      clinicalVersionId,
      slideId,
      fileId,
      data,
      user,
    );
  }

  @Delete(':slideId/file/:fileId')
  @IsWriteEndpoint()
  async deleteFileFromSlide(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    try {
      return this.slideService.deleteFileFromSlide(clinicalVersionId, slideId, fileId);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
