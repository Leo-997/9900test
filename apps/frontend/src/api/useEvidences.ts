import { getRTEEvidence } from '@/utils/editor/getRTEEvidnece';
import { getRTEInlineCitations } from '@/utils/editor/getRTEInlineCitations';
import { parseText } from '@/utils/editor/parser';
import { createEditor } from '@udecode/plate';
import { useCallback } from 'react';
import { useZeroDashSdk } from '../contexts/ZeroDashSdkContext';
import { ICitationFilters, ICitationWithMeta } from '../types/Evidence/Citations.types';
import {
  Evidence,
  ICreateEvidenceLink,
  IEvidenceLinkQuery,
  IEvidenceQuery,
  IGeneralEvidenceData,
  IGetEvidenceLinkResp,
  IGetEvidenceResp,
} from '../types/Evidence/Evidences.types';
import { IResourceFilters, IResourceWithMeta } from '../types/Evidence/Resources.types';

interface IGetEvidenceFilters {
  evidenceDetailsFilters?: IEvidenceQuery;
  citationFilters?: ICitationFilters;
  resourceFilters?: IResourceFilters;
  searchQuery?: string;
}

interface IGetEvidenceLinkFilters extends IGetEvidenceFilters {
  evidenceLinkFilters?: IEvidenceLinkQuery;
}

interface IUseEvidence {
  getAllEvidence: (
    filters: IGetEvidenceFilters,
  ) => Promise<IGetEvidenceResp>;
  getEvidenceById: (
    evidenceId: string,
  ) => Promise<Evidence | null>;
  getCurationEvidence: (
    filters: IGetEvidenceLinkFilters,
  ) => Promise<IGetEvidenceLinkResp>;
  getClinicalEvidence: (
    filters: IGetEvidenceLinkFilters,
  ) => Promise<IGetEvidenceLinkResp>;

  // link evidence to the sample / variant in curation database
  createNewCurationEvidence: (
    newEvidence: ICreateEvidenceLink,
  ) => Promise<string>;

  // create the evidence in the evidence microservice
  createNewEvidence: (data: IGeneralEvidenceData, sampleId?: string) => Promise<string>

  // update citations in recommendation description to display them in reports
  updateRecommendationEvidence: (
    description: string,
    recId: string,
    clinicalVersionId: string,
  ) => Promise<void>;

  // update links to inline citations and evidence in slide notes
  updateSlideNoteEvidence: (
    description: string,
    slideId: string,
    clinicalVersionId: string,
  ) => Promise<void>;
}

export default function useEvidences(): IUseEvidence {
  const zeroDashSdk = useZeroDashSdk();

  // get evidence from the microservice
  const getAllEvidence = useCallback(
    async ({
      evidenceDetailsFilters,
      citationFilters,
      resourceFilters,
      searchQuery,
    }: IGetEvidenceFilters): Promise<IGetEvidenceResp> => {
      const evidence = await zeroDashSdk.services.evidence.getAllEvidence({
        ...evidenceDetailsFilters,
        searchQuery,
      });

      const citations = evidence.some((e) => e.citationId)
        ? await zeroDashSdk.services.evidence.getAllCitations({
          ...citationFilters,
          ids: evidence.filter((e) => e.citationId).map((e) => e.citationId as string),
          searchQuery,
        })
        : [];

      const resources = evidence.some((e) => e.resourceId)
        ? await zeroDashSdk.services.evidence.getAllResources({
          ...resourceFilters,
          ids: evidence.filter((e) => e.resourceId).map((e) => e.resourceId as string),
          searchQuery,
        })
        : [];
      const allEvidence: Evidence[] = evidence.map((e) => {
        // one of these will be not undefined, but typescript will not be able to detect that
        // so casting the return value to ensure that it compiles
        const matchingCitation = citations.find((c) => c.id === e.citationId);
        const matchingResource = resources.find((r) => r.id === e.resourceId);
        return {
          ...matchingCitation,
          ...matchingResource,
          evidenceId: e.id,
          evidenceType: e.resourceId ? 'RESOURCE' : 'CITATION',
        } as Evidence;
      });

      return {
        allEvidence,
        citations: citations.map((c) => ({
          ...c,
          evidenceId: evidence.find((e) => e.citationId === c.id)?.id,
        })),
        resources: resources.map((c) => ({
          ...c,
          evidenceId: evidence.find((e) => e.resourceId === c.id)?.id,
        })),
      };
    },
    [zeroDashSdk.services.evidence],
  );

  const getEvidenceById = useCallback(async (evidenceId: string) => {
    const evidence = await zeroDashSdk.services.evidence.getEvidenceById(evidenceId);
    if (evidence.citationId) {
      const citationResp = await zeroDashSdk.services.evidence.getCitationById(
        evidence.citationId,
      );

      return {
        ...citationResp,
        evidenceId: evidence.id,
        evidenceType: 'CITATION',
      } as Evidence;
    }

    if (evidence.resourceId) {
      const resourceResp = await zeroDashSdk.services.evidence.getResourceById(
        evidence.resourceId,
      );

      return {
        ...resourceResp,
        evidenceId: evidence.id,
        evidenceType: 'RESOURCE',
      } as Evidence;
    }
    return null;
  }, [zeroDashSdk.services.evidence]);

  const getEvidenceDetails = useCallback(async (
    ids: string[],
    {
      evidenceDetailsFilters,
      citationFilters,
      resourceFilters,
      searchQuery,
    }: IGetEvidenceFilters,
  ): Promise<IGetEvidenceResp> => {
    const promises: Promise<void>[] = [];
    const pages = Math.ceil(ids.length / 100);
    const allEvidence: Evidence[] = [];
    const citations: ICitationWithMeta[] = [];
    const resources: IResourceWithMeta[] = [];
    for (let page = 1; page <= pages; page += 1) {
      promises.push(
        getAllEvidence({
          evidenceDetailsFilters: {
            ...evidenceDetailsFilters,
            ids,
            page,
            limit: 100,
          },
          citationFilters,
          resourceFilters,
          searchQuery,
        }).then((resp) => {
          allEvidence.push(...resp.allEvidence);
          citations.push(...resp.citations);
          resources.push(...resp.resources);
        }),
      );
    }

    await Promise.all(promises);

    return {
      allEvidence,
      citations,
      resources,
    };
  }, [getAllEvidence]);

  // get evidence from curation db and combine with information from the microservice
  const getCurationEvidence = useCallback(async ({
    evidenceLinkFilters,
    evidenceDetailsFilters,
    citationFilters,
    resourceFilters,
    searchQuery,
  }: IGetEvidenceLinkFilters): Promise<IGetEvidenceLinkResp> => {
    // get all the evidence given the filters
    const curationEvidence = await zeroDashSdk.curationEvidence.getEvidence(
      evidenceLinkFilters || {},
    );
    if (curationEvidence.length) {
      const {
        allEvidence,
        citations,
        resources,
      } = await getEvidenceDetails(curationEvidence.map((e) => e.externalId), {
        evidenceDetailsFilters,
        citationFilters,
        resourceFilters,
        searchQuery,
      });

      return {
        evidenceLinks: curationEvidence,
        allEvidence: allEvidence
          .filter((e) => e.id)
          .map((e) => ({
            ...e,
            internalEvidenceId: curationEvidence.find(
              (ce) => ce.externalId === e.evidenceId,
            )?.evidenceId,
          })),
        citations,
        resources,
      };
    }

    return {
      allEvidence: [],
      resources: [],
      citations: [],
      evidenceLinks: [],
    };
  }, [getEvidenceDetails, zeroDashSdk.curationEvidence]);

  const getClinicalEvidence = useCallback(async (
    {
      evidenceLinkFilters,
      evidenceDetailsFilters,
      citationFilters,
      resourceFilters,
      searchQuery,
    }: IGetEvidenceLinkFilters,
  ) => {
    const evidenceLinks = await zeroDashSdk.mtb.evidence.getEvidence(
      evidenceLinkFilters || {},
    );

    if (evidenceLinks.length) {
      const {
        allEvidence,
        citations,
        resources,
      } = await getEvidenceDetails(evidenceLinks.map((e) => e.externalId), {
        evidenceDetailsFilters,
        citationFilters,
        resourceFilters,
        searchQuery,
      });

      return {
        evidenceLinks,
        allEvidence: allEvidence
          .filter((e) => e.id)
          .map((e) => ({
            ...e,
            internalEvidenceId: evidenceLinks.find(
              (ce) => ce.externalId === e.evidenceId,
            )?.evidenceId,
          })),
        citations,
        resources,
      };
    }

    return {
      allEvidence: [],
      resources: [],
      citations: [],
      evidenceLinks: [],
    };
  }, [getEvidenceDetails, zeroDashSdk.mtb.evidence]);

  const createNewCurationEvidence = async (
    newEvidence: ICreateEvidenceLink,
  ): Promise<string> => zeroDashSdk.curationEvidence.createNewEvidence(newEvidence);

  const createNewEvidence = async (
    data: IGeneralEvidenceData,
    sampleId?: string,
  ): Promise<string> => {
    let evidenceId = '';
    if (data.citation) {
      evidenceId = await zeroDashSdk.services.evidence.addEvidence({
        citationData: data.citation,
      });
    }
    if (data.resource) {
      let fileId: string | undefined;
      if (data.resource.file) {
        fileId = await zeroDashSdk.filetracker.uploadFile(
          data.resource.file,
          {
            sampleId,
            fileName: data.resource.name,
            fileType: data.resource.type === 'IMG'
              ? 'png'
              : 'pdf',
            key: `/resource/${data.resource.name}/${data.resource.file.name}`,
          },
        );
      }
      evidenceId = await zeroDashSdk.services.evidence.addEvidence({
        resourceData: {
          ...data.resource,
          fileId: data.resource.fileId || fileId,
          file: undefined,
        },
      });
    }
    return evidenceId;
  };

  const updateRecommendationEvidence = async (
    description: string,
    recId: string,
    clinicalVersionId: string,
  ): Promise<void> => {
    const editor = createEditor();
    const descValue = parseText(description);
    editor.children = descValue.value;
    const externalIds = getRTEInlineCitations(editor);
    await zeroDashSdk.mtb.evidence.updateEvidence(
      {
        entityId: recId,
        entityType: 'RECOMMENDATION',
        externalIds,
        clinicalVersionId,
      },
    );
  };

  const updateSlideNoteEvidence = async (
    description: string,
    slideId: string,
    clinicalVersionId: string,
  ): Promise<void> => {
    const editor = createEditor();
    const descValue = parseText(description);
    editor.children = descValue.value;
    const externalInlineCitationIds = getRTEInlineCitations(editor);
    const externalEvidenceIds = getRTEEvidence(editor);
    await zeroDashSdk.mtb.evidence.updateEvidence(
      {
        entityId: slideId,
        entityType: 'SLIDE',
        externalIds: [...externalEvidenceIds, ...externalInlineCitationIds],
        clinicalVersionId,
      },
    );
  };

  return {
    getAllEvidence,
    getCurationEvidence,
    getClinicalEvidence,
    createNewCurationEvidence,
    createNewEvidence,
    getEvidenceById,
    updateRecommendationEvidence,
    updateSlideNoteEvidence,
  };
}
