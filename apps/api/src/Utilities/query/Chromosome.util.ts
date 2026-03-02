import { Knex } from 'knex';

export function withChromosomeNumericValue(
  qb: Knex.QueryBuilder,
  chromosomeStrValue: string,
  aliasName = 'chrNum',
): void {
  qb.select({
    [aliasName]: qb.client.raw(`(
      CASE       
        WHEN ${chromosomeStrValue} = 'X' THEN 23       
        WHEN ${chromosomeStrValue} = 'Y' THEN 24  
        WHEN ${chromosomeStrValue} = 'MT' THEN 25  
        WHEN ${chromosomeStrValue} like 'GL%' THEN 26        
        ELSE CAST(${chromosomeStrValue} AS UNSIGNED)
      END
    )`),
  });
}
