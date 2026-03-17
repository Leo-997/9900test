import { AxiosInstance } from 'axios';
import {
  ISlideAttachment,
  AddSlideAttachment,
  UpdateMolecularGroup,
  UpdateSlideAttachmentSettings,
  IUpdateSlideAttachmentOrder,
  UpdateSlideAttachmentDetails,
} from '../../../../../../types/MTB/MTB.types';
import {
  ICreateSlide,
  ISlide,
  ISlideSection,
  ISlideSectionUpdate,
  IUpdateSlideSetting,
} from '../../../../../../types/MTB/Slide.types';
import { ITherapyDrug } from '../../../../../../types/Drugs/Drugs.types';

export interface ISlidesClient {
  getSlidesByVersionId(
    clinicalVersionId: string,
  ): Promise<ISlide[]>;
  getSlideById(
    clinicalVersionId: string,
    id: string,
  ): Promise<ISlide>;
  createSlide(
    clinicalVersionId: string,
    data: ICreateSlide,
  ): Promise<{ id: string; index: number }>;
  updateSlide(
    clinicalVersionId: string,
    id: string,
    data: Partial<ISlide>,
  ): Promise<void>;
  updateSlideSetting(
    clinicalVersionId: string,
    id: string,
    data: IUpdateSlideSetting,
  ): Promise<void>;
  updateSlideOrder(
    clinicalVersionId: string,
    data: Pick<ISlide, 'id' | 'index'>[],
  ): Promise<void>;
  updateMolecularGroup(
    clinicalVersionId: string,
    id: string,
    data: UpdateMolecularGroup,
  ): Promise<void>;
  deleteSlide(
    clinicalVersionId: string,
    id: string,
  ): Promise<void>;
  getDrugsByTherapyId(
    clinicalVersionId: string,
    id: string,
  ): Promise<ITherapyDrug[]>;
  addSlideAttachment(
    clinicalVersionId: string,
    slideId: string,
    data: AddSlideAttachment
  ): Promise<number>;
  updateSlideAttachmentOrder(
    clinicalVersionId: string,
    slideId: string,
    data: IUpdateSlideAttachmentOrder[],
  ): Promise<void>;
  updateSlideAttachmentSettings(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
    data: UpdateSlideAttachmentSettings,
  ): Promise<void>;
  updateSlideAttachmentDetails(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
    data: UpdateSlideAttachmentDetails,
  ): Promise<void>;
  getSlideAttachmentById(
    clinicalVersionId: string,
    slideId: string,
    fileId: string
  ): Promise<ISlideAttachment>;
  getFilesBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlideAttachment[]>;
  deleteFileBySlideId(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
  ): Promise<number>;
  getSectionsBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlideSection[]>;
  updateSlideSection(
    clinicalVersionId: string,
    sectionId: string,
    data: ISlideSectionUpdate,
  ): Promise<void>;
  createSlideSection(
    clinicalVersionId: string,
    slideId: string,
    data: Partial<ISlideSection>,
  ): Promise<string>;
  deleteSlideSection(
    clinicalVersionId: string,
    id: string,
  ): Promise<void>;
  updateSectionOrder(
    clinicalVersionId: string,
    data: Pick<ISlideSection, 'id' | 'order'>[],
  ): Promise<void>;
}

export function createSlidesClient(instance: AxiosInstance): ISlidesClient {
  async function getSlidesByVersionId(
    clinicalVersionId: string,
  ): Promise<ISlide[]> {
    const resp = await instance.get(
      `/clinical/${clinicalVersionId}/slide/slides`,
    );

    return resp.data;
  }

  async function getSlideById(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlide> {
    const resp = await instance.get(`/clinical/${clinicalVersionId}/slide/${slideId}`);

    return resp.data;
  }

  async function createSlide(
    clinicalVersionId: string,
    data: ICreateSlide,
  ): Promise<{ id: string; index: number }> {
    const resp = await instance.post(
      `/clinical/${clinicalVersionId}/slide`,
      data,
    );

    return resp.data;
  }

  async function updateSlide(
    clinicalVersionId: string,
    slideId: string,
    data: Partial<ISlide>,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/${slideId}`, data);
  }

  async function updateSlideSetting(
    clinicalVersionId: string,
    slideId: string,
    data: IUpdateSlideSetting,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/${slideId}/setting`, data);
  }

  async function updateSlideOrder(
    clinicalVersionId: string,
    data: Pick<ISlide, 'id' | 'index'>[],
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/order`, { data });
  }

  async function updateMolecularGroup(
    clinicalVersionId: string,
    groupId: string,
    data: UpdateMolecularGroup,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/mol-group/${groupId}`, data);
  }

  async function deleteSlide(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/${clinicalVersionId}/slide/${slideId}`);
  }

  async function getDrugsByTherapyId(
    clinicalVersionId: string,
    therapyId: string,
  ): Promise<ITherapyDrug[]> {
    const resp = await instance.get(`/clinical/${clinicalVersionId}/drug/${therapyId}/drugs`);

    return resp.data;
  }

  async function addSlideAttachment(
    clinicalVersionId: string,
    slideId: string,
    data: AddSlideAttachment,
  ): Promise<number> {
    const resp = await instance.post(`/clinical/${clinicalVersionId}/slide/${slideId}/file`, data);

    return resp.data;
  }

  async function updateSlideAttachmentOrder(
    clinicalVersionId: string,
    slideId: string,
    data: IUpdateSlideAttachmentOrder[],
  ): Promise<void> {
    await instance.patch(`clinical/${clinicalVersionId}/slide/${slideId}/file/order`, {
      orders: data,
    });
  }

  async function updateSlideAttachmentSettings(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
    data: UpdateSlideAttachmentSettings,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/${slideId}/file/${fileId}/settings`, data);
  }

  async function updateSlideAttachmentDetails(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
    data: UpdateSlideAttachmentDetails,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/${slideId}/file/${fileId}/details`, data);
  }

  async function getSlideAttachmentById(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
  ): Promise<ISlideAttachment> {
    const resp = await instance.get(
      `/clinical/${clinicalVersionId}/slide/${slideId}/file/${fileId}`,
    );
    return resp.data;
  }

  async function getFilesBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlideAttachment[]> {
    const resp = await instance.get(`/clinical/${clinicalVersionId}/slide/${slideId}/file`);
    return resp.data;
  }

  async function deleteFileBySlideId(
    clinicalVersionId: string,
    slideId: string,
    fileId: string,
  ): Promise<number> {
    const resp = await instance.delete(
      `/clinical/${clinicalVersionId}/slide/${slideId}/file/${fileId}`,
    );
    return resp.data;
  }
  async function getSectionsBySlideId(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ISlideSection[]> {
    const resp = await instance.get(`/clinical/${clinicalVersionId}/slide/${slideId}/section`);

    return resp.data;
  }

  async function updateSlideSection(
    clinicalVersionId: string,
    sectionId: string,
    data: ISlideSectionUpdate,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/${sectionId}/section`, data);
  }

  async function createSlideSection(
    clinicalVersionId: string,
    slideId: string,
    data: Partial<ISlideSection>,
  ): Promise<string> {
    const resp = await instance.post(
      `/clinical/${clinicalVersionId}/slide/${slideId}/section`,
      data,
    );

    return resp.data;
  }

  async function deleteSlideSection(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/${clinicalVersionId}/slide/${slideId}/section`);
  }

  async function updateSectionOrder(
    clinicalVersionId: string,
    data: Pick<ISlideSection, 'id' | 'order'>[],
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/slide/section/order`, data);
  }

  return {
    getSlidesByVersionId,
    getSlideById,
    createSlide,
    updateSlide,
    updateSlideSetting,
    updateSlideOrder,
    updateMolecularGroup,
    deleteSlide,
    getDrugsByTherapyId,
    getFilesBySlideId,
    deleteFileBySlideId,
    addSlideAttachment,
    updateSlideAttachmentOrder,
    updateSlideAttachmentSettings,
    updateSlideAttachmentDetails,
    getSlideAttachmentById,
    getSectionsBySlideId,
    updateSlideSection,
    createSlideSection,
    deleteSlideSection,
    updateSectionOrder,
  };
}
