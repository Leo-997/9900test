/* eslint-disable @typescript-eslint/naming-convention */

interface IMedlineCitationDate {
  Year: number;
  Month: number;
  Day: number;
  Hour?: number;
  Minute?: number;
}

interface IMedlineCitationAuthor {
  LastName: string;
  ForeName: string;
  Initials: string;
  AffiliationInfo: {
    Affiliation: string;
  };
}

interface IMedlineCitationGrant {
  GrantID: string;
  Agency: string;
  Country: string;
}

interface IMedlineCitationMeshHeading {
  DescriptorName: string;
  QualifierName: string;
}

interface IPubmedReference {
  Citation: string;
  ArticleIdList: {
    ArticleId: number;
  };
}

interface IMedlineJournalInfo {
  Country: string;
  MedlineTA: string;
  NlmUniqueID: string;
  ISSNLinking: string;
}

interface IMedlineJournal {
  ISSN: string;
  JournalIssue: {
    Volume: number;
    Issue: number;
    PubDate: {
      Year: number;
      Month: string;
    };
  };
  Title: string;
  ISOAbbreviation: string;
}

interface IMedlineArticle {
  Journal: IMedlineJournal;
  ArticleTitle: string;
  Pagination: {
    MedlinePgn: string;
  };
  Abstract: {
    AbstractText: string;
  };
  AuthorList: {
    Author: IMedlineCitationAuthor[];
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

export interface IPubmedArticleResp {
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
          ArticleId: any[];
        };
        ReferenceList: {
          Reference: IPubmedReference[];
        };
      };
    };
  };
}

export interface IPubmedCitation {
  pmid: number;
  title: string;
  publicationName: string;
  publicationYear: number;
  authors: string;
  url: string;
}
