import {
  Box,
  Grid, styled,
  ThemeProvider,
} from '@mui/material';
import { saveAs } from '@progress/kendo-file-saver';
import clsx from 'clsx';
import { ChevronDownIcon } from 'lucide-react';
import {
  JSX,
  useEffect, useMemo, useRef,
  useState,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { defaultEmptyList } from '@/constants/Curation/genes';
import { molecularReportTags } from '@/constants/Reports/comments';
import {
  molecularReportDisclaimer,
  molecularReportLimitations,
  molecularReportMethods,
  mtbReportDisclaimer,
  mtbReportLimitations,
  mtbReportMethods,
} from '@/constants/Reports/reports';
import { noPanelGenePanels } from '@/constants/sample';
import { ClinicalProvider } from '@/contexts/ClinicalContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { useReport } from '../../../contexts/Reports/CurrentReportContext';
import { useReportData } from '../../../contexts/Reports/ReportDataContext';
import { generateReportPDF } from '../../../utils/functions/reportGenerationHelpers';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CurationReportCommentInput from '../Components/HTMLPDF/Comments/TextBox/CurationReportCommentInput';
import { Disclaimer, Limitations, Methods } from '../Components/HTMLPDF/Hardcoded';
import { BiomaterialTable, PatientProfile, TumourMolecularProfileTable } from '../Components/HTMLPDF/Profile';
import { TumourImmuneProfileTable } from '../Components/HTMLPDF/Profile/TumourImmuneProfileTable';
import { References } from '../Components/HTMLPDF/References/References';
import { ISignaturesRef, Signatures } from '../Components/HTMLPDF/Signatures/Signatures';
import { CNVSummary } from '../Components/HTMLPDF/Summary/CNVSummary';
import { GermlineSNVSummary } from '../Components/HTMLPDF/Summary/GermlineSNVSummary';
import { GermlineSVSummary } from '../Components/HTMLPDF/Summary/GermlineSVSummary';
import { MolecularClassifiersTable } from '../Components/HTMLPDF/Summary/MolecularClassifiersTable';
import ReportRecommendations from '../Components/HTMLPDF/Summary/ReportRecommendations';
import { RNASeqTable } from '../Components/HTMLPDF/Summary/RNASeqTable';
import { SomaticSNVSummary } from '../Components/HTMLPDF/Summary/SomaticSNVSummary';
import { SomaticSVSummary } from '../Components/HTMLPDF/Summary/SomaticSVSummary';
import logo from '../../../images/Zero2Logo.png';
import { zccTheme } from '@/themes/zccTheme';
import type { IReportContext } from '@/types/Reports/Reports.types';
import { MolecularReportTemplate } from '../Components/HTMLPDF/Templates/MolecularReportTemplate';

// Styled components
const ReportContainer = styled('div')(({
  width: '100%',
  backgroundColor: 'white',
  position: 'relative',
  paddingBottom: '8%',
  overflowX: 'hidden',
  borderRadius: '8px',

  '& .MuiGrid-container': {
    flexWrap: 'nowrap',
  },

  '& .MuiTypography-overline': {
    letterSpacing: '1px',
  },
}));

const PaddedSection = styled('div')`
  width: 100%;
  padding: 10px 40px;
`;

const PaddedSectionSmall = styled('div')`
  padding: 0px 40px;
`;

const Separator = styled('div')`
  height: 1px;
  width: 100%;
  background-color: #D0D9E2;
`;

export function MolecularReport(): JSX.Element {
  const [logoDataUri, setLogoDataUri] = useState<string>('');
  const {
    pendingReport,
    demographics,
    reportType,
    isGeneratingReport,
    setIsGeneratingReport,
    generateRedactedReport,
    setGenerateRedactedReport,
    setGermlineFindings,
    uploadReport,
    getReportFileName,
    isAssignedClinician,
    isAssignedCurator,
  } = useReport();

  const {
    reportPatient,
    reportAnalysisSet,
    latestClinVersion,
    biomaterials,
    isPanel,
    somaticGenes,
    germlineGenes,
    purity,
    immunoprofile,
    classifiers,
    methGenes,
    rna,
    rnaClassifiers,
    snvs,
    cnvs,
    cytogenetics,
    cytobands,
    germlineCytogenetics,
    germlineCytobands,
    svs,
    germlineSnvs,
    germlineCnvs,
    germlineSvs,
    isLoading,
  } = useReportData();

  const canWriteSummary = useIsUserAuthorised('report.molecular.content.write', isAssignedCurator, isAssignedClinician);
  const canEditMetadata = useIsUserAuthorised('report.meta.write', isAssignedCurator, isAssignedClinician);

  const reportRef = useRef<HTMLDivElement>(null);
  const signaturesRef = useRef<ISignaturesRef | null>(null);

  // Any one of the biosample assays is RNA
  const isRnaPerformed = useMemo(() => (
    biomaterials?.some(
      (biomaterial) => biomaterial.assays?.some(
        (assay) => assay.sampleType === 'rnaseq',
      ),
    )
  ), [biomaterials]);

  // This is a haem report
  const isHaemReport = useMemo(() => (
    reportAnalysisSet.genePanel === 'Leukaemia and lymphoma'
  ), [reportAnalysisSet.genePanel]);

  // Use default 'no panel' report template
  const noPanel = useMemo(() => (
    !reportAnalysisSet.genePanel
    || noPanelGenePanels.some((p) => p === reportAnalysisSet.genePanel)
    || isPanel
  ), [isPanel, reportAnalysisSet.genePanel]);

  const methodsText = useMemo(() => {
    if (noPanel) {
      return mtbReportMethods;
    }
    return molecularReportMethods;
  }, [noPanel]);

  // effect that will generate the report
  useEffect(() => {
    async function generateReport(): Promise<void> {
      if (reportRef.current) {
        const fileBlob = await generateReportPDF({
          element: reportRef.current,
          keepTogether: '.keep-together',
          forcePageBreak: '.page-break',
          template: (context: IReportContext) => {
            const templateHTML = renderToStaticMarkup(
              <ThemeProvider theme={zccTheme}>
                <MolecularReportTemplate
                  context={context}
                  demographics={demographics}
                  genePanel={reportAnalysisSet?.genePanel}
                  redactedReport={generateRedactedReport}
                  isPanel={isPanel}
                  logoDataUri={logoDataUri}
                />
              </ThemeProvider>,
            );
            return templateHTML;
          },
        });
        if (fileBlob) {
          if (generateRedactedReport) {
            const fileName = await getReportFileName(generateRedactedReport, true);
            saveAs(fileBlob, fileName);
          } else {
            await uploadReport(fileBlob, 'pdf');
          }
        }
      }
      setGenerateRedactedReport(undefined);
      setIsGeneratingReport(null);
      if (signaturesRef.current) {
        signaturesRef.current.clearSignatures();
      }
    }

    async function getSignatures(): Promise<void> {
      if (signaturesRef.current) {
        await signaturesRef.current.getApprovedSignatures(generateReport);
      }
    }

    if (isGeneratingReport && signaturesRef.current && reportType === 'MOLECULAR_REPORT') {
      getSignatures();
    }
  }, [
    demographics,
    generateRedactedReport,
    getReportFileName,
    isGeneratingReport,
    isPanel,
    logoDataUri,
    reportAnalysisSet?.genePanel,
    reportType,
    setGenerateRedactedReport,
    setIsGeneratingReport,
    uploadReport,
  ]);

  useEffect(() => {
    setGermlineFindings(
      Boolean((
        germlineCnvs && germlineCnvs.length > 0
      ) || (
        germlineSnvs && germlineSnvs.length > 0
      ) || (
        germlineSvs && germlineSvs.length > 0
      )),
    );
  }, [germlineCnvs, germlineSnvs, germlineSvs, setGermlineFindings]);

  useEffect(() => {
    async function imageDataUri(url: string): Promise<string> {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            resolve(reader.result.toString());
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    imageDataUri(logo)
      .then((dataUri) => setLogoDataUri(dataUri));
  }, []);

  return (
    <Box height="100%">
      { !isLoading ? (
        <ReportContainer ref={reportRef}>
          <Grid container direction="column" style={{ height: '100%', paddingTop: '100px', paddingBottom: '40px' }}>
            {!isGeneratingReport && (
              <MolecularReportTemplate
                logoDataUri={logoDataUri}
                demographics={demographics}
                genePanel={reportAnalysisSet.genePanel}
                isPanel={isPanel}
              />
            )}
            <PaddedSection>
              <PatientProfile
                demographics={demographics}
                patient={reportPatient}
                analysisSet={reportAnalysisSet}
                isRedacted={Boolean(generateRedactedReport)}
              />
            </PaddedSection>
            <PaddedSection>
              <BiomaterialTable biomaterials={biomaterials || []} canManage={canEditMetadata} />
            </PaddedSection>
            <PaddedSection>
              <TumourMolecularProfileTable
                analysisSet={reportAnalysisSet}
                purity={purity}
                isPanel={isPanel}
              />
            </PaddedSection>
            {!isHaemReport && (
              <PaddedSection>
                <TumourImmuneProfileTable
                  immunoprofile={immunoprofile}
                  isRnaPerformed={isRnaPerformed}
                />
              </PaddedSection>
            )}
            <PaddedSection>
              <MolecularClassifiersTable
                methClassifiers={classifiers || []}
                methPromoters={methGenes || []}
                rnaClassifiers={rnaClassifiers || []}
              />
            </PaddedSection>
            <PaddedSection>
              <RNASeqTable
                rna={
                  isPanel ? [] : rna || []
                }
                showEzhip={reportAnalysisSet.genePanel === 'CNS' || reportAnalysisSet.genePanel === 'CNS no panel'}
                showReportables
                hideGenePanel={
                  noPanelGenePanels.some((p) => p === reportAnalysisSet.genePanel)
                }
                isPanel={isPanel}
                isRnaNotPerformed={!isRnaPerformed}
                canManage={canEditMetadata}
              />
            </PaddedSection>
            <PaddedSection>
              <SomaticSNVSummary snvs={snvs || []} canManage={canEditMetadata} />
            </PaddedSection>
            <PaddedSection>
              <CNVSummary
                entityType="CNV"
                cnvs={cnvs || []}
                armCNVs={cytogenetics || []}
                cytobands={cytobands || []}
                canManage={canEditMetadata}
              />
            </PaddedSection>
            <PaddedSection>
              <SomaticSVSummary svs={svs || []} canManage={canEditMetadata} />
            </PaddedSection>
            {demographics?.germlineConsent !== false && (
              <>
                <PaddedSection>
                  <GermlineSNVSummary
                    snvs={germlineSnvs || []}
                    commentOptions={
                      pendingReport?.id ? {
                        entityType: 'GERMLINE_SNV',
                        disabled: !canEditMetadata,
                      } : undefined
                    }
                    canManage={canEditMetadata}
                  />
                </PaddedSection>
                <PaddedSection>
                  <CNVSummary
                    entityType="GERMLINE_CNV"
                    cnvs={germlineCnvs || []}
                    armCNVs={germlineCytogenetics || []}
                    cytobands={germlineCytobands || []}
                    canManage={canEditMetadata}
                  />
                </PaddedSection>
                {germlineSvs && germlineSvs.length > 0 && (
                  <PaddedSection>
                    <GermlineSVSummary svs={germlineSvs || []} canManage={canEditMetadata} />
                  </PaddedSection>
                )}
              </>
            )}
            <PaddedSection>
              <CurationReportCommentInput
                title="High throughput drug screen"
                threadType="MOLECULAR"
                entityType="MOLECULAR_REPORT"
                entityId={pendingReport?.id}
                type="HTS_SUMMARY"
                disabled={
                  !canWriteSummary
                  || Boolean(isGeneratingReport)
                }
                tagOptions={molecularReportTags}
                initialText={reportAnalysisSet.cohort !== 'Cohort 1: High-risk cancers' ? 'Not performed.' : undefined}
              />
            </PaddedSection>
            <div className={clsx('keep-together')}>
              <PaddedSection>
                <CurationReportCommentInput
                  title="Molecular report summary"
                  threadType="MOLECULAR"
                  entityType="MOLECULAR_REPORT"
                  entityId={pendingReport?.id}
                  type="MOLECULAR_SUMMARY"
                  disabled={
                    !canWriteSummary
                    || Boolean(isGeneratingReport)
                  }
                  tagOptions={molecularReportTags}
                />
              </PaddedSection>
            </div>
            <div className={clsx('keep-together')}>
              <PaddedSectionSmall>
                <CurationReportCommentInput
                  title={
                    !isGeneratingReport
                      ? (
                        <CustomTypography
                          variant="bodyRegular"
                          fontWeight="bold"
                          tooltipText="This title will not show in the finalised report"
                          sx={{ color: corePalette.grey100 }}
                        >
                          Additional notes
                        </CustomTypography>
                      ) : ''
                  }
                  threadType="MOLECULAR"
                  entityType="MOLECULAR_REPORT"
                  entityId={pendingReport?.id}
                  type="ADDITIONAL_NOTES"
                  disabled={
                    !canWriteSummary
                    || Boolean(isGeneratingReport)
                  }
                  tagOptions={molecularReportTags}
                />
              </PaddedSectionSmall>
            </div>
            {!isGeneratingReport && (
              <PaddedSection>
                {latestClinVersion ? (
                  <ClinicalProvider versionId={latestClinVersion.id}>
                    <ReportRecommendations
                      recommendationTypes={['THERAPY', 'CHANGE_DIAGNOSIS', 'GERMLINE', 'TEXT', 'GROUP']}
                      canEditRec={canWriteSummary}
                    />
                  </ClinicalProvider>
                ) : (
                  <>
                    <CustomTypography
                      variant="bodyRegular"
                      fontWeight="bold"
                      sx={{ color: corePalette.grey100 }}
                    >
                      MTB recommendation(s)
                    </CustomTypography>
                    <Box display="flex" justifyContent="center" gap="16px" padding="16px">
                      <CustomButton
                        variant="outline"
                        label="Add recommendation"
                        endIcon={<ChevronDownIcon />}
                        disabled
                      />
                    </Box>
                  </>
                )}
              </PaddedSection>
            )}
            <PaddedSection>
              <References />
            </PaddedSection>
            <PaddedSection>
              <Signatures
                ref={signaturesRef}
                overrideApprovals={generateRedactedReport?.approvals}
              />
            </PaddedSection>
            { !isGeneratingReport ? (
              <PaddedSection>
                <Separator />
              </PaddedSection>
            ) : (
              <div className="page-break" />
            )}
            <PaddedSectionSmall>
              <Methods
                somaticGenes={somaticGenes || defaultEmptyList}
                germlineGenes={germlineGenes || defaultEmptyList}
                panel={isPanel || false}
                reference
                wgs
                rna
                meth
                somatic
                germline={demographics?.germlineConsent !== false}
                vaf
                rnaExpression
                ipass={!isHaemReport}
                methodsText={methodsText}
              />
            </PaddedSectionSmall>
            <div className={clsx('keep-together')} style={{ paddingBottom: '0px' }}>
              <PaddedSectionSmall>
                <Limitations
                  limitations={
                    noPanel
                      ? mtbReportLimitations
                      : molecularReportLimitations
                  }
                />
                <Disclaimer
                  disclaimer={
                    noPanel
                      ? mtbReportDisclaimer
                      : molecularReportDisclaimer
                    }
                />
              </PaddedSectionSmall>
            </div>
          </Grid>
        </ReportContainer>
      ) : (
        <div style={{
          position: 'absolute', top: 300, left: 0, right: 0, bottom: 0,
        }}
        >
          <LoadingAnimation />
        </div>
      )}
    </Box>
  );
}
