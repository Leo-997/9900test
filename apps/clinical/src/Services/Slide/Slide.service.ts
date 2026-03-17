import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SlideClient } from 'Clients/Slide/Slide.client';
import { IncomingHttpHeaders } from 'http';
import {
  CreateSlideAttachmentDTO,
  IAddFileResponse,
  IMolecularAlterationDetail,
  ISlideAttachmentBase,
  IUser,
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
  ISlideSettings,
  PostSectionDTO,
  PostSlideDTO,
  UpdateMolAlterationGroupDTO,
  UpdateSectionDTO,
  UpdateSlideDTO,
  UpdateSlideOrderDTO,
  UpdateSlideSettingDTO,
} from 'Models/Slide/Slide.model';
import { MolecularAlterationsService } from '../MolecularAlterations/MolecularAlterations.service';
import { RecommendationService } from '../Recommendation/Recommendation.service';
import { ClinicalInformationService } from '../ClinicalInformation/ClinicalInformation.service';
import { InterpretationsService } from '../Interpretation/Interpretation.service';

@Injectable()
export class SlideService {
  constructor(
    private readonly slideClient: SlideClient,
    private readonly recommendationService: RecommendationService,
    private readonly molecularAlterationService: MolecularAlterationsService,
    @Inject(forwardRef(() => ClinicalInformationService))
    private readonly clinicalInformationService: ClinicalInformationService,
    @Inject(InterpretationsService) private readonly interpretationsService: InterpretationsService,
  ) { }

  async getSlidesByVersionId(
    clinicalVersionId: string,
  ): Promise<ISlide[]> {
    const slides = await this.slideClient.getSlidesByVersionId(clinicalVersionId);

    for (const slide of slides) {
      if (slide.molAlterationGroupId) {
        // eslint-disable-next-line no-await-in-loop
        const alterations = await this.getSlideAlterations(
          clinicalVersionId,
          slide.molAlterationGroupId,
        );
        slide.alterations = alterations;
      }

      // eslint-disable-next-line no-await-in-loop
      const settings = await this.getSlideSettings(slide.id);
      slide.settings = settings;
    }

    return slides;
  }

  async getSlideById(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlide> {
    const slide = await this.slideClient.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      return null;
    }

    // If non-blank slide, get alterations
    if (slide.molAlterationGroupId) {
      const alterations = await this.getSlideAlterations(
        slide.clinicalVersionId,
        slide.molAlterationGroupId,
      );
      slide.alterations = alterations;
    }

    const settings = await this.getSlideSettings(slideId);
    slide.settings = settings;

    return slide;
  }

  private getSlideAlterations(
    clinicalVersionId: string,
    molAlterationGroupId: string,
  ): Promise<IMolecularAlterationDetail[]> {
    return this.molecularAlterationService.getMolecularAlterations(
      clinicalVersionId,
      {
        molAlterationGroupId,
      },
    );
  }

  private async getSlideSettings(
    slideId: string,
  ): Promise<ISlideSettings> {
    const settingsRaw = await this.slideClient.getSlideSettings(slideId);

    const settings = {};
    for (const setting of settingsRaw) {
      settings[setting.setting] = !Number.isNaN(parseInt(setting.value, 10))
        ? parseInt(setting.value, 10)
        : setting.value;
    }

    return settings;
  }

  async createSlide(
    clinicalVersionId: string,
    data: PostSlideDTO,
    user: IUser,
  ): Promise<ICreateSlideResponse> {
    // No check here, since a blank slide will have no data
    // Only clinicalVersionId is needed

    // Create alteration group for non-blank slides only
    // Also create rec columns setting
    let groupId: string;
    if (data.alterations) {
      groupId = await this.molecularAlterationService.createMolecularAlterationsGroup(
        clinicalVersionId,
        { alterations: data.alterations },
        user,
      );
    }

    return this.slideClient.createSlide(clinicalVersionId, data, user, groupId);
  }

  async updateSlide(
    clinicalVersionId: string,
    slideId: string,
    data: UpdateSlideDTO,
    user: IUser,
  ): Promise<void> {
    if (Object.values(data).every((v) => v === undefined)) {
      throw new BadRequestException('At least one field must be provided');
    }

    return this.slideClient.updateSlide(clinicalVersionId, slideId, data, user);
  }

  async updateSlideSetting(
    clinicalVersionId: string,
    slideId: string,
    data: UpdateSlideSettingDTO,
  ): Promise<void> {
    if (Object.values(data).some((v) => v === undefined)) {
      throw new BadRequestException('Both setting and value fields must be provided');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided id');
    }
    return this.slideClient.updateSlideSetting(slideId, data);
  }

  async updateSlideOrder(
    clinicalVersionId: string,
    data: UpdateSlideOrderDTO,
    user: IUser,
  ): Promise<void> {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    return this.slideClient.updateSlideOrder(clinicalVersionId, data, user);
  }

  async updateMolecularGroup(
    clinicalVersionId: string,
    slideId: string,
    data: UpdateMolAlterationGroupDTO,
    user: IUser,
  ): Promise<void> {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    return this.slideClient.updateMolecularGroup(slideId, data, user);
  }

  async deleteSlide(
    clinicalVersionId: string,
    slideId: string,
    user: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<void> {
    if (!slideId) {
      throw new BadRequestException('Slide id not provided');
    }

    const slide = await this.getSlideById(clinicalVersionId, slideId);
    if (!slide) {
      throw new NotFoundException(`Slide with id = ${slideId} was not found`);
    }

    // Remove recommendations for non-blank slides
    const recommendations = await this.recommendationService.getAllRecommendations(
      clinicalVersionId,
      {
        slideId: slide.id,
      },
      1,
      100, // assuming there are no more than 100 recommendations per slide
      headers,
      user,
    );

    await Promise.all(recommendations.map((rec) => (
      this.recommendationService.deleteRecommendation(clinicalVersionId, rec.id, user)
    )));

    return this.slideClient.deleteSlide(slideId, user);
  }

  async addFileToSlide(
    clinicalVersionId: string,
    slideId: string,
    data: CreateSlideAttachmentDTO,
    user: IUser,
  ): Promise<IAddFileResponse> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    return this.slideClient.addFileToSlide(slideId, data, user);
  }

  async updateFileOrder(
    clinicalVersionId: string,
    slideId: string,
    data: UpdateSlideAttachmentOrderDTO,
    user: IUser,
  ): Promise<void> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    return this.slideClient.updateFileOrder(
      slideId,
      data,
      user,
    );
  }

  async updateFileSettings(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
    data: UpdateSlideAttachmentSettingsDTO,
    user: IUser,
  ): Promise<void> {
    if (Object.values(data).every((v) => v === undefined)) {
      throw new BadRequestException('At least one field must be defined');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    return this.slideClient.updateFileSettings(
      slideId,
      fileId,
      data,
      user,
    );
  }

  async updateFileDetails(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
    data: UpdateSlideAttachmentDetailsDTO,
    user: IUser,
  ): Promise<void> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    return this.slideClient.updateFileDetails(
      slideId,
      fileId,
      data,
      user,
    );
  }

  async getFilesBySlide(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlideAttachmentBase[]> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not fetch files for slide with the provided ID');
    }

    return this.slideClient.getFilesBySlide(slideId);
  }

  async getFileById(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
  ): Promise<ISlideAttachmentBase> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not fetch file for slide with the provided ID');
    }

    return this.slideClient.getFileById(slideId, fileId);
  }

  async deleteFileFromSlide(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
  ): Promise<number> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    const result = await this.slideClient.deleteFileFromSlide(
      slideId,
      fileId,
    );

    if (!result) {
      throw new NotFoundException('Could not find file to delete for given slide');
    }

    return result;
  }

  async getSectionsBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlideSection[]> {
    if (!slideId) {
      throw new BadRequestException('Slide id not provided');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not fetch sections for slide with the provided ID');
    }

    return this.slideClient.getSectionsBySlideId(slideId);
  }

  async createSection(
    clinicalVersionId: string,
    slideId: string,
    data: PostSectionDTO,
    user: IUser,
  ): Promise<string> {
    const slide = await this.getSlideById(
      clinicalVersionId,
      slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }
    return this.slideClient.createSection(slideId, data, user);
  }

  async updateSection(
    clinicalVersionId: string,
    sectionId: string,
    data: UpdateSectionDTO,
    user: IUser,
  ): Promise<void> {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    const section = await this.slideClient.getSectionById(
      sectionId,
    );

    if (!section) {
      throw new BadRequestException('Could not update section with the provided ID');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      section.slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update section with the provided ID');
    }
    return this.slideClient.updateSection(sectionId, data, user);
  }

  async updateSectionOrder(
    clinicalVersionId: string,
    data: UpdateOrderDTO[],
    user: IUser,
  ): Promise<void> {
    if (!data) {
      throw new BadRequestException('No data provided');
    }

    const sections = (await Promise.all(
      data.map((section) => (
        this.slideClient.getSectionById(
          section.id,
        )
      )),
    )).filter((s) => Boolean(s));

    if (!sections || sections.length === 0 || sections.length !== data.length) {
      throw new BadRequestException('Could not update sections with the provided IDs');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      sections[0]?.slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not update sections with the provided IDs');
    }

    return this.slideClient.updateSectionOrder(data, user);
  }

  async deleteSection(clinicalVersionId: string, sectionId: string, user: IUser): Promise<void> {
    if (!sectionId) {
      throw new BadRequestException('section id not provided');
    }

    const section = await this.slideClient.getSectionById(
      sectionId,
    );

    if (!section) {
      throw new BadRequestException('Could not delete section with the provided ID');
    }

    const slide = await this.getSlideById(
      clinicalVersionId,
      section.slideId,
    );

    if (!slide) {
      throw new BadRequestException('Could not delete section with the provided ID');
    }

    return this.slideClient.deleteSection(sectionId, user);
  }

  async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cleanupTables = this.slideClient.getCleanupTables();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deletedSlideSectionRecords = await this.cleanupOldSlideSections(
      cutoffDate,
      compareColumn,
      cleanupTables.slideSectionTable,
      logger,
    );

    const deletedSlideRecords = await this.cleanupOldSlides(
      cutoffDate,
      compareColumn,
      cleanupTables.slideTable,
      logger,
    );

    return deletedSlideSectionRecords + deletedSlideRecords;
  }

  async cleanupOldSlideSections(
    cutoffDate: Date,
    compareColumn: string,
    tableName: string,
    logger: Logger,
  ): Promise<number> {
    const oldSlideSectionIds = await this.slideClient.getOldRecordIds(
      cutoffDate,
      compareColumn,
      tableName,
    );
    logger.log(`Found ${oldSlideSectionIds.length} old slide sections to delete`);

    if (oldSlideSectionIds.length === 0) {
      return 0;
    }

    let totalDeletedRecords = 0;

    const trx = await this.slideClient.getTransaction();

    try {
      logger.log(`Deleting slide section and related records: sectionId=${oldSlideSectionIds.join(', ')}`);

      const slideSectionAttachments = await this.slideClient
        .deleteClinicalSlideAttachmentBySectionId(oldSlideSectionIds, trx);
      logger.log(`Deleted ${slideSectionAttachments} related records in slide section attachment table`);

      const slideSections = await this.slideClient
        .permanentlyDeleteOldSlideSections(oldSlideSectionIds, trx);

      await trx.commit();

      totalDeletedRecords = slideSectionAttachments + slideSections;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error in delete slide section and related record: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }

    logger.log(`Cleanup complete: deleted ${totalDeletedRecords} slide section records total`);
    return totalDeletedRecords;
  }

  async cleanupOldSlides(
    cutoffDate: Date,
    compareColumn: string,
    tableName: string,
    logger: Logger,
  ): Promise<number> {
    const BATCH_SIZE = 50;

    const oldSlideIds = await this.slideClient.getOldRecordIds(
      cutoffDate,
      compareColumn,
      tableName,
    );
    logger.log(`Found ${oldSlideIds.length} old slides to delete`);

    if (oldSlideIds.length === 0) {
      return 0;
    }

    let totalDeleted = 0;

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < oldSlideIds.length; i += BATCH_SIZE) {
      const batch = oldSlideIds.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(oldSlideIds.length / BATCH_SIZE);

      const trx = await this.slideClient.getTransaction();

      try {
        logger.log(`Processing batch ${batchNum}/${totalBatches}: ${batch.length} slides: ${batch.join(', ')}`);

        // Resolve mol_alteration_group_ids from slides in this batch before deletion
        const molAlterationGroupIds = await this.slideClient
          .getMolAlterationGroupIdsFromSlides(batch);
        const groupIdsStillInUse = await this.slideClient.getMolAlterationGroupIdsStillInUse(
          molAlterationGroupIds,
          batch,
        );
        const orphanedGroupIds = molAlterationGroupIds.filter(
          (id) => !groupIdsStillInUse.includes(id),
        );

        const deletedSlideSettings = await this.slideClient
          .deleteClinicalSlideSettingBySlideId(batch, trx);
        logger.log(`Deleted ${deletedSlideSettings} related records of in clinical slide setting table`);

        const deletedClinicalInfoSettings = await this.clinicalInformationService
          .permanentlyDeleteClinicalInfoSettingBySlideId(batch, trx);
        logger.log(`Deleted ${deletedClinicalInfoSettings} related records in clinical information setting table`);

        const deletedClinicalInfo = await this.clinicalInformationService
          .permanentlyDeleteClinicalInformationBySlideId(batch, trx);
        logger.log(`Deleted ${deletedClinicalInfo} related records in clinical information table`);

        const deletedSlideAttachments = await this.slideClient
          .deleteClinicalSlideAttachmentBySlideId(batch, trx);
        logger.log(`Deleted ${deletedSlideAttachments} related records in slide attachment table`);

        const relatedSectionIds = await this.slideClient
          .getSlideSectionsBySlideId(batch);

        const deletedSectionAttachments = await this.slideClient
          .deleteClinicalSlideAttachmentBySectionId(relatedSectionIds, trx);
        logger.log(`Deleted ${deletedSectionAttachments} related records in slide section attachment table`);

        const deletedSections = await this.slideClient
          .permanentlyDeleteOldSlideSections(relatedSectionIds, trx);
        logger.log(`Deleted ${deletedSections} related records in slide section table`);

        const deletedSlides = await this.slideClient
          .permanentlyDeleteOldSlides(batch, trx);
        logger.log(`Deleted ${deletedSlides} old slides in slide table`);

        let molAlterationsGroupDeleted = 0;
        if (orphanedGroupIds.length > 0) {
          molAlterationsGroupDeleted = await this.interpretationsService
            .deleteMolAlterationsGroupByIds(orphanedGroupIds, trx);
          logger.log(`Deleted ${molAlterationsGroupDeleted} orphaned mol_alterations_group records`);
        }

        await trx.commit();

        const batchDeleted = deletedSlideSettings
          + deletedClinicalInfoSettings
          + deletedClinicalInfo
          + deletedSlideAttachments
          + deletedSectionAttachments
          + deletedSections
          + deletedSlides
          + molAlterationsGroupDeleted;

        totalDeleted += batchDeleted;

        logger.log(
          `Batch ${batchNum}/${totalBatches} complete: `
          + `${deletedSlides} slides, ${deletedSections} sections, `
          + `${deletedSlideAttachments + deletedSectionAttachments} attachments, `
          + `${deletedClinicalInfo} information, `
          + `${deletedClinicalInfoSettings} information settings, `
          + `${molAlterationsGroupDeleted} orphaned mol_alterations_group, `
          + `${deletedSlideSettings} settings (${batchDeleted} total)`,
        );
      } catch (error) {
        await trx.rollback();
        logger.error(
          `Error in batch ${batchNum}/${totalBatches}: ${error instanceof Error ? error.message : String(error)}`,
        );
        return 0;
      }
    }

    logger.log(`Cleanup complete: deleted ${totalDeleted} slide records total`);
    return totalDeleted;
  }
}
