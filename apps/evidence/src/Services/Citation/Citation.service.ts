import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import { decodeHTML } from 'entities';
import { XMLParser } from 'fast-xml-parser';
import { CitationClient } from 'Clients/Citation/Citation.client';
import {
  UpdateCitationDTO, QueryCitationDTO, ICitation,
  IExternalCitation,
} from 'Models/Citation/Citation.model';
import { IPubMedArticleResp } from 'Models/Citation/PubMed.model';
import { IPMCRecord, PMCDate } from 'Models/Citation/PubMedCentral.model';
import { IUser } from 'Models/User/User.model';
import { getPMCAuthorsString } from 'Utils/PubMed/getPMCAuthorsString';
import { getPubMedAuthorsString } from 'Utils/PubMed/getPubMedAuthorsString';

@Injectable()
export class CitationService {
  constructor(
    private readonly citationClient: CitationClient,
  ) { }

  async getCitationById(id: string): Promise<ICitation> {
    return this.citationClient.getCitationById(id);
  }

  async getAllCitations(filters: QueryCitationDTO): Promise<ICitation[]> {
    return this.citationClient.getAllCitations(filters);
  }

  async createCitation(citation: UpdateCitationDTO, user: IUser): Promise<string> {
    return this.citationClient.createCitation(citation, user);
  }

  async updateCitation(id: string, citation: UpdateCitationDTO, user: IUser): Promise<string> {
    return this.citationClient.updateCitation(id, citation, user);
  }

  async deleteCitation(id: string, user: IUser): Promise<void> {
    await this.citationClient.deleteCitation(id, user);
  }

  public async getPubMedCitation(
    externalId: string,
  ): Promise<IExternalCitation> {
    const response = await axios.get<string>(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${externalId}&retmode=xml`,
    );

    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const parsedResp: IPubMedArticleResp = xmlParser.parse(
      response.data.replace(/<i>(.*?)<\/i>/gm, '$1'),
    );

    const pubmedArticle = parsedResp?.PubmedArticleSet?.PubmedArticle;
    if (!pubmedArticle) {
      throw new NotFoundException(`No PubMed article found for ID ${externalId}`);
    }

    const article = pubmedArticle.MedlineCitation?.Article;
    // title
    const rawTitle = article?.ArticleTitle;
    const title = typeof rawTitle === 'string'
      ? decodeHTML(rawTitle ?? '').trim() || null
      : decodeHTML(rawTitle?.['#text'] ?? '').trim() || null;

    // publicationYear
    const pubDate = article?.Journal?.JournalIssue?.PubDate;
    let publicationYear: number | null = null;
    if (typeof pubDate?.Year === 'number') {
      publicationYear = pubDate.Year;
    } else if (typeof pubDate?.Year === 'string') {
      const parsedYear = parseInt(pubDate.Year, 10);
      if (!Number.isNaN(parsedYear)) publicationYear = parsedYear;
    } else if (pubDate?.MedlineDate) {
      const match = pubDate.MedlineDate.match(/^([0-9]{4})/);
      if (match) publicationYear = parseInt(match[1], 10);
    }

    // publicationName
    const publicationName = decodeHTML(article?.Journal?.Title || '').trim() || null;

    // authors
    const authors = getPubMedAuthorsString(article?.AuthorList?.Author || [])
      .trim()
      || null;

    // url
    const url = `https://pubmed.ncbi.nlm.nih.gov/${externalId}`;

    // source
    const source = 'PUBMED';

    // duplicateId
    // Confirm if record for this citation already exists in zcc_citation
    const existingPubMedRecord = await this.citationClient.getCitationByExternalId(
      externalId,
      source,
    ) || null;
    // Check if a corresponding PMCID exists for this PubMedID
    // and, if it does, confirm if record already exists for corresponding PMCID
    const articleIdList = pubmedArticle.PubmedData.ArticleIdList.ArticleId;
    let correspondingPMCID: string | undefined;
    if (articleIdList) {
      if (Array.isArray(articleIdList)) {
        correspondingPMCID = articleIdList
          .find((articleId) => articleId['@_IdType'] === 'pmc')
          ?.['#text']
          .toString();
      } else {
        correspondingPMCID = (articleIdList)['@_IdType'] === 'pmc'
          ? articleIdList?.['#text'].toString()
          : undefined;
      }
    }

    const existingPMCRecord = correspondingPMCID
      ? await this.citationClient.getCitationByExternalId(
        correspondingPMCID,
        'PMC',
      ) : null;

    return {
      externalId,
      title,
      publicationName,
      publicationYear,
      authors,
      url,
      source,
      duplicateId: existingPubMedRecord?.externalId || existingPMCRecord?.externalId,
    };
  }

  public async getPubMedCentralCitation(
    externalId: string,
  ): Promise<IExternalCitation> {
    const parsedId = externalId.replace('PMC', '');
    const response = await axios.get(`https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi?verb=GetRecord&identifier=oai:pubmedcentral.nih.gov:${parsedId}&metadataPrefix=oai_dc`);

    const xmlParser = new XMLParser();
    const parsedResp = xmlParser.parse(response.data);
    const pmcRecord: IPMCRecord = parsedResp?.['OAI-PMH']?.GetRecord?.record?.metadata?.['oai_dc:dc'];

    if (!pmcRecord) {
      throw new NotFoundException(`No PMC citation found for ID ${externalId}`);
    }

    // title
    const title = decodeHTML(pmcRecord['dc:title'] ?? '').trim() || null;

    // authors
    const authors = getPMCAuthorsString(pmcRecord['dc:creator']).trim() || null;

    // publication name
    const publicationName = decodeHTML(pmcRecord['dc:source'] ?? '').trim() || null;

    // publication year
    let publicationYear: number | null = null;

    const pmcRecordDate: PMCDate = pmcRecord['dc:date'];
    let journalPublicationDate: string | undefined;

    if (pmcRecordDate) {
      if (typeof pmcRecordDate === 'string') journalPublicationDate = pmcRecordDate;
      if (Array.isArray(pmcRecordDate)) {
        journalPublicationDate = pmcRecordDate.reduce(
          (latest, current) => (dayjs(current).isAfter(dayjs(latest)) ? current : latest),
        );
      }
    }

    if (journalPublicationDate) {
      const date = dayjs(journalPublicationDate);
      if (date.isValid()) publicationYear = date.year();
    }

    // url
    const url = `https://www.ncbi.nlm.nih.gov/pmc/articles/${externalId}`;

    // source
    const source = 'PMC';

    // duplicateId
    // Confirm if record for this citation already exists in zcc_citation
    const existingPMCRecord = await this.citationClient.getCitationByExternalId(
      externalId,
      source,
    ) || null;

    // Check if a corresponding PubMedID exists for this PMCID
    // and, if it does, confirm if record already exists for corresponding PubMedID
    const pmcIdentifiers = pmcRecord['dc:identifier'];
    let correspondingPubMedID: string | undefined;

    if (pmcIdentifiers) {
      if (Array.isArray(pmcIdentifiers)) {
        correspondingPubMedID = pmcIdentifiers
          .find((i) => i.includes('/pubmed/')) // "/pubmed/39926108" for example
          ?.match(/\/pubmed\/(\d+)/)
          ?.[1];
      } else {
        correspondingPubMedID = pmcIdentifiers
          ?.match(/\/pubmed\/(\d+)/)
          ?.[1];
      }
    }

    const existingPubMedRecord = correspondingPubMedID
      ? await this.citationClient.getCitationByExternalId(
        correspondingPubMedID,
        'PUBMED',
      )
      : null;

    return {
      externalId,
      title,
      publicationName,
      publicationYear,
      authors,
      url,
      source,
      duplicateId: existingPubMedRecord?.externalId || existingPMCRecord?.externalId,
    };
  }

  public async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldCitationIds = await this.citationClient.getOldCitationIds(
      cutoffDate,
      compareColumn,
    );
    logger.log(`Found ${oldCitationIds.length} old citations to delete`);

    if (oldCitationIds.length === 0) {
      return 0;
    }

    const trx = await this.citationClient.getTransaction();

    try {
      const evidenceDeleted = await this.citationClient.deleteEvidenceByCitationIds(
        oldCitationIds,
        trx,
      );
      logger.log(`Deleted ${evidenceDeleted} related evidence records`);

      const citationsDeleted = await this.citationClient.permanentlyDeleteCitations(
        oldCitationIds,
        trx,
      );
      logger.log(`Deleted ${citationsDeleted} citations`);

      const totalDeleted = evidenceDeleted + citationsDeleted;
      logger.log(`Total records deleted: ${totalDeleted}`);
      await trx.commit();
      return totalDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during citation cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }
}
