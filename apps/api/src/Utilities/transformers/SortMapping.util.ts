/* eslint-disable @typescript-eslint/naming-convention */
import { IUser } from 'Models/Users/Users.model';

type DashboardTableAliases = {
  sampleTblAlias?: string;
  patientTblAlias?: string;
  meetingSampleTblAlias?: string;
  meetingTblAlias?: string;
  curatorPrimaryAlias?: string;
  curatorSecondaryAlias?: string;
  manifestTblAlias?: string;
  purityTableAlias?: string;
}

type CNVTableAliases = {
  somaticCNVTblAlias?: string;
  germlineCNVTblAlias?: string;
  geneTblAlias?: string;
}

type SNVTableAliases = {
  somaticSNVTblAlias?: string;
  germlineSNVTblAlias?: string;
  snvTableAlias?: string;
  geneTblAlias?: string;
}

type SVTableAliases = {
  geneTblAlias?: string;
  somaticSVTblAlias?: string;
  germlineSVTblAlias?: string;
}

type RNATableAliases = {
  somaticRNATblAlias?: string;
  geneTblAlias?: string;
}

type FileTrackerTableAliases = {
  datafilesTblAlias?: string;
}

type TableAliases = DashboardTableAliases
  | CNVTableAliases
  | SNVTableAliases
  | SVTableAliases
  | RNATableAliases
  | FileTrackerTableAliases;

export const taskDashboardActiveStateSort = (user: IUser, externalIdsList: string[]): string => {
  const parsedExternalIdsList = externalIdsList.map((id) => `'${id}'`).join(', ');

  return `(
    CASE
      WHEN expedite AND analysis.case_finalised_at IS NULL AND (primary_curator_id = '${user.id}' OR analysis.analysis_set_id IN (${parsedExternalIdsList})) THEN 6
      WHEN analysis.case_finalised_at IS NULL AND (primary_curator_id = '${user.id}' OR analysis.analysis_set_id IN (${parsedExternalIdsList})) THEN 5
      WHEN expedite AND analysis.case_finalised_at IS NULL THEN 4
      WHEN analysis.case_finalised_at IS NULL THEN 3
      WHEN expedite THEN 2
      ELSE 1
    END
  ) * 1 desc`;
};

export const dashboardActiveStateSort = (user: IUser): string => {
  const activeStates = "('Sequencing', 'In Pipeline','Ready to Start','In Progress')";

  return `(
    CASE
      WHEN expedite and curation_status in ${activeStates} and primary_curator_id = '${user.id}' THEN 8
      WHEN expedite and curation_status in ${activeStates} and secondary_curator_id = '${user.id}' THEN 7
      WHEN curation_status in ${activeStates} and primary_curator_id = '${user.id}' THEN 6
      WHEN curation_status in ${activeStates} and secondary_curator_id = '${user.id}' THEN 5
      WHEN expedite and curation_status in ${activeStates} THEN 4
      WHEN curation_status in ${activeStates} THEN 3
      WHEN expedite THEN 2
      ELSE 1
    END
  ) * 1 desc`;
};

export const dashboardNewStateSort = (): string => {
  const newStates = "('Sequencing', 'In Pipeline', 'Ready to Start')";

  return `(
    CASE
      WHEN expedite and curation_status in ${newStates} and primary_curator_id is NULL THEN 6
      WHEN curation_status in ${newStates} and primary_curator_id is NULL THEN 5
      WHEN expedite and curation_status in ${newStates} THEN 4
      WHEN curation_status in ${newStates} THEN 3
      WHEN expedite THEN 2
      ELSE 1
    END
  ) * 1`;
};

const chromosomeCustomOrder = (colummName: string): string => `(
    CASE
      WHEN ${colummName} = 'chr1' or ${colummName} = '1' THEN 1 
      WHEN ${colummName} = 'chr2' or ${colummName} = '2' THEN 2 
      WHEN ${colummName} = 'chr3' or ${colummName} = '3'  THEN 3 
      WHEN ${colummName} = 'chr4' or ${colummName} = '4'  THEN 4 
      WHEN ${colummName} = 'chr5' or ${colummName} = '5'  THEN 5 
      WHEN ${colummName} = 'chr6' or ${colummName} = '6'  THEN 6 
      WHEN ${colummName} = 'chr7' or ${colummName} = '7'  THEN 7 
      WHEN ${colummName} = 'chr8' or ${colummName} = '8'  THEN 8 
      WHEN ${colummName} = 'chr9' or ${colummName} = '9'  THEN 9 
      WHEN ${colummName} = 'chr10' or ${colummName} = '10'  THEN 10 
      WHEN ${colummName} = 'chr11' or ${colummName} = '11'  THEN 11 
      WHEN ${colummName} = 'chr12' or ${colummName} = '12'  THEN 12 
      WHEN ${colummName} = 'chr13' or ${colummName} = '13'  THEN 13 
      WHEN ${colummName} = 'chr14' or ${colummName} = '14'  THEN 14 
      WHEN ${colummName} = 'chr15' or ${colummName} = '15'  THEN 15 
      WHEN ${colummName} = 'chr16' or ${colummName} = '16'  THEN 16 
      WHEN ${colummName} = 'chr17' or ${colummName} = '17'  THEN 17 
      WHEN ${colummName} = 'chr18' or ${colummName} = '18'  THEN 18 
      WHEN ${colummName} = 'chr19' or ${colummName} = '19'  THEN 19 
      WHEN ${colummName} = 'chr20' or ${colummName} = '20'  THEN 20 
      WHEN ${colummName} = 'chr21' or ${colummName} = '21'  THEN 21 
      WHEN ${colummName} = 'chr22' or ${colummName} = '22'  THEN 22 
      WHEN ${colummName} = 'chrX' or ${colummName} = 'X'  THEN 23 
      WHEN ${colummName} = 'chrY' or ${colummName} = 'Y'  THEN 24 
      WHEN ${colummName} = 'chrM' or ${colummName} = 'M'  THEN 25
      ELSE 26 END
    ) * 1`;

export function classificationCustomOrder(
  reportableColName: string,
  classificationColName: string,
  pathclassColName?: string,
): string {
  if (pathclassColName) {
    const pcBlank = `${pathclassColName} is null or ${pathclassColName} = '0' or ${pathclassColName} = 'Unclassified'`;
    const pcLessThanC2 = `${pathclassColName} in ('C2: Likely Benign', 'C1: Benign', 'False Positive')`;
    return `(
      CASE
        WHEN ${classificationColName} = 'NOT REPORTABLE' and (${pcLessThanC2}) then 1
        WHEN ${classificationColName} = 'NOT REPORTABLE' and (${pcBlank}) then 2
        WHEN ${classificationColName} = 'NOT REPORTABLE' and ${pathclassColName} is not null then 3
        WHEN ${classificationColName} is null or ${classificationColName} = '' then 3
        WHEN ${reportableColName} = true then 5
        ELSE 4
      END
    ) * 1`;
  }
  return `(
      CASE
        WHEN ${classificationColName} = 'NOT REPORTABLE' then 1
        WHEN ${classificationColName} is null or ${classificationColName} = '' then 2
        ELSE 3
      END
    ) * 1`;
}

export function methGeneCustomOrder(): string {
  return `(
    CASE
      WHEN b.gene = 'MGMT' then 2
      ELSE 1
    END
  ) * 1`;
}

export function pathclassCustomOrder(colummName: string): string {
  return `(
    CASE ${colummName} 
      WHEN 'C5: Pathogenic' then 9
      WHEN 'C4: Likely Pathogenic' then 8
      WHEN 'C3.8: VOUS' then 7
      WHEN 'C3: VOUS' then 6
      WHEN 'GUS' then 5
      WHEN 'C2: Likely Benign' then 3
      WHEN 'C1: Benign' then 2
      WHEN 'False Positive' then 1
      WHEN 'Unclassified' then 1
      ELSE 4
    END
  ) * 1`;
}

export function geneCustomOrder(columnName: string): string {
  return `(
    CASE 
      WHEN ${columnName} = ? then 1
      ELSE 0
    END
  ) * 1 desc`;
}

export function htsHitOrder(tableAlias: string): string {
  return `(
    CASE
      WHEN ${tableAlias}.hit = 1 THEN 2
      WHEN ${tableAlias}.hit is NULL THEN 1
      ELSE 0
    END
  ) * 1 desc`;
}

export function htsReportableHitOrder(tableAlias: string): string {
  return `(
    CASE
      WHEN ${tableAlias}.reportable = 1 THEN 2
      WHEN ${tableAlias}.reportable is NULL THEN 1
      ELSE 0
    END
  ) * 1 desc`;
}

export function htsZScoreNullOrder(tableAlias: string): string {
  return `(
    CASE
      WHEN ${tableAlias}.zscore_auc is NULL THEN 0
      ELSE 1
    END
  ) * 1 desc`;
}

export function toDashboardColumn(key: string, tableAliases: DashboardTableAliases): string {
  const mappingTable = {
    'Manifest Created': `${tableAliases.manifestTblAlias}.created_at`,
    'Curation Date': `${tableAliases.meetingTblAlias}.date`,
    'Enrolment Date': `${tableAliases.patientTblAlias}.enrolment_date`,
    Purity: `${tableAliases.purityTableAlias}.purity`,
    'Mutation Burden': `${tableAliases.sampleTblAlias}.mut_burden_mb`,
  };

  return mappingTable[key];
}

export function toCNVColumn(key: string, tableAliases: CNVTableAliases): string {
  const mappingTable = {
    'Min Copy Number (CN)': `${tableAliases.somaticCNVTblAlias}.minCN`,
    'Max Copy Number (CN)': `${tableAliases.somaticCNVTblAlias}.maxCN`,
    Gene: `${tableAliases.geneTblAlias}.gene`,
    'Gene Start': `${tableAliases.geneTblAlias}.start_hg38`,
    'RNA Z-Score': `${tableAliases.somaticCNVTblAlias}.rna_zscore`,
    Chromosome: `${chromosomeCustomOrder('chromosome_hg38')}`,
  };

  return mappingTable[key];
}

export function toGermlineCNVColumn(key: string, tableAliases: CNVTableAliases): string {
  const mappingTable = {
    'Copy Number (CN)': `${tableAliases.germlineCNVTblAlias}.avecopynumber`,
    'Gene Start': `${tableAliases.geneTblAlias}.start_hg38`,
    Chromosome: `${chromosomeCustomOrder('chromosome_hg38')}`,
  };

  return mappingTable[key];
}

export function toSNVColumn(key: string, tableAliases: SNVTableAliases): string {
  const mappingTable = {
    'Helium Score': `${tableAliases.somaticSNVTblAlias}.helium_score`,
    Chromosome: `${chromosomeCustomOrder('chr')}`,
    'Gene Start': `${tableAliases.geneTblAlias}.gene_start`,
    VAF: `(${tableAliases.somaticSNVTblAlias}.altad / ${tableAliases.somaticSNVTblAlias}.depth)`,
    Reads: `${tableAliases.somaticSNVTblAlias}.altad`,
  };

  return mappingTable[key];
}

export function toSVColumn(key: string): string {
  const mappingTable = {
    'Start Gene': '`startGene.gene`',
    'End Gene': '`endGene.gene`',
    'Break Point 1': `${chromosomeCustomOrder('chrBkpt1')}`,
    'Break Point 1 Position': 'posBkpt1',
    'Helium Score': 'pathscore',
  };

  return mappingTable[key];
}

export function toRNAColumn(key: string, tableAliases: RNATableAliases): string {
  const mappingTable = {
    TPM: `${tableAliases.somaticRNATblAlias}.tpm`,
    'Mean Z-Score': `${tableAliases.somaticRNATblAlias}.zscore_mean * 1`,
    Chromosome: `${chromosomeCustomOrder('chromosome_hg38')}`,
    'Gene Start': `${tableAliases.geneTblAlias}.start_hg38`,
  };

  return mappingTable[key];
}

export function toFileTrackerColumn(key: string, tableAliases: FileTrackerTableAliases): string {
  const mappingTable = {
    'File Name': `${tableAliases.datafilesTblAlias}.filename`,
    Type: `CAST (${tableAliases.datafilesTblAlias}.filetype AS CHAR)`,
    Size: `${tableAliases.datafilesTblAlias}.filesize`,
  };

  return mappingTable[key];
}

export function toOrderBySQLQuery(
  mappingFn: (key: string, aliases: TableAliases) => string,
  tableAliases: TableAliases,
  sortColumns: Array<string>,
  sortDirections: Array<string>,
): string {
  const query = [];
  for (let i = 0; i < sortColumns.length; i += 1) {
    query.push(`${mappingFn(sortColumns[i], tableAliases)} ${sortDirections[i]}`);
  }

  return query.join(', ');
}
