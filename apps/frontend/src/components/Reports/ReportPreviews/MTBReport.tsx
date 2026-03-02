import {
  Box, Grid, ThemeProvider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import {
  JSX,
  useEffect, useMemo, useRef,
  useState,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CustomTypography from '@/components/Common/Typography';
import { defaultEmptyList } from '@/constants/Curation/genes';
import { mtbReportDisclaimer, mtbReportLimitations, mtbReportMethods } from '@/constants/Reports/reports';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { zccTheme } from '@/themes/zccTheme';
import { IReportContext } from '@/types/Reports/Reports.types';
import { generateReportPDF } from '@/utils/functions/reportGenerationHelpers';
import { useClinical } from '../../../contexts/ClinicalContext';
import { useReport } from '../../../contexts/Reports/CurrentReportContext';
import { useReportData } from '../../../contexts/Reports/ReportDataContext';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import MTBInterpretations from '../Components/HTMLPDF/Comments/MTBInterpretations';
import ClinicalReportCommentInput from '../Components/HTMLPDF/Comments/TextBox/ClinicalReportCommentInput';
import { Disclaimer, Limitations, Methods } from '../Components/HTMLPDF/Hardcoded';
import { TierOfRecReference } from '../Components/HTMLPDF/Hardcoded/TierOfRecReference';
import { BiomaterialTable, TumourMolecularProfileTable, PatientProfile } from '../Components/HTMLPDF/Profile';
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
import { TherapyAvailablity } from '../Components/HTMLPDF/Summary/TherapyAvailability';
import { MTBReportTemplate } from '../Components/HTMLPDF/Templates/MTBReportTemplate';
import logo from '../../../images/Zero2Logo.png';

const useStyles = makeStyles(() => ({
  scrollable: {
    maxHeight: '100%',
    width: '800px',
    height: '100%',
  },
  report: {
    width: '100%',
    backgroundColor: 'white',
    position: 'relative',
    paddingBottom: '8%',
    overflowX: 'hidden',
    borderRadius: '8px',

    '& .MuiGrid-container': {
      flexWrap: 'nowrap',
    },

  },
  logo: {
    width: '100%',
    marginBottom: '20px',
  },
  title: {
    marginBottom: '2em',
  },
  paddedSection: {
    width: '100%',
    padding: '10px 40px',
  },
  separator: {
    height: '1px',
    width: '100%',
    backgroundColor: '#D0D9E2',
  },
}));

export function MTBReport(): JSX.Element {
  const classes = useStyles();
  const [logoDataUri, setLogoDataUri] = useState<string>('');
  const {
    clinicalVersion,
  } = useClinical();
  const {
    demographics,
    reportType,
    isGeneratingReport,
    setIsGeneratingReport,
    setGermlineFindings,
    uploadReport,
    pendingReport,
    isAssignedCurator,
    isAssignedClinician,
  } = useReport();
  const {
    somaticGenes,
    germlineGenes,
    reportPatient,
    reportAnalysisSet,
    biomaterials,
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
    recommendations,
  } = useReportData();

  const reportRef = useRef<HTMLDivElement>(null);
  const signaturesRef = useRef<ISignaturesRef | null>(null);

  const canEditComments = useIsUserAuthorised('report.mtb.write', isAssignedCurator, isAssignedClinician);
  const canEditRecs = useIsUserAuthorised('report.mtb.content.write', isAssignedCurator, isAssignedClinician);
  const canEditMetadata = useIsUserAuthorised('report.meta.write', isAssignedCurator, isAssignedClinician);

  const isPanel = useMemo(() => biomaterials?.some(
    (biomaterial) => biomaterial.assays?.some(
      (assay) => assay.sampleType === 'panel',
    ),
  ), [biomaterials]);

  // Any one of the biosample assays is RNA
  const isRnaPerformed = useMemo(() => (
    biomaterials?.some(
      (biomaterial) => biomaterial.assays?.some(
        (assay) => assay.sampleType === 'rnaseq',
      ),
    )
  ), [biomaterials]);

  // Effect that will generate the report as a PDF
  useEffect(() => {
    async function generateReport(): Promise<void> {
      if (reportRef.current) {
        const fileBlob = await generateReportPDF({
          element: reportRef.current,
          keepTogether: '.keep-together',
          forcePageBreak: '.page-break',
          template: (context: IReportContext) => renderToStaticMarkup(
            <ThemeProvider theme={zccTheme}>
              <MTBReportTemplate
                logoDataUri={logoDataUri}
                context={context}
                demographics={demographics}
              />
            </ThemeProvider>,
          ),
        });
        if (fileBlob) {
          await uploadReport(fileBlob, 'pdf');
        }
      }
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

    if (isGeneratingReport === 'pdf' && signaturesRef.current && reportType === 'MTB_REPORT') {
      getSignatures();
    }
  }, [
    demographics,
    isGeneratingReport,
    logoDataUri,
    reportType,
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
      { !isLoading && clinicalVersion.id ? (
        <div className={classes.report} ref={reportRef}>
          <Grid
            container
            direction="column"
            flexWrap="nowrap"
            sx={{ height: '100%', paddingTop: '100px', paddingBottom: '40px' }}
          >
            {!isGeneratingReport && (
              <MTBReportTemplate
                logoDataUri={logoDataUri}
                demographics={demographics}
              />
            )}
            <div className={classes.paddedSection}>
              <PatientProfile
                demographics={demographics}
                patient={reportPatient}
                analysisSet={reportAnalysisSet}
                isMTB
                mtbDate={clinicalVersion.meetings.find((r) => r.type === 'MTB')?.date ?? undefined}
              />
              {pendingReport?.id && (
                <ClinicalReportCommentInput
                  title={(
                    <CustomTypography variant="label" style={{ fontSize: '10px' }}>
                      Clinical Information
                    </CustomTypography>
                  )}
                  threadType="REPORTS"
                  entityType="MTB_REPORT"
                  entityId={pendingReport?.id}
                  type="CLINICAL_INFORMATION"
                  removeArchive
                  disabled={!canEditComments}
                />
              )}
            </div>
            <div className={classes.paddedSection}>
              <BiomaterialTable biomaterials={biomaterials || []} canManage={canEditMetadata} />
            </div>
            <div
              className={classes.paddedSection}
            >
              <TumourMolecularProfileTable
                analysisSet={reportAnalysisSet}
                purity={purity}
                isPanel={isPanel}
              />
            </div>
            <div className={classes.paddedSection}>
              <TumourImmuneProfileTable
                immunoprofile={immunoprofile}
                isRnaPerformed={isRnaPerformed}
              />
            </div>
            <div className={classes.paddedSection}>
              <MolecularClassifiersTable
                methClassifiers={classifiers || []}
                methPromoters={methGenes || []}
                rnaClassifiers={rnaClassifiers || []}
              />
            </div>
            <div className={classes.paddedSection}>
              <RNASeqTable
                rna={isPanel ? [] : rna || []}
                showReportables
                showEzhip={reportAnalysisSet.genePanel === 'CNS'}
                isPanel={isPanel}
                showInterpretation={false}
                canManage={canEditMetadata}
              />
            </div>
            <div className={classes.paddedSection}>
              <SomaticSNVSummary
                snvs={snvs || []}
                showInterpretation={false}
                canManage={canEditMetadata}
              />
            </div>
            <div className={classes.paddedSection}>
              <CNVSummary
                entityType="CNV"
                cnvs={cnvs || []}
                armCNVs={cytogenetics || []}
                cytobands={cytobands || []}
                showInterpretation={false}
                canManage={canEditMetadata}
              />
            </div>
            <div className={classes.paddedSection}>
              <SomaticSVSummary
                svs={svs || []}
                showInterpretation={false}
                canManage={canEditMetadata}
              />
            </div>
            {demographics?.germlineConsent !== false && (
              <>
                <div className={classes.paddedSection}>
                  <GermlineSNVSummary
                    snvs={germlineSnvs || []}
                    showInterpretation={false}
                    commentOptions={
                      pendingReport?.id ? {
                        entityType: 'GERMLINE_SNV',
                        disabled: !canEditMetadata,
                      } : undefined
                    }
                    canManage={canEditMetadata}
                  />
                </div>
                <div className={classes.paddedSection}>
                  <CNVSummary
                    entityType="GERMLINE_CNV"
                    cnvs={germlineCnvs || []}
                    armCNVs={germlineCytogenetics || []}
                    cytobands={germlineCytobands || []}
                    showInterpretation={false}
                    canManage={canEditMetadata}
                  />
                </div>
                {germlineSvs && germlineSvs.length > 0 && (
                  <div className={classes.paddedSection}>
                    <GermlineSVSummary
                      svs={germlineSvs || []}
                      showInterpretation={false}
                      canManage={canEditMetadata}
                    />
                  </div>
                )}
              </>
            )}
            <div className={classes.paddedSection}>
              <ClinicalReportCommentInput
                title="High throughput drug screen"
                threadType="REPORTS"
                entityType="MTB_REPORT"
                entityId={pendingReport?.id}
                type="HTS_SUMMARY"
                removeArchive
                disabled={!canEditComments || !pendingReport?.id}
              />
            </div>
            <div className={classes.paddedSection}>
              <MTBInterpretations />
            </div>
            <div className={classes.paddedSection}>
              <ReportRecommendations
                recommendationTypes={[
                  'THERAPY',
                  'TEXT',
                  'CHANGE_DIAGNOSIS',
                  'GERMLINE',
                  'GROUP',
                ]}
                canEditRec={canEditRecs}
              />
            </div>
            {recommendations.length > 0 && (
              <>
                <div className={clsx(classes.paddedSection, 'keep-together')}>
                  <TierOfRecReference />
                </div>
                <div className={clsx(classes.paddedSection, 'keep-together')}>
                  <TherapyAvailablity
                    canEdit={canEditRecs}
                  />
                </div>
              </>
            )}
            <div className={classes.paddedSection}>
              <References />
            </div>
            <div className={classes.paddedSection}>
              <Signatures highlightDate={!isGeneratingReport} ref={signaturesRef} />
            </div>
            { !isGeneratingReport ? (
              <div className={classes.paddedSection}>
                <div className={classes.separator} />
              </div>
            ) : (
              <div className="page-break" />
            )}
            <div className={classes.paddedSection}>
              <Methods
                somaticGenes={somaticGenes || defaultEmptyList}
                germlineGenes={germlineGenes || defaultEmptyList}
                reference
                wgs
                rna
                panel
                meth
                somatic
                germline={demographics?.germlineConsent !== false}
                vaf
                rnaExpression
                ipass
                methodsText={mtbReportMethods}
              />
            </div>
            <div className={clsx(classes.paddedSection, 'keep-together')}>
              <Limitations limitations={mtbReportLimitations} />
            </div>
            <div className={clsx(classes.paddedSection, 'keep-together')}>
              <Disclaimer disclaimer={mtbReportDisclaimer} />
            </div>
          </Grid>
        </div>
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
