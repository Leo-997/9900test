import CustomTypography from '@/components/Common/Typography';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { formatInterpretationRTE } from '@/components/Reports/Common/HelperFunctions/formatInterpretation';
import sortByGene from '@/components/Reports/Common/HelperFunctions/sortByGene';
import { cytoCNTypeOptions } from '@/constants/options';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { ICurationComment } from '@/types/Comments/CurationComments.types';
import { BaseVariant } from '@/types/misc.types';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, useMemo, type JSX } from 'react';

const useStyles = makeStyles(() => ({
  textEditor: {
    fontSize: '13px !important',
  },
}));

export default function GermlineClinicalInterpretations(): JSX.Element {
  const classes = useStyles();

  const {
    germlineSnvs,
    germlineCnvs,
    germlineCytobands,
    germlineCytogenetics,
    germlineSvs,
    curationCommentThreads,
  } = useReportData();

  const isGermlineCyto = (variant: string): boolean => variant.includes('chr');

  const geneVariantMap = useMemo(() => {
    const geneMap: Record<string, BaseVariant[]> = {};
    const addVariant = (gene: string, variant: BaseVariant): void => {
      if (Object.hasOwn(geneMap, gene)) {
        geneMap[gene].push(variant);
      } else {
        geneMap[gene] = [variant];
      }
    };

    for (const germlineSnv of germlineSnvs || []) {
      addVariant(germlineSnv.gene, { variantType: 'GERMLINE_SNV', variantId: germlineSnv.variantId });
    }

    for (const germlineCnv of germlineCnvs || []) {
      addVariant(germlineCnv.gene, { variantType: 'GERMLINE_CNV', variantId: germlineCnv.geneId.toString() });
    }

    for (const germlineSv of germlineSvs || []) {
      // Fusions
      if (germlineSv.svType.toLowerCase() !== 'disruption' && (!germlineSv.markDisrupted || germlineSv.markDisrupted === 'No')) {
        addVariant(getCurationSVGenes(germlineSv), { variantType: 'GERMLINE_SV', variantId: germlineSv.variantId.toString() });
      }
      // Disruptions
      if (germlineSv.svType.toLowerCase() === 'disruption' || germlineSv.markDisrupted === 'Start' || germlineSv.markDisrupted === 'Yes') {
        addVariant(germlineSv.startGene.gene, { variantType: 'GERMLINE_SV', variantId: germlineSv.variantId.toString() });
      }
      if (germlineSv.markDisrupted === 'End' && germlineSv.svType.toLowerCase() !== 'disruption') {
        addVariant(germlineSv.endGene.gene, { variantType: 'GERMLINE_SV', variantId: germlineSv.variantId.toString() });
      }
      if (germlineSv.markDisrupted === 'Both' && germlineSv.svType.toLowerCase() !== 'disruption') {
        addVariant(`${germlineSv.startGene.gene} & ${germlineSv.endGene.gene}`, { variantType: 'GERMLINE_SV', variantId: germlineSv.variantId.toString() });
      }
    }

    for (const arm of germlineCytogenetics || []) {
      addVariant(arm.chr, { variantType: 'GERMLINE_CYTO', variantId: arm.chr, cnType: arm.cnType });
    }

    for (const band of germlineCytobands || []) {
      addVariant(band.chr, { variantType: 'GERMLINE_CYTO', variantId: band.chr, cnType: band.cnType });
    }

    return geneMap;
  }, [germlineCnvs, germlineCytobands, germlineCytogenetics, germlineSnvs, germlineSvs]);

  const getHeadingForCytogenetics = (chr: string): string => {
    const upperCaseChr = chr.charAt(0).toUpperCase() + chr.slice(1);
    const cnTypes = [...new Set(geneVariantMap[chr].map(
      (cyto) => cytoCNTypeOptions.find((o) => o.value === cyto.cnType)?.name,
    ))];

    if (cnTypes) {
      return cnTypes.map((cn) => `${upperCaseChr} ${cn}`).join(', ');
    }
    return upperCaseChr;
  };

  const getCommentsForVariant = (variant: BaseVariant): ICurationComment[] | undefined => (
    curationCommentThreads?.find((thread) => (
      thread.entityType === variant.variantType && thread.entityId === variant.variantId
    ))?.comments?.filter((c) => c.reportOrder && c.type !== 'VARIANT_INTERPRETATION')
  );

  const getCommentsForGene = (gene: string): ReactNode => {
    const variants = isGermlineCyto(gene)
    // Just fetch comments for the same variant in G CYTO.
    // Unlike SNV, CNV and SV, which can have SNV comments AND CNV comments for the same gene,
    // there are not going to be more than 1 set of comments for the same chromosome
    // as Germline Cytogenetics is the only Germline tab that deals with chromosomes.
      ? geneVariantMap[gene].slice(0, 1)
      : geneVariantMap[gene];

    return variants.map((v) => {
      const comments = getCommentsForVariant(v);

      return comments ? (
        <CustomTypography variant="bodySmall" className={classes.textEditor}>
          <RichTextEditor
            key={`${v.variantType}-${v.variantId}`}
            initialText={formatInterpretationRTE(comments)}
            condensed
            mode="readOnly"
            classNames={{
              editor: classes.textEditor,
            }}
            commentMode="readOnly"
            hideComments
          />
        </CustomTypography>
      ) : (
        <div />
      );
    });
  };

  return (
    <Box>
      <CustomTypography variant="h6" fontWeight="bold">
        <span
          style={{
            fontSize: '16px',
          }}
        >
          Clinical interpretation
        </span>
      </CustomTypography>
      <Box display="flex" flexDirection="column" gap="24px">
        {Object.keys(geneVariantMap).map((gene) => ({ gene })).sort(sortByGene).map((g) => (
          <Box key={g.gene}>
            <CustomTypography variant="bodySmall" fontWeight="bold">
              <span
                style={{
                  fontSize: '13px',
                }}
              >
                {isGermlineCyto(g.gene) ? getHeadingForCytogenetics(g.gene) : `Findings in ${g.gene}`}
              </span>
            </CustomTypography>
            <CustomTypography>
              <span
                style={{
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {getCommentsForGene(g.gene)}
              </span>
            </CustomTypography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
