import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  CreateSlideAttachmentDTO,
  IAddFileResponse,
  ISlideAttachmentBase,
  IUser,
  UpdateSlideAttachmentDetailsDTO,
  UpdateSlideAttachmentOrderDTO,
  UpdateSlideAttachmentSettingsDTO,
} from 'Models';
import { UpdateOrderDTO } from 'Models/Common/Order.model';
import {
  FetchSlideDTO,
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
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 } from 'uuid';

@Injectable()
export class SlideClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) { }

  private slideTable = 'zcc_clinical_slides';

  private alterationGroupTable = 'zcc_clinical_mol_alterations_group';

  private slideAttachmentTable = 'zcc_clinical_slide_attachments';

  private slideSectionTable = 'zcc_clinical_slides_sections';

  private slideSettingsTable = 'zcc_clinical_slide_settings';

  async getSlidesByVersionId(clinicalVersionId: string): Promise<ISlide[]> {
    return this.knex
      .select({
        id: 's.id',
        index: 's.index',
        title: 's.title',
        slideNote: 's.slide_note',
        reportNote: 's.report_note',
        hidden: 's.is_hidden',
        clinicalVersionId: 's.clinical_version_id',
        molAlterationGroupId: 's.mol_alteration_group_id',
      })
      .from<FetchSlideDTO[]>({ s: this.slideTable })
      .whereNull('s.deleted_at')
      .andWhere('s.clinical_version_id', clinicalVersionId)
      .orderBy('s.index', 'asc');
  }

  async getSlideById(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlide> {
    return this.knex
      .select({
        id: 's.id',
        index: 's.index',
        title: 's.title',
        slideNote: 's.slide_note',
        reportNote: 's.report_note',
        hidden: 's.is_hidden',
        clinicalVersionId: 's.clinical_version_id',
        molAlterationGroupId: 's.mol_alteration_group_id',
      })
      .from<FetchSlideDTO>({ s: this.slideTable })
      .where('s.id', slideId)
      .where('s.clinical_version_id', clinicalVersionId)
      .first();
  }

  async createSlide(
    clinicalVersionId: string,
    data: PostSlideDTO,
    user: IUser,
    groupId?: string,
  ): Promise<ICreateSlideResponse> {
    const slideId: string = v4();
    const index = await this.getLatestIndex(clinicalVersionId);

    // Create new slide
    await this.knex
      .insert({
        id: slideId,
        clinical_version_id: clinicalVersionId,
        index: index + 1,
        title: data.title,
        slide_note: data.slideNote,
        mol_alteration_group_id: data.alterations ? groupId : null,
        created_by: user.id,
      })
      .into(this.slideTable);

    // Create slide settings after a slide is made
    // One for default # of columns
    // One for default layout orientation
    if (data.alterations) {
      await this.knex
        .insert({
          slide_id: slideId,
          setting: 'columns',
          value: '1',
        })
        .into(this.slideSettingsTable);

      await this.knex
        .insert({
          slide_id: slideId,
          setting: 'showDescription',
          value: 'Yes',
        })
        .into(this.slideSettingsTable);

      await this.knex
        .insert({
          slide_id: slideId,
          setting: 'layout',
          value: 'vertical',
        })
        .into(this.slideSettingsTable);

      await this.knex
        .insert({
          slide_id: slideId,
          setting: 'noteWidth',
          value: '8',
        })
        .into(this.slideSettingsTable);
    }

    return {
      id: slideId,
      index: index + 1,
    };
  }

  private async getLatestIndex(clinicalVersionId: string): Promise<number> {
    const resp = await this.knex
      .select({
        index: 's.index',
      })
      .from({ s: this.slideTable })
      .whereNull('s.deleted_at')
      .andWhere('s.clinical_version_id', clinicalVersionId)
      .groupBy('s.index')
      .orderBy('s.index', 'desc')
      .first();

    return resp ? resp.index : -1;
  }

  async getSlideSettings(slideId: string): Promise<Record<string, string>[]> {
    return this.knex
      .select({
        setting: 'setting',
        value: 'value',
      })
      .from(this.slideSettingsTable)
      .where('slide_id', slideId);
  }

  async updateSlide(
    clinicalVersionId: string,
    slideId: string,
    data: UpdateSlideDTO,
    user: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        title: data.title,
        slide_note: data.slideNote,
        is_hidden: data.hidden,
        updated_at: this.knex.fn.now(),
        updated_by: user.id,
      })
      .from(this.slideTable)
      .where('id', slideId)
      .where('clinical_version_id', clinicalVersionId);
  }

  async updateSlideSetting(
    slideId: string,
    data: UpdateSlideSettingDTO,
  ): Promise<void> {
    await this.knex
      .insert({
        slide_id: slideId,
        setting: data.setting,
        value: data.value,
      })
      .into(this.slideSettingsTable)
      .onConflict(['slide_id', 'setting'])
      .merge(['value']);
  }

  async updateSlideOrder(
    clinicalVersionId: string,
    data: UpdateSlideOrderDTO,
    user: IUser,
  ): Promise<void> {
    const promises: Promise<any>[] = [];
    for (const slide of data.data) {
      promises.push(
        this.knex
          .update({
            index: slide.index,
            updated_at: this.knex.fn.now(),
            updated_by: user.id,
          })
          .from(this.slideTable)
          .where('id', slide.id)
          .where('clinical_version_id', clinicalVersionId),
      );
    }
    await Promise.all(promises);
  }

  async updateMolecularGroup(
    slideId: string,
    data: UpdateMolAlterationGroupDTO,
    user: IUser,
  ): Promise<void> {
    const { groupId } = await this.knex
      .select({
        groupId: 'mol_alteration_group_id',
      })
      .from(this.slideTable)
      .where('id', slideId)
      .first();

    // Remove molecular alteration from group
    if (data.remove && data.remove.length > 0) {
      await this.knex
        .delete()
        .from(this.alterationGroupTable)
        .whereIn('mol_alteration_id', data.remove)
        .andWhere('group_id', groupId);
    }

    // Add molecular alteration to group
    if (data.add && data.add.length > 0) {
      await this.knex
        .insert(
          data.add.map((s) => ({
            group_id: groupId,
            mol_alteration_id: s,
            created_by: user.id,
          })),
        )
        .into(this.alterationGroupTable);
    }
  }

  async deleteSlide(slideId: string, user: IUser): Promise<void> {
    await this.knex
      .update({
        deleted_at: this.knex.fn.now(),
        deleted_by: user.id,
      })
      .from(this.slideTable)
      .where('id', slideId);
  }

  async addFileToSlide(
    slideId: string,
    {
      fileId,
      fileType,
      sectionId,
      title,
      caption,
      width,
    }: CreateSlideAttachmentDTO,
    user: IUser,
  ): Promise<IAddFileResponse> {
    const newOrder = await this.knex
      .select({ order: 'order' })
      .from(this.slideAttachmentTable)
      .where('slide_id', slideId)
      .andWhere('section_id', sectionId ?? null)
      .andWhere('is_at_bottom', false)
      .orderBy('order', 'desc')
      .first();

    await this.knex
      .insert({
        slide_id: slideId,
        file_id: fileId,
        section_id: sectionId,
        file_type: fileType,
        title,
        caption,
        order: newOrder ? newOrder.order + 1 : 1,
        width,
        created_at: this.knex.fn.now(),
        created_by: user?.id,
      })
      .into(this.slideAttachmentTable)
      .onConflict()
      .ignore();

    return {
      fileId,
      slideId,
    };
  }

  async updateFileOrder(
    slideId: string,
    { orders }: UpdateSlideAttachmentOrderDTO,
    user: IUser,
  ): Promise<void> {
    await Promise.all(
      orders.map((o) => this.knex
        .update({
          order: o.order,
          updated_by: user.id,
          updated_at: this.knex.fn.now(),
        })
        .from(this.slideAttachmentTable)
        .where('file_id', o.id)
        .andWhere('slide_id', slideId)),
    );
  }

  async updateFileSettings(
    slideId: string,
    fileId: string,
    { width, isCondensed, isAtBottom }: UpdateSlideAttachmentSettingsDTO,
    user: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        width,
        is_condensed: isCondensed,
        is_at_bottom: isAtBottom,
        updated_by: user.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.slideAttachmentTable)
      .where('slide_id', slideId)
      .andWhere('file_id', fileId);
  }

  async updateFileDetails(
    slideId: string,
    fileId: string,
    { title, caption }: UpdateSlideAttachmentDetailsDTO,
    user: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        title,
        caption,
        updated_by: user.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.slideAttachmentTable)
      .where('slide_id', slideId)
      .andWhere('file_id', fileId);
  }

  async getFilesBySlide(slideId: string): Promise<ISlideAttachmentBase[]> {
    return this.knex
      .select({
        slideId: 'slide_id',
        fileId: 'file_id',
        sectionId: 'section_id',
        fileType: 'file_type',
        title: 'title',
        caption: 'caption',
        width: 'width',
        order: 'order',
        isAtBottom: 'is_at_bottom',
        isCondensed: 'is_condensed',
      })
      .from(this.slideAttachmentTable)
      .where('slide_id', slideId)
      .orderBy('order');
  }

  async getFileById(
    slideId: string,
    fileId: string,
  ): Promise<ISlideAttachmentBase> {
    return this.knex
      .select({
        slideId: 'slide_id',
        fileId: 'file_id',
        sectionId: 'section_id',
        fileType: 'file_type',
        title: 'title',
        caption: 'caption',
        width: 'width',
        order: 'order',
        isCondensed: 'is_condensed',
      })
      .from(this.slideAttachmentTable)
      .where({
        slide_id: slideId,
        file_id: fileId,
      })
      .first();
  }

  async deleteFileFromSlide(slideId: string, fileId: string): Promise<number> {
    return this.knex.delete().from(this.slideAttachmentTable).where({
      slide_id: slideId,
      file_id: fileId,
    });
  }

  async getSectionsBySlideId(slideId: string): Promise<ISlideSection[]> {
    return this.knex
      .select({
        id: 's.id',
        order: 's.order',
        width: 's.width',
        type: 's.type',
        slideId: 's.slide_id',
        name: 's.name',
        description: 's.description',
        createdAt: 's.created_at',
        createdBy: 's.created_by',
        updatedAt: 's.updated_at',
        updatedBy: 's.updated_by',
      })
      .from<ISlideSection>({ s: this.slideSectionTable })
      .whereNull('s.deleted_at')
      .andWhere('s.slide_id', slideId);
  }

  async getSectionById(sectionId: string): Promise<ISlideSection> {
    return this.knex
      .select({
        id: 's.id',
        order: 's.order',
        width: 's.width',
        type: 's.type',
        slideId: 's.slide_id',
        name: 's.name',
        description: 's.description',
        createdAt: 's.created_at',
        createdBy: 's.created_by',
        updatedAt: 's.updated_at',
        updatedBy: 's.updated_by',
      })
      .from<ISlideSection>({ s: this.slideSectionTable })
      .whereNull('s.deleted_at')
      .andWhere('s.id', sectionId)
      .first();
  }

  async createSection(
    slideId: string,
    data: PostSectionDTO,
    user: IUser,
  ): Promise<string> {
    const id = v4();
    await this.knex
      .insert({
        id,
        order: data?.order,
        type: data?.type,
        slide_id: slideId,
        name: data?.name,
        description: data?.description,
        created_by: user?.id,
        created_at: this.knex.fn.now(),
      })
      .into(this.slideSectionTable);
    return id;
  }

  async updateSection(
    sectionId: string,
    data: UpdateSectionDTO,
    user: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        width: data?.width,
        name: data?.name,
        description: data?.description,
        updated_by: user?.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.slideSectionTable)
      .where('id', sectionId);
  }

  async updateSectionOrder(data: UpdateOrderDTO[], user: IUser): Promise<void> {
    const promises: Promise<any>[] = [];
    for (const section of data) {
      promises.push(
        this.knex
          .update({
            order: section.order,
            updated_by: user?.id,
            updated_at: this.knex.fn.now(),
          })
          .from(this.slideSectionTable)
          .where('id', section.id),
      );
    }
    await Promise.all(promises);
  }

  async deleteSection(sectionId: string, user: IUser): Promise<void> {
    await this.knex
      .update({
        deleted_at: this.knex.fn.now(),
        deleted_by: user?.id,
      })
      .from(this.slideSectionTable)
      .where('id', sectionId);
  }

  async getMolAlterationGroupIdsFromSlides(slideIds: string[]): Promise<string[]> {
    if (slideIds.length === 0) {
      return [];
    }
    return this.knex(this.slideTable)
      .select('mol_alteration_group_id')
      .whereIn('id', slideIds)
      .whereNotNull('mol_alteration_group_id')
      .pluck('mol_alteration_group_id')
      .then((ids) => Array.from(new Set(ids)));
  }

  async getMolAlterationGroupIdsStillInUse(
    groupIds: string[],
    excludeSlideIds: string[],
  ): Promise<string[]> {
    if (groupIds.length === 0) {
      return [];
    }
    const db = this.knex;

    return db(this.slideTable)
      .select('mol_alteration_group_id')
      .whereIn('mol_alteration_group_id', groupIds)
      .whereNotIn('id', excludeSlideIds)
      .whereNull('deleted_at')
      .pluck('mol_alteration_group_id');
  }

  async getOldRecordIds(
    cutoffDate: Date,
    compareColumn: string,
    tableName: string,
  ): Promise<string[]> {
    return this.knex(tableName)
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  async getSlideSectionsBySlideId(
    slideIds: string[],
  ): Promise<string[]> {
    if (slideIds.length === 0) {
      return [];
    }
    return this.knex(this.slideSectionTable)
      .whereIn('slide_id', slideIds)
      .pluck('id');
  }

  public async getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  getCleanupTables(): Record<string, string> {
    return {
      slideSectionTable: this.slideSectionTable,
      slideTable: this.slideTable,
    };
  }

  async deleteClinicalSlideSettingBySlideId(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (slideIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db.from(this.slideSettingsTable)
      .whereIn('slide_id', slideIds)
      .delete();
  }

  async deleteClinicalSlideAttachmentBySlideId(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (slideIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db.from(this.slideAttachmentTable)
      .whereIn('slide_id', slideIds)
      .delete();
  }

  async deleteClinicalSlideAttachmentBySectionId(
    sectionIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (sectionIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db.from(this.slideAttachmentTable)
      .whereIn('section_id', sectionIds)
      .delete();
  }

  async permanentlyDeleteOldSlides(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    const db = trx ?? this.knex;

    return db.from(this.slideTable)
      .whereIn('id', slideIds)
      .delete();
  }

  async permanentlyDeleteOldSlideSections(
    slideSectionIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (slideSectionIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db.from(this.slideSectionTable)
      .whereIn('id', slideSectionIds)
      .delete();
  }
}
