/* eslint-disable @typescript-eslint/naming-convention */
interface IMedlineCitationDate {
  Year: number;
  Month: number;
  Day: number;
  Hour?: number;
  Minute?: number;
}

interface IMedlineJournal {
  ISSN: string;
  JournalIssue: {
    Volume: number;
    Issue: number;
    PubDate: {
      Year: number;
      Month: string;
      MedlineDate: string;
    };
  };
  Title: string;
  ISOAbbreviation: string;
}

interface IArticleTitle {
  '#text': string;
  i: string;
}

interface IMedlineCitationAuthor {
  LastName?: string;
  ForeName?: string;
  Initials?: string;
  AffiliationInfo?: {
    Affiliation: string;
  };
  CollectiveName?: string;
}

export type MedlineArticleAuthor = IMedlineCitationAuthor[] | IMedlineCitationAuthor;

interface IMedlineCitationGrant {
  GrantID: string;
  Agency: string;
  Country: string;
}

interface IMedlineArticle {
  Journal: IMedlineJournal;
  ArticleTitle: string | IArticleTitle;
  Pagination: {
    MedlinePgn: string;
  };
  Abstract: {
    AbstractText: string;
  };
  AuthorList: {
    Author: MedlineArticleAuthor;
  };
  Language: string;
  GrantList: {
    Grant: IMedlineCitationGrant[];
  };
  PublicationTypeList: {
    PublicationType: string[];
  };
  ArticleDate: IMedlineCitationDate;
}

interface IMedlineJournalInfo {
  Country: string;
  MedlineTA: string;
  NlmUniqueID: string;
  ISSNLinking: string;
}

interface IMedlineCitationMeshHeading {
  DescriptorName: string;
  QualifierName: string;
}

interface IPubMedReference {
  Citation: string;
  ArticleIdList: {
    ArticleId: number;
  };
}

export type PubMedArticleId = {
  '#text': string | number;
  '@_IdType': string; // e.g.: 'pubmed', 'pmc', 'doi', 'pii'
}
export type PubMedArticleIdList = PubMedArticleId | PubMedArticleId[];
export interface IPubMedArticleResp {
  PubmedArticleSet: {
    PubmedArticle: {
      MedlineCitation: {
        PMID: number;
        DateCompleted: IMedlineCitationDate;
        DateRevised: IMedlineCitationDate;
        Article: IMedlineArticle;
        MedlineJournalInfo: IMedlineJournalInfo;
        CitationSubset: string;
        MeshHeadingList: {
          MeshHeading: IMedlineCitationMeshHeading[];
        };
      };
      PubmedData: {
        History: {
          PubMedPubDate: IMedlineCitationDate[];
        };
        PublicationStatus: string;
        ArticleIdList: {
          ArticleId: PubMedArticleIdList;
        };
        ReferenceList: {
          Reference: IPubMedReference[];
        };
      };
    };
  };
}
