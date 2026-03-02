import { decodeHTML } from 'entities';
import { MedlineArticleAuthor } from 'Models/Citation/PubMed.model';

export function getPubMedAuthorsString(authors: MedlineArticleAuthor): string {
  const authorsArr = Array.isArray(authors) ? authors : [authors];
  const authorsStr = authorsArr.reduce((prev, author) => {
    let acc = prev;
    if (acc.length) {
      acc += ', ';
    }

    if (author.CollectiveName) {
      acc += `${author.CollectiveName}`;
    } else if (author.ForeName && author.LastName) {
      acc += `${author.LastName} ${author.ForeName.substring(0, 1)}`;
    } else if (author.Initials && author.LastName) {
      acc += `${author.LastName} ${author.Initials.substring(0, 1)}`;
    } else {
      acc += `${author.LastName}`;
    }

    return decodeHTML(acc);
  }, '');

  return authorsStr;
}
