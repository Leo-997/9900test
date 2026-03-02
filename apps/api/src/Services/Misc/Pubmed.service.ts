import { XMLParser } from 'fast-xml-parser';
import { Injectable } from '@nestjs/common';
import {
  IPubmedArticleResp,
  IPubmedCitation,
} from 'Models/Misc/Pubmed/ArticleCitation.model';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PubmedService {
  constructor(private httpService: HttpService) {}

  public async getPubmedArticleCitation(
    id: number,
    numAuthors?: number,
  ): Promise<IPubmedCitation> {
    const resp = await this.httpService
      .get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${id}&retmode=xml`,
      )
      .toPromise();

    const { data } = resp;
    const pubmedJson: IPubmedArticleResp = XMLParser.prototype.parse(data);

    const title = pubmedJson?.PubmedArticleSet?.PubmedArticle?.MedlineCitation?.Article
      ?.ArticleTitle;
    const pubYear = pubmedJson?.PubmedArticleSet?.PubmedArticle?.MedlineCitation?.Article
      ?.Journal?.JournalIssue?.PubDate?.Year;
    const pubName = pubmedJson?.PubmedArticleSet?.PubmedArticle?.MedlineCitation?.Article
      ?.Journal?.Title;
    const authorArr = pubmedJson?.PubmedArticleSet?.PubmedArticle?.MedlineCitation?.Article
      ?.AuthorList?.Author || [];
    const authorsStr = authorArr.slice(0, numAuthors).reduce((acc, author) => {
      let str = acc;
      if (str.length) {
        str += ', ';
      }
      str += `${author.ForeName.substring(0, 1)}. ${author.LastName}`;

      return str;
    }, '');

    const url = `https://pubmed.ncbi.nlm.nih.gov/${id}`;

    return {
      pmid: id,
      title,
      publicationName: pubName,
      publicationYear: pubYear,
      authors: authorsStr,
      url,
    };
  }
}
