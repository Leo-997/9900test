import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuidV4 } from 'uuid';
import {
  ClinicalInformationDataDTO,
  ClinicalInformationSettingDataDTO,
  IClinicalInformationRaw,
  IClinicalInformationSettingRaw,
  IUser,
} from '../../Models';
import { KNEX_CONNECTION } from '../../Modules/Knex/constants';

@Injectable()
export class ClinicalInformationClient {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) { }

  private clinicalSettingsTable = 'zcc_clinical_information_settings';

  private clinicalInformationTable = 'zcc_clinical_information';

  public async createClinicalInformationBySlideId(
    slideId: string,
    {
      'Genetic test results prior to enrolment': priorTest,
      'Relevant family history': familyHistory,
      'Relevant personal history': personalHistory,
      'Other relevant clinical information': otherInformation,
    }: ClinicalInformationDataDTO,
    currentUser: IUser,
  ): Promise<string> {
    const id = uuidV4();
    await this.knex
      .insert({
        id,
        prior_genetic_test: priorTest.value,
        prior_genetic_test_note: priorTest.note,
        family_history: familyHistory.value,
        family_history_note: familyHistory.note,
        personal_history: personalHistory.value,
        personal_history_note: personalHistory.note,
        other_information: otherInformation.value,
        other_information_note: otherInformation.note,
        created_by: currentUser?.id,
        slide_id: slideId,
        created_at: this.knex.fn.now(),
      })
      .into(this.clinicalInformationTable);

    return id;
  }

  public async getClinicalInformationBySlideId(
    slideId: string,
  ): Promise<IClinicalInformationRaw> {
    return this.knex
      .select({
        id: 'id',
        priorGeneticTest: 'prior_genetic_test',
        priorGeneticTestNote: 'prior_genetic_test_note',
        familyHistory: 'family_history',
        familyHistoryNote: 'family_history_note',
        personalHistory: 'personal_history',
        personalHistoryNote: 'personal_history_note',
        otherInformation: 'other_information',
        otherInformationNote: 'other_information_note',
        slideId: 'slide_id',
      })
      .from(this.clinicalInformationTable)
      .where('slide_id', slideId)
      .whereNull('deleted_at')
      .first();
  }

  public async updateClinicalInformationBySlideId(
    slideId: string,
    {
      'Genetic test results prior to enrolment': priorTest,
      'Relevant family history': familyHistory,
      'Relevant personal history': personalHistory,
      'Other relevant clinical information': otherInformation,
    }: ClinicalInformationDataDTO,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        prior_genetic_test: priorTest.value,
        prior_genetic_test_note: priorTest.note,
        family_history: familyHistory.value,
        family_history_note: familyHistory.note,
        personal_history: personalHistory.value,
        personal_history_note: personalHistory.note,
        other_information: otherInformation.value,
        other_information_note: otherInformation.note,
        updated_by: currentUser?.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.clinicalInformationTable)
      .where('slide_id', slideId);
  }

  public async createClinicalInfoSettingBySlideId(
    slideId: string,
    {
      'Genetic test results prior to enrolment': priorTest,
      'Relevant family history': familyHistory,
      'Relevant personal history': personalHistory,
      'Other relevant clinical information': otherInformation,
    }: ClinicalInformationSettingDataDTO,
    currentUser: IUser,
  ): Promise<string> {
    const id = uuidV4();

    await this.knex
      .insert({
        id,
        slide_id: slideId,
        show_prior_genetic_test: !priorTest.isHidden,
        show_family_history: !familyHistory.isHidden,
        show_personal_history: !personalHistory.isHidden,
        show_other_information: !otherInformation.isHidden,
        created_by: currentUser?.id,
        created_at: this.knex.fn.now(),
      })
      .into(this.clinicalSettingsTable);

    return id;
  }

  public async getClinicalInfoSettingBySlideId(
    slideId: string,
  ): Promise<IClinicalInformationSettingRaw> {
    return this.knex
      .select({
        id: 'id',
        slideId: 'slide_id',
        showPriorGeneticTest: 'show_prior_genetic_test',
        showFamilyHistory: 'show_family_history',
        showPersonalHistory: 'show_personal_history',
        showOtherInformation: 'show_other_information',
      })
      .from(this.clinicalSettingsTable)
      .where('slide_id', slideId)
      .first();
  }

  public async updateClinicalInfoSettingBySlideId(
    slideId: string,
    {
      'Genetic test results prior to enrolment': priorTest,
      'Relevant family history': familyHistory,
      'Relevant personal history': personalHistory,
      'Other relevant clinical information': otherInformation,
    }: ClinicalInformationSettingDataDTO,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        show_prior_genetic_test: !priorTest.isHidden,
        show_family_history: !familyHistory.isHidden,
        show_personal_history: !personalHistory.isHidden,
        show_other_information: !otherInformation.isHidden,
        updated_by: currentUser?.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.clinicalSettingsTable)
      .where('slide_id', slideId);
  }

  public async deleteClinicalInfoSettingBySlideId(
    slideId: string,
  ): Promise<void> {
    await this.knex
      .delete()
      .from(this.clinicalSettingsTable)
      .where('slide_id', slideId);
  }

  public async deleteClinicalInformationBySlideId(
    slideId: string,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        deleted_at: this.knex.fn.now(),
        deleted_by: currentUser.id,
      })
      .from(this.clinicalInformationTable)
      .where('slide_id', slideId);
  }

  public async permanentlyDeleteClinicalInformation(
    informationId: string,
  ): Promise<number> {
    return this.knex
      .from(this.clinicalInformationTable)
      .where('id', informationId)
      .delete();
  }

  public async permanentlyDeleteClinicalInformationBySlideId(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (slideIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db
      .from(this.clinicalInformationTable)
      .whereIn('slide_id', slideIds)
      .delete();
  }

  public async permanentlyDeleteClinicalInfoSettingBySlideId(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (slideIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db
      .from(this.clinicalSettingsTable)
      .whereIn('slide_id', slideIds)
      .delete();
  }
}
