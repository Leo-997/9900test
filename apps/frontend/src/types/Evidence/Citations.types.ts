import { externalCitationSources } from '@/constants/Common/evidence';

export type ExternalCitationSource = typeof externalCitationSources[number];

export type CitationSource = 'BOOK' | 'JOURNAL' | 'CONFERENCE' | ExternalCitationSource;

export interface ICitation {
  id: string;
  title: string;
  source: CitationSource;
  authors?: string;
  publication?: string;
  year?: number;
  link?: string;
  externalId?: string;
  evidenceId?: string;
}

export interface ICitationWithMeta extends ICitation {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
}

export type ICitationFilters = Partial<Omit<ICitation, 'id'>> & {
  ids?: string[];
  searchQuery?: string;
};

export type ICreateCitation = Pick<
  ICitation,
  | 'title'
  | 'authors'
  | 'publication'
  | 'year'
  | 'link'
  | 'source'
  | 'externalId'
>;

export type ICreatePubMedCitation = Required<Pick<
  ICitation,
  | 'externalId'
>>;

export type CreateCitationResp = Pick<ICitation, 'id'>;

export interface IExternalCitation {
  externalId: number | string;
  url: string;
  title: string | null;
  source: ExternalCitationSource;
  publicationName: string | null;
  publicationYear: number | null;
  authors: string | null;
  duplicateId?: string;
}

export interface IExternalCitationQuery {
  externalId: string;
  source: ExternalCitationSource;
}
