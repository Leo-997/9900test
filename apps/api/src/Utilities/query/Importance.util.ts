import { Knex } from 'knex';

export function withPrismGeneListImportance(
  qb: Knex.QueryBuilder,
  prismGeneListColumn: string,
  aliasName = 'geneListImportance',
): void {
  qb.select({
    [aliasName]: qb.client.raw(`(
      CASE
        WHEN ${prismGeneListColumn} LIKE 'P%T1(%' THEN 1
        WHEN ${prismGeneListColumn} = 'P,T1' THEN 2
        WHEN ${prismGeneListColumn} LIKE 'P%T2(%' THEN 3
        WHEN ${prismGeneListColumn} = 'P,T2' THEN 4
        WHEN ${prismGeneListColumn} = 'P' THEN 5
        WHEN ${prismGeneListColumn} LIKE 'T1(%' THEN 6
        WHEN ${prismGeneListColumn} = 'T1' THEN 7
        WHEN ${prismGeneListColumn} LIKE 'T2(%' THEN 8
        WHEN ${prismGeneListColumn} = 'T2' THEN 9
        ELSE 10
      END
    )`),
  });
}

export function withVariantImportance(
  qb: Knex.QueryBuilder,
  geneListColumn: string,
  variantPathogenicClass: string,
  aliasName = 'variant_importance',
): void {
  if (!geneListColumn) {
    geneListColumn = variantPathogenicClass;
  }

  if (!variantPathogenicClass) {
    variantPathogenicClass = geneListColumn;
  }

  if (!geneListColumn && !variantPathogenicClass) {
    return;
  }

  qb.select({
    [aliasName]: qb.client.raw(
      `(
        CASE WHEN ${geneListColumn} like 'P%T1(%' THEN 1
        WHEN ${variantPathogenicClass} like 'C5%' THEN 1

        WHEN ${geneListColumn}='P,T1' THEN 2
        WHEN ${variantPathogenicClass} like 'C4%' THEN 2

        WHEN ${geneListColumn} like 'P%T2(%' THEN 3
        -- WHEN ${variantPathogenicClass} like 'C3.8%' THEN 3

        WHEN ${geneListColumn}='P,T2' THEN 4
        -- WHEN ${variantPathogenicClass} like 'C3%' THEN 4

        WHEN ${geneListColumn}='P' THEN 5

        WHEN ${geneListColumn} like 'T1(%' THEN 6
        -- WHEN ${variantPathogenicClass} like 'C2%' THEN 6

        WHEN ${geneListColumn}='T1' THEN 7

        WHEN ${geneListColumn} like 'T2(%' THEN 8

        WHEN ${geneListColumn}='T2' THEN 9

        WHEN ${variantPathogenicClass} like 'C1%' THEN 10
        ELSE 10
        END
      )`,
    ),
  });
}

export const importanceClassToValues = (importance: string) => {
  switch (importance.toLowerCase()) {
    case 'high':
      return [1, 2];
    case 'mediumhigh':
      return [3, 4, 5];
    case 'mediumlow':
      return [6, 7, 9];
    case 'low':
      return [10];
    default:
      return [];
  }
};

export const hasImportance = (
  query: any,
  importanceCol: string,
  importance: Array<string>,
) => {
  if (!importance) {
    return;
  }
  let importanceNumbers = [];

  importance.forEach(
    (imp) =>
      (importanceNumbers = [
        ...importanceNumbers,
        ...importanceClassToValues(imp),
      ]),
  );

  return query.havingIn(importanceCol, importanceNumbers);
};
