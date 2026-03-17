type MolecularAlterationDetailsTableAliases = {
  clinicalVersionTblAlias?: string;
}

type SampleFilterTableAliases = {
  clinicalVersionTblAlias?: string;
  patientsTblAlias?: string;
  sampleTblAlias?: string;
}

type TableAliases = MolecularAlterationDetailsTableAliases | SampleFilterTableAliases;

export const recommendationsSort = (
  typeColumn: string,
  tierColumn: string,
): string => `(
    CASE
      WHEN ${typeColumn} = "THERAPY" THEN 
        CASE
          WHEN ${tierColumn} LIKE '1%' THEN 10
          WHEN ${tierColumn} LIKE '2%' THEN 9
          WHEN ${tierColumn} LIKE '3%' THEN 8
          WHEN ${tierColumn} LIKE '4%' THEN 7
          WHEN ${tierColumn} LIKE '5%' THEN 6
          WHEN ${tierColumn} is null THEN 5
        END
      WHEN ${typeColumn} = "CHANGE_DIAGNOSIS" THEN 4
      WHEN ${typeColumn} = "GERMLINE" THEN 3
      WHEN ${typeColumn} = "TEXT" THEN 2
      ELSE 1
    END
  ) * 1`;

export const addendumRecsSort = (idColumn: string, recIds: string): string => `(
    CASE
      WHEN ${idColumn} in (${recIds || '\'\''}) THEN 2
      ELSE 1
    END
  ) * 1`;

export function toOrderBySQLQuery(
  mappingFn: (col: string, tblAliases: TableAliases) => string,
  tableAliases: TableAliases,
  sortColumns: string[],
  sortDirections: string[],
): string {
  const query = [];
  for (let i = 0; i < sortColumns.length; i += 1) {
    query.push(`${mappingFn(sortColumns[i], tableAliases)} ${sortDirections[i]}`);
  }

  return query.join(', ');
}
