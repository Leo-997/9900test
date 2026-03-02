import {
  Box,
  Grid, ThemeProvider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import {
  JSX,
  useEffect, useMemo, useRef,
  useState,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { germlineReportDisclaimer, mtbReportLimitations } from '@/constants/Reports/reports';
import {
  clinicalNotesDefaultText,
  germlineNFClinicalInterp,
  germlineNFClinicalInterpCat1Declined,
  germlineNFClinicalInterpCat2Declined,
  germlineReportCommentTags,
  recommendationsBulletedList,
} from '@/constants/Reports/comments';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { zccTheme } from '@/themes/zccTheme';
import { GermlineReportAttachmentOptions, IReportContext } from '@/types/Reports/Reports.types';
import { generateReportPDF } from '@/utils/functions/reportGenerationHelpers';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomTypography from '../../Common/Typography';
import GermlineClinicalInterpretations from '../Components/HTMLPDF/Comments/GermlineClinicalInterpretations';
import CurationReportCommentInput from '../Components/HTMLPDF/Comments/TextBox/CurationReportCommentInput';
import { Disclaimer, Limitations } from '../Components/HTMLPDF/Hardcoded';
import Annex1 from '../Components/HTMLPDF/Hardcoded/Annex1';
import { GermlineMethods } from '../Components/HTMLPDF/Hardcoded/GermlineMethods';
import GermlineNFLeaflet from '../Components/HTMLPDF/Hardcoded/GermlineNFLeaflet';
import ListOfPaediatricCancerClinics from '../Components/HTMLPDF/Hardcoded/ListOfPaediatricCancerClinics';
import { BiomaterialTable, PatientProfile, TumourMolecularProfileTable } from '../Components/HTMLPDF/Profile';
import { References } from '../Components/HTMLPDF/References/References';
import { ISignaturesRef, Signatures } from '../Components/HTMLPDF/Signatures/Signatures';
import { CNVSummary } from '../Components/HTMLPDF/Summary/CNVSummary';
import { GermlineSNVSummary } from '../Components/HTMLPDF/Summary/GermlineSNVSummary';
import { GermlineSVSummary } from '../Components/HTMLPDF/Summary/GermlineSVSummary';
import { SomaticSNVSummary } from '../Components/HTMLPDF/Summary/SomaticSNVSummary';
import { SomaticSVSummary } from '../Components/HTMLPDF/Summary/SomaticSVSummary';
import { GermlineAnnex1Template } from '../Components/HTMLPDF/Templates/GermlineAnnex1Template';
import { GermlineNFLeafletTemplate } from '../Components/HTMLPDF/Templates/GermlineNFLeafletTemplate';
import { GermlineReportTemplate } from '../Components/HTMLPDF/Templates/GermlineReportTemplate';
import logo from '../../../images/Zero2Logo.png';
import { strToBool } from '@/utils/functions/bools';

const useStyles = makeStyles(() => ({
  report: {
    width: '100%',
    backgroundColor: 'white',
    position: 'relative',
    overflowX: 'hidden',
    borderRadius: '8px',

    '& .MuiGrid-container': {
      flexWrap: 'nowrap',
    },
  },
  paddedSection: {
    width: '100%',
    padding: '10px 40px',
  },
  compactSection: {
    width: '100%',
    padding: '0px 40px',
  },
  separator: {
    height: '1px',
    width: '100%',
    backgroundColor: '#D0D9E2',
  },
}));

export default function GermlineReport(): JSX.Element {
  const [logoDataUri, setLogoDataUri] = useState<string>('');
  const {
    demographics,
    reportType,
    isAssignedClinician,
    isGeneratingReport,
    setIsGeneratingReport,
    uploadReport,
    germlineFindings,
    setGermlineFindings,
    pendingReport,
    isAssignedCurator,
    reportMetadata,
  } = useReport();
  const {
    reportPatient,
    reportAnalysisSet,
    biomaterials,
    purity,
    germlineSnvs,
    germlineCnvs,
    germlineSvs,
    snvs,
    cnvs,
    svs,
    cytobands,
    cytogenetics,
    germlineCytobands,
    germlineCytogenetics,
    isLoading,
    latestClinVersion,
  } = useReportData();

  const classes = useStyles({ isGeneratingReport });

  const reportRef = useRef<HTMLDivElement>(null);
  const signaturesRef = useRef<ISignaturesRef | null>(null);

  const hasEditPermission = useIsUserAuthorised('report.germline.content.write', isAssignedCurator, isAssignedClinician);
  const hasEditMetadataPermission = useIsUserAuthorised('report.meta.write', isAssignedCurator, isAssignedClinician);

  const forceApproval = !germlineFindings && (strToBool(reportMetadata?.['germline.forceApproval']) ?? false);
  const canEdit = hasEditPermission && forceApproval;
  const canEditMetadata = hasEditMetadataPermission && forceApproval;

  // Any one of the biosample assays is a panel assay
  const isPanel = useMemo(() => biomaterials?.some(
    (biomaterial) => biomaterial.assays?.some(
      (assay) => assay.sampleType === 'panel',
    ),
  ), [biomaterials]);

  const clinInterpInitialText = useMemo(() => {
    if (demographics?.category1Consent === false) {
      return germlineNFClinicalInterpCat1Declined;
    }

    if (demographics?.category2Consent === false) {
      return germlineNFClinicalInterpCat2Declined;
    }

    return germlineNFClinicalInterp;
  }, [demographics?.category1Consent, demographics?.category2Consent]);

  const germlineAttachments = useMemo((): GermlineReportAttachmentOptions[] => (
    reportMetadata?.['germline.attachments']
      ? JSON.parse(reportMetadata['germline.attachments'])
      : []
  ), [reportMetadata]);

  useEffect(() => {
    setGermlineFindings(
      Boolean((
        germlineCnvs && germlineCnvs.length > 0
      ) || (
        germlineSnvs && germlineSnvs.length > 0
      ) || (
        germlineSvs && germlineSvs.length > 0
      ) || (
        germlineCytogenetics && germlineCytogenetics.length > 0
      ) || (
        germlineCytobands && germlineCytobands.length > 0
      )),
    );
  }, [
    germlineCnvs,
    germlineCytobands,
    germlineCytogenetics,
    germlineSnvs,
    germlineSvs,
    setGermlineFindings,
  ]);

  // Effect that will generate the report
  useEffect(() => {
    const getTemplate = (
      context: IReportContext,
      attachments: GermlineReportAttachmentOptions[],
    ): JSX.Element => {
      const contextPages = context.totalPages;
      const noFindingsPages = attachments?.includes('No findings factsheet') ? 2 : 0;
      const geneticsContactListPages = attachments?.includes('Genetics contact list') ? 1 : 0;
      const totalReportPages = contextPages - noFindingsPages - geneticsContactListPages;

      if (
        attachments?.includes('No findings factsheet')
        && (
          context.pageNum === contextPages
          || context.pageNum === contextPages - 1
        )
      ) {
        return (
          <GermlineNFLeafletTemplate
            logoDataUri={logoDataUri}
            context={context}
          />
        );
      }

      if (
        attachments?.includes('Genetics contact list')
        && context.pageNum === totalReportPages + 1
      ) {
        return (
          <GermlineAnnex1Template
            logoDataUri={logoDataUri}
            context={context}
          />
        );
      }

      return (
        <GermlineReportTemplate
          logoDataUri={logoDataUri}
          context={{
            ...context,
            totalPages: totalReportPages,
          }}
          demographics={demographics}
        />
      );
    };

    async function generateReport(): Promise<void> {
      if (reportRef.current) {
        const fileBlob = await generateReportPDF({
          element: reportRef.current,
          keepTogether: '.keep-together',
          forcePageBreak: '.page-break',
          template: (context: IReportContext) => renderToStaticMarkup(
            <ThemeProvider theme={zccTheme}>
              {getTemplate(context, germlineAttachments)}
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

    if (isGeneratingReport && signaturesRef.current && reportType === 'GERMLINE_REPORT') {
      getSignatures();
    }
  }, [
    demographics,
    germlineAttachments,
    isGeneratingReport,
    reportType,
    setIsGeneratingReport,
    uploadReport,
    logoDataUri,
  ]);

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
        <div className={classes.report} ref={reportRef}>
          <Grid
            container
            direction="column"
            paddingTop="100px"
            paddingBottom="100px"
            position="relative"
          >
            {!isGeneratingReport && (
              <GermlineReportTemplate
                logoDataUri={logoDataUri}
                demographics={demographics}
              />
            )}
            <div className={classes.paddedSection}>
              <PatientProfile
                patient={reportPatient}
                analysisSet={reportAnalysisSet}
                demographics={demographics}
                isMTB
                mtbDate={latestClinVersion?.meetings.find((r) => r.type === 'MTB')?.date ?? undefined}
              />
              {demographics !== undefined && (
                <CurationReportCommentInput
                  title={(
                    <CustomTypography variant="label" style={{ fontSize: '10px' }}>
                      Clinical Information
                    </CustomTypography>
                  )}
                  threadType="GERMLINE"
                  entityType="GERMLINE_REPORT"
                  type="CLINICAL_NOTES"
                  entityId={pendingReport?.id}
                  initialText={
                    germlineFindings && (
                      demographics?.germlineConsent
                      || demographics?.category1Consent
                    ) ? clinicalNotesDefaultText : demographics?.histologicalDiagnosis || ''
                  }
                  removeArchive
                  disabled={!canEdit}
                  tagOptions={germlineReportCommentTags}
                />
              )}
            </div>
            <div className={classes.paddedSection}>
              <BiomaterialTable
                biomaterials={
                  biomaterials?.filter((b) => b.biosampleStatus === 'normal') || []
                }
                canManage={canEditMetadata}
              />
            </div>
            <div className={classes.paddedSection}>
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
            </div>
            <div className={classes.paddedSection}>
              <CNVSummary
                entityType="GERMLINE_CNV"
                cnvs={germlineCnvs || []}
                armCNVs={germlineCytogenetics || []}
                cytobands={germlineCytobands || []}
                canManage={canEditMetadata}
              />
            </div>
            {germlineSvs && germlineSvs.length > 0 && (
              <div className={classes.paddedSection}>
                <GermlineSVSummary svs={germlineSvs} canManage={canEditMetadata} />
              </div>
            )}
            {reportAnalysisSet?.cohort !== 'Cohort 13: Germline only' && (
              <div className={classes.paddedSection}>
                <TumourMolecularProfileTable
                  analysisSet={reportAnalysisSet}
                  purity={purity}
                  isPanel={isPanel}
                />
              </div>
            )}
            {germlineFindings && (
              <>
                {snvs && snvs.length > 0 && (
                  <div className={classes.paddedSection}>
                    <SomaticSNVSummary
                      snvs={snvs || []}
                      showInterpretation={false}
                      canManage={canEditMetadata}
                    />
                  </div>
                )}
                {(
                  (cnvs && cnvs?.length > 0)
                  || (cytogenetics && cytogenetics.length > 0)
                  || (cytobands && cytobands.length > 0)
                )
                && (
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
                )}
                {svs && svs?.length > 0 && (
                  <div className={classes.paddedSection}>
                    <SomaticSVSummary
                      svs={svs || []}
                      showInterpretation={false}
                      canManage={canEditMetadata}
                    />
                  </div>
                )}
              </>
            )}
            <div className={classes.paddedSection}>
              {germlineFindings ? (
                <GermlineClinicalInterpretations />
              ) : (
                <CurationReportCommentInput
                  key={clinInterpInitialText}
                  title="Clinical interpretation"
                  threadType="GERMLINE"
                  entityType="GERMLINE_REPORT"
                  entityId={pendingReport?.id}
                  type="CLINICAL_INTERPRETATIONS"
                  initialText={clinInterpInitialText}
                  disabled={!canEdit}
                  removeArchive
                />
              )}
            </div>
            {germlineFindings && pendingReport?.id && (
              <div className={classes.paddedSection}>
                <CurationReportCommentInput
                  title="Recommendation(s)"
                  threadType="GERMLINE"
                  entityType="GERMLINE_REPORT"
                  entityId={pendingReport.id}
                  type="RECOMMENDATIONS"
                  initialText={recommendationsBulletedList}
                  disabled={!canEdit}
                  tagOptions={germlineReportCommentTags}
                />
              </div>
            )}
            {germlineFindings && (
              <div className={classes.paddedSection}>
                <ListOfPaediatricCancerClinics />
              </div>
            )}
            {germlineFindings && (
              <div className={classes.paddedSection}>
                <References />
              </div>
            )}
            <div className={classes.paddedSection}>
              <Signatures ref={signaturesRef} />
            </div>
            { !isGeneratingReport ? (
              <div className={classes.paddedSection}>
                <div className={classes.separator} />
              </div>
            ) : (
              <div className="page-break" />
            )}
            <div className={classes.paddedSection}>
              <GermlineMethods />
            </div>
            <div className={clsx(classes.compactSection, 'keep-together')}>
              <Limitations limitations={mtbReportLimitations} />
            </div>
            <div className={clsx(classes.compactSection, 'keep-together')}>
              <Disclaimer disclaimer={germlineReportDisclaimer} />
            </div>
          </Grid>
          {germlineAttachments.includes('Genetics contact list') && (
            <>
              {!isGeneratingReport ? (
                <div className={classes.paddedSection}>
                  <div className={classes.separator} />
                </div>
              ) : (
                <div className="page-break" />
              )}
              <Grid
                container
                direction="column"
                paddingTop="100px"
                paddingBottom="100px"
                position="relative"
              >
                {!isGeneratingReport && (
                  <GermlineAnnex1Template
                    logoDataUri={logoDataUri}
                  />
                )}
                <div className={classes.paddedSection}>
                  <Annex1 />
                </div>
              </Grid>
            </>
          )}
          {germlineAttachments.includes('No findings factsheet') && (
            <>
              {!isGeneratingReport ? (
                <div className={classes.paddedSection}>
                  <div className={classes.separator} />
                </div>
              ) : (
                <div className="page-break" />
              )}
              <Grid
                container
                direction="column"
                paddingTop="100px"
                paddingBottom="100px"
                position="relative"
              >
                {!isGeneratingReport && (
                  <GermlineNFLeafletTemplate
                    logoDataUri={logoDataUri}
                  />
                )}
                <div className={classes.paddedSection}>
                  <GermlineNFLeaflet />
                </div>
              </Grid>
            </>
          )}
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
