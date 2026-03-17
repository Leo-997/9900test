import { decodeHTML } from 'entities';
import { PMCCreators } from 'Models/Citation/PubMedCentral.model';

export function getPMCAuthorsString(
  rawAuthors: PMCCreators,
): string {
  const authorsArr = Array.isArray(rawAuthors) ? rawAuthors : [rawAuthors];

  return authorsArr
    .map((author) => {
      if (!author.includes(',')) return decodeHTML(author.trim()); // fallback for orgs or malformed names

      const [lastName, givenNames = ''] = author.split(',').map((s) => s.trim());
      const firstNameInitial = givenNames.charAt(0);

      return decodeHTML(`${lastName}${firstNameInitial ? ` ${firstNameInitial}` : ''}`);
    })
    .join(', ');
}
