import { IPatient } from '@/types/Patient/Patient.types';
import isCytoArmLoh from '@/utils/functions/isCytoArmLoh';
import { cytoCNTypeOptions } from '../../../../constants/options';
import { ICurationComment, ReportCurationComment } from '../../../../types/Comments/CurationComments.types';
import { ICytogeneticsData, ISampleCytoband } from '../../../../types/Cytogenetics.types';
import { IReportTableRow } from '../../../../types/Reports/Table.types';
import { toFixed } from '../../../../utils/math/toFixed';
import { formatInterpretationRTE } from '../HelperFunctions/formatInterpretation';

interface IReportableCyto extends Pick<IReportTableRow, 'entityType' | 'entityId'> {
  chromosome: string;
  label: string;
  copyNumber?: number;
  type?: string;
  arm?: string;
  childRows?: IReportableCyto[];
  cnType?: string;
  isLoh?: boolean;
  isArmLoh?: boolean;
}

const nonLOHCNTypes = ['1_COPY_LOSS', 'NEU_LOH', 'LOH'];

const getCytoband = (cytoband: ISampleCytoband): string => {
  const parts = cytoband.cytoband.split(';');
  if (parts.length > 1) {
    return `${parts[0]} - ${parts[parts.length - 1]}`;
  } if (parts.length === 1) {
    return parts[0];
  }
  return cytoband.cytoband;
};

export function combineCytobands(
  entityType: 'CYTOGENETICS_ARM'| 'GERMLINE_CYTO_ARM',
  armCNVs: ICytogeneticsData[],
  cytobands: ISampleCytoband[],
  patient?: IPatient,
): IReportableCyto[] {
  const combinedCytos: IReportableCyto[] = [];
  for (const armCNV of armCNVs) {
    const cyto = combinedCytos.find((c) => c.chromosome === armCNV.chr.replace('chr', ''));
    const isArmLoh = isCytoArmLoh(armCNV.chr, armCNV, patient?.sex === 'Male') && !nonLOHCNTypes.includes(armCNV.cnType);
    const cnType = cytoCNTypeOptions.find((c) => c.value === armCNV.cnType);
    const armCombinedCyto: IReportableCyto = {
      chromosome: armCNV.chr.replace('chr', ''),
      label: armCNV.chr.replace('chr', ''),
      copyNumber: armCNV.avgCN,
      type: `${cnType?.name}${isArmLoh ? ' - LOH' : ''} (chromosome arm)`,
      arm: armCNV.arm,
      cnType: cnType?.value,
      isArmLoh,
      entityId: armCNV.chr,
      entityType,
    };
    if (cyto && cyto.cnType === armCNV.cnType) {
      const bothLoh = cyto.isLoh && isArmLoh;
      cyto.copyNumber = cyto.copyNumber ? (cyto.copyNumber + armCNV.avgCN) / 2 : armCNV.avgCN;
      cyto.type = `${cnType?.name}${bothLoh ? ' - LOH' : ''} (whole chromosome)`;
      cyto.arm = '';
    } else if (cyto) {
      cyto.childRows = [armCombinedCyto];
    } else {
      combinedCytos.push(armCombinedCyto);
    }
  }

  for (const cyto of cytobands) {
    const parent = combinedCytos.find((c) => c.chromosome === cyto.chr.replace('chr', ''));
    const cnType = cytoCNTypeOptions.find((c) => c.value === cyto.cnType);
    const repCyto: IReportableCyto = {
      chromosome: cyto.chr.replace('chr', ''),
      label: getCytoband(cyto),
      type: `${cnType?.name || '-'} (segmental)`,
      copyNumber: cyto.customCn ?? cyto.avgCN as number,
      arm: '',
      entityId: cyto.cytoband,
      entityType,
    };
    if (parent?.childRows) {
      parent.childRows.push(repCyto);
    } else if (parent) {
      parent.childRows = [repCyto];
    } else {
      combinedCytos.push({
        chromosome: cyto.chr.replace('chr', ''),
        label: cyto.chr.replace('chr', ''),
        childRows: [repCyto],
      });
    }
  }

  return combinedCytos.sort((a, b) => (
    Number.parseInt(a.chromosome.replace('chr', ''), 10)
    - Number.parseInt(b.chromosome.replace('chr', ''), 10)
  ));
}

const getRow = (
  cyto: IReportableCyto,
  showComments: boolean,
  widths: string[],
  comments: Record<string, ICurationComment[]> = {},
  additionalGermComments: ReportCurationComment[] = [],
): IReportTableRow => ({
  columns: [
    { width: widths[0], content: `${cyto.label}${cyto.arm}` },
    { width: widths[1], content: toFixed(cyto.copyNumber || 0, 2) },
    { width: widths[2], content: cyto.type },
  ],
  styleOverrides: !showComments ? { borderBottom: 'none' } : undefined,
  noBottomBorder: !showComments,
  interpretation: showComments && comments && comments[`chr${cyto.chromosome}`]?.length
    ? formatInterpretationRTE([
      ...comments[`chr${cyto.chromosome}`],
      ...additionalGermComments,
    ])
    : undefined,
  entityType: cyto.entityType,
  entityId: cyto.entityId,
});

export function getCytogeneticsRows(
  entityType: 'CYTOGENETICS_ARM'| 'GERMLINE_CYTO_ARM',
  armCNVs: ICytogeneticsData[],
  cytobands: ISampleCytoband[],
  widths: string[],
  patient?: IPatient,
  comments: Record<string, ICurationComment[]> = {},
  additionalGermComments: ReportCurationComment[] = [],
): IReportTableRow[] {
  const combinedCytobands = combineCytobands(entityType, armCNVs, cytobands, patient);
  const rows: IReportTableRow[] = [];
  for (const cyto of combinedCytobands) {
    if (cyto.type) {
      rows.push(getRow(cyto, !cyto.childRows, widths, comments, additionalGermComments));
    }
    if (cyto.childRows) {
      for (const [index, band] of cyto.childRows.entries()) {
        rows.push(getRow(
          band,
          index === cyto.childRows.length - 1,
          widths,
          comments,
          additionalGermComments,
        ));
      }
    }
  }
  return rows;
}
