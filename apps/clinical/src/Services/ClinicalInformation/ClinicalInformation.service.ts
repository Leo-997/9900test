import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { ClinicalInformationClient } from '../../Clients/ClinicalInformation/ClinicalInformation.client';
import {
  ClinicalInformationData,
  ClinicalInformationDataDTO,
  ClinicalInformationSettingData,
  ClinicalInformationSettingDataDTO,
  IUser,
} from '../../Models';
import { SlideService } from '../Slide/Slide.service';

@Injectable()
export class ClinicalInformationService {
  constructor(
    private readonly clinicalClient: ClinicalInformationClient,
    @Inject(forwardRef(() => SlideService))
    private readonly slideService: SlideService,
  ) {}

  public async createClinicalInformationBySlideId(
    clinicalVersionId: string,
    slideId: string,
    createInformationBody: ClinicalInformationDataDTO,
    currentUser: IUser,
  ): Promise<string> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    await this.createClinicalInfoSettingBySlideId(
      clinicalVersionId,
      slideId,
      createInformationBody,
      currentUser,
    );

    return this.clinicalClient.createClinicalInformationBySlideId(
      slideId,
      createInformationBody,
      currentUser,
    );
  }

  public async getClinicalInformationBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ClinicalInformationData | undefined> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not fetch data for slide with the provided ID');
    }

    const resp = await this.clinicalClient.getClinicalInformationBySlideId(slideId);
    const settingsResp = await this.getClinicalInfoSettingBySlideId(clinicalVersionId, slideId);

    if (!resp || !settingsResp) {
      return undefined;
    }

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Genetic test results prior to enrolment': {
        value: resp.priorGeneticTest,
        note: resp.priorGeneticTestNote,
        isHidden: settingsResp['Genetic test results prior to enrolment'].isHidden,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Relevant family history': {
        value: resp.familyHistory,
        note: resp.familyHistoryNote,
        isHidden: settingsResp['Relevant family history'].isHidden,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Relevant personal history': {
        value: resp.personalHistory,
        note: resp.personalHistoryNote,
        isHidden: settingsResp['Relevant personal history'].isHidden,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Other relevant clinical information': {
        value: resp.otherInformation,
        note: resp.otherInformationNote,
        isHidden: settingsResp['Other relevant clinical information'].isHidden,
      },
    };
  }

  public async updateClinicalInformationBySlideId(
    clinicalVersionId: string,
    slideId: string,
    updateInformationBody: ClinicalInformationDataDTO,
    currentUser: IUser,
  ): Promise<number> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    const result = await this.clinicalClient.updateClinicalInformationBySlideId(
      slideId,
      updateInformationBody,
      currentUser,
    );

    await this.updateClinicalInfoSettingBySlideId(
      clinicalVersionId,
      slideId,
      updateInformationBody,
      currentUser,
    );

    if (!result) {
      throw new NotFoundException(
        `Information for slide ${slideId} not found`,
      );
    }

    return result;
  }

  public async createClinicalInfoSettingBySlideId(
    clinicalVersionId: string,
    slideId: string,
    createSettingBody: ClinicalInformationSettingDataDTO,
    currentUser: IUser,
  ): Promise<string> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    return this.clinicalClient.createClinicalInfoSettingBySlideId(
      slideId,
      createSettingBody,
      currentUser,
    );
  }

  public async getClinicalInfoSettingBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ClinicalInformationSettingData | undefined> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not fetch data for slide with the provided ID');
    }

    const resp = await this.clinicalClient.getClinicalInfoSettingBySlideId(slideId);

    if (!resp) return undefined;

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Genetic test results prior to enrolment': {
        isHidden: !resp.showPriorGeneticTest,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Relevant family history': {
        isHidden: !resp.showFamilyHistory,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Relevant personal history': {
        isHidden: !resp.showPersonalHistory,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Other relevant clinical information': {
        isHidden: !resp.showOtherInformation,
      },
    };
  }

  public async updateClinicalInfoSettingBySlideId(
    clinicalVersionId: string,
    slideId: string,
    updateSettingBody: ClinicalInformationSettingDataDTO,
    currentUser: IUser,
  ): Promise<number> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    const result = await this.clinicalClient.updateClinicalInfoSettingBySlideId(
      slideId,
      updateSettingBody,
      currentUser,
    );

    if (!result) {
      throw new NotFoundException(
        `Setting for slide ${slideId} not found`,
      );
    }

    return result;
  }

  public async deleteClinicalInfoSettingBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<void> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    await this.clinicalClient.deleteClinicalInfoSettingBySlideId(
      slideId,
    );
  }

  public async deleteClinicalInformationBySlideId(
    clinicalVersionId: string,
    slideId: string,
    currentUser: IUser,
  ): Promise<number> {
    const slide = await this.slideService.getSlideById(clinicalVersionId, slideId);

    if (!slide) {
      throw new BadRequestException('Could not update slide with the provided ID');
    }

    try {
      await this.deleteClinicalInfoSettingBySlideId(clinicalVersionId, slideId);

      return this.clinicalClient.deleteClinicalInformationBySlideId(
        slideId,
        currentUser,
      );
    } catch {
      throw new BadRequestException('Could not delete clinical info and settings');
    }
  }

  public async permanentlyDeleteClinicalInfoSettingBySlideId(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    return this.clinicalClient.permanentlyDeleteClinicalInfoSettingBySlideId(
      slideIds,
      trx,
    );
  }

  public async permanentlyDeleteClinicalInformationBySlideId(
    slideIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    return this.clinicalClient.permanentlyDeleteClinicalInformationBySlideId(
      slideIds,
      trx,
    );
  }
}
