import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { IReportTableRow } from '@/types/Reports/Table.types';
import { useCallback, useMemo, type JSX } from 'react';
import { biomaterialTableWidths } from '../../../../../constants/Reports/tableWidths';
import { IBiomaterial } from '../../../../../types/Samples/Sample.types';
import { formatBiomaterial, getLegend } from '../../../Common/TableFormatters/Biomaterials';
import { Table } from '../Table/Table';

interface IProps {
  biomaterials: IBiomaterial[]
  showPreclinical?: boolean;
  canManage?: boolean;
}

export function BiomaterialTable({
  biomaterials,
  showPreclinical = false,
  canManage = false,
}: IProps): JSX.Element {
  const { reportType } = useReport();
  const { reportMetadata } = useReport();
  const { htsBiosamples } = useAnalysisSet();

  const sortBiomaterials = (a: IBiomaterial, b: IBiomaterial): number => {
    const getPriority = (biomaterial: IBiomaterial): number => {
      if (biomaterial.biosampleStatus === 'normal' && biomaterial.assays?.some((assay) => assay.sampleType === 'wgs')) return 1;
      if (biomaterial.biosampleStatus === 'normal' && biomaterial.assays?.some((assay) => assay.sampleType === 'rnaseq')) return 2;
      if (biomaterial.biosampleStatus === 'donor' && biomaterial.assays?.some((assay) => assay.sampleType === 'wgs')) return 3;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'wgs')) return 4;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'methylation')) return 5;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'rnaseq')) return 6;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'panel' && assay.biosampleType === 'dna')) return 7;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'panel' && assay.biosampleType === 'rna')) return 8;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'hts')) return 9;
      if (biomaterial.biosampleStatus === 'tumour' && biomaterial.assays?.some((assay) => assay.sampleType === 'pdx')) return 10;
      return 11;
    };

    return getPriority(a) - getPriority(b);
  };

  const filterBiomaterials = useCallback((biomaterial: IBiomaterial): boolean => {
    const isBiomaterialHTS = biomaterial.assays?.every((a) => a.sampleType.toLowerCase() === 'hts');
    const htsSelectedBiosample = htsBiosamples?.find((b) => b.biosampleId === reportMetadata?.['preclinical.htsBiosampleId']);
    const isSelectedBiomaterial = htsSelectedBiosample
      && htsSelectedBiosample.biomaterialId === biomaterial.biomaterialId;
    return (
      Boolean(biomaterial.biomaterialId)
      && Boolean((showPreclinical && isSelectedBiomaterial) || !isBiomaterialHTS)
    );
  }, [htsBiosamples, reportMetadata, showPreclinical]);

  const sortedBiomaterials: IReportTableRow[] = useMemo(() => biomaterials
    ?.filter((b) => filterBiomaterials(b))
    ?.sort(sortBiomaterials), [biomaterials, filterBiomaterials])
    ?.map((biomaterial) => ({
      columns: formatBiomaterial(
        biomaterial,
        biomaterialTableWidths,
        htsBiosamples,
        reportMetadata,
        showPreclinical,
      ),
      entityType: 'BIOMATERIALS',
      entityId: biomaterial.biomaterialId.toString(),
    })) || [];

  return (
    <Table
      key={JSON.stringify(sortedBiomaterials)}
      title="Biomaterials and molecular profiling assays"
      variantType="BIOMATERIALS"
      header={[{
        columns: [
          { width: biomaterialTableWidths[0], content: 'Biosample ID' },
          { width: biomaterialTableWidths[1], content: 'Sample type' },
          { width: biomaterialTableWidths[2], content: 'Preservation' },
          { width: biomaterialTableWidths[3], content: 'Collected' },
          { width: biomaterialTableWidths[4], content: 'Received' },
          { width: biomaterialTableWidths[5], content: 'Assays' },
        ],
      }]}
      rows={sortedBiomaterials}
      noRowsMessage="No biomaterial information found."
      legend={getLegend(biomaterials || [], reportType)}
      canManage={canManage}
    />
  );
}
