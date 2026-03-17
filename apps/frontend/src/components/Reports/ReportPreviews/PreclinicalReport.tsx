import {
  Box, Grid, styled, ThemeProvider,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  JSX, useEffect, useMemo, useRef,
  useState,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import CustomTypography from '@/components/Common/Typography';
import {
  failedHtsCommentInitialVal,
  pdxCommentInitialVal,
  successfulHtsCommentInitialVal,
} from '@/constants/Reports/preclinicalReport';
import { htsReportMethods, preclinicalReportDisclaimer } from '@/constants/Reports/reports';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { zccTheme } from '@/themes/zccTheme';
import { IReportContext } from '@/types/Reports/Reports.types';
import { generateReportPDF } from '@/utils/functions/reportGenerationHelpers';
import MTBInterpretations from '../Components/HTMLPDF/Comments/MTBInterpretations';
import ClinicalReportCommentInput from '../Components/HTMLPDF/Comments/TextBox/ClinicalReportCommentInput';
import { Disclaimer } from '../Components/HTMLPDF/Hardcoded';
import { Methods } from '../Components/HTMLPDF/Hardcoded/Methods';
import { TierOfRecReference } from '../Components/HTMLPDF/Hardcoded/TierOfRecReference';
import { BiomaterialTable, PatientProfile } from '../Components/HTMLPDF/Profile';
import { References } from '../Components/HTMLPDF/References/References';
import { ISignaturesRef, Signatures } from '../Components/HTMLPDF/Signatures/Signatures';
import { HTSCombinationSummary } from '../Components/HTMLPDF/Summary/HTSCombinationSummary';
import { HTSSummary } from '../Components/HTMLPDF/Summary/HTSSummary';
import ReportRecommendations from '../Components/HTMLPDF/Summary/ReportRecommendations';
import { TherapyAvailablity } from '../Components/HTMLPDF/Summary/TherapyAvailability';
import { PreclinicalReportTemplate } from '../Components/HTMLPDF/Templates/PreclinicalReportTemplate';
import logo from '../../../images/Zero2Logo.png';

const Report = styled('div')(() => ({
  width: '100%',
  backgroundColor: 'white',
  position: 'relative',
  paddingBottom: '8%',
  overflowX: 'hidden',
  borderRadius: '8px',

  '& .MuiGrid-container': {
    flexWrap: 'nowrap',
  },
}));

const PaddedSection = styled('div')(() => ({
  width: '100%',
  padding: '10px 40px',
  lineHeight: '1rem',
}));

const PaddedSectionSmall = styled(PaddedSection)(() => ({
  padding: '0px 40px',
}));

const Separator = styled('div')(({ theme }) => ({
  height: '1px',
  width: '100%',
  backgroundColor: theme.colours.core.grey50,
}));

export function PreclinicalReport(): JSX.Element {
  const [logoDataUri, setLogoDataUri] = useState<string>('');
  const {
    isAssignedCurator,
    demographics,
    isGeneratingReport,
    pendingReport,
    uploadReport,
    setIsGeneratingReport,
    reportType,
    isAssignedClinician,
  } = useReport();
  const {
    isLoading,
    reportPatient,
    reportAnalysisSet,
    latestClinVersion,
    biomaterials,
    culture,
    htsResults,
    htsCombinations,
    recommendations,
  } = useReportData();

  const reportRef = useRef<HTMLDivElement>(null);
  const signaturesRef = useRef<ISignaturesRef | null>(null);

  const canEditContent = useIsUserAuthorised('report.preclinical.write', isAssignedCurator, isAssignedClinician);
  const canEditRecs = useIsUserAuthorised('report.preclinical.content.write', isAssignedCurator, isAssignedClinician);

  const preclinicalFailed = useMemo(() => (
    ((!htsCombinations || htsCombinations.length === 0)
    && (!htsResults || htsResults.length === 0))
    || culture?.screenStatus === 'FAIL'
  ), [htsCombinations, htsResults, culture?.screenStatus]);

  const formattedHTSComment = useMemo(() => {
    if (preclinicalFailed || !culture) {
      return failedHtsCommentInitialVal;
    }

    const getScreenPlatform = (platform: string): string => {
      switch (platform.toLowerCase()) {
        case 'adherent':
          return 'adherent culture derived';
        case 'co-culture':
          return 'co-culture derived';
        case 'neurospheres':
          return 'neurosphere culture derived';
        case 'spheroid':
          return 'spheroid culture derived';
        default:
          return 'cells derived';
      }
    };

    const getPassage = (passage: string): string => {
      const lowerPassage = passage.toLowerCase();
      return lowerPassage[0] === 'p'
        ? 'dissociated primary patient sample'
        : 'patient-derived xenograft';
    };

    const getValidationMethod = (validation: string): string => {
      const validations = validation.split(';');
      return validations.map((v) => {
        if (v.toLowerCase().includes('snp')) {
          return 'SNP microarray';
        }
        if (v.toLowerCase().includes('histopathology')) {
          return 'IHC';
        }
        return v;
      })
        .join(' and ');
    };

    return successfulHtsCommentInitialVal
      .replace('{{drugAddedDate}}', culture.htsScreenDate ? dayjs(culture.htsScreenDate).format('DD/MM/YYYY') : 'Unknown date')
      .replace('{{screeningPlatform}}', culture.htsScreenPlatform ? getScreenPlatform(culture.htsScreenPlatform) : 'Unknown platform')
      .replace('{{passage}}', culture.htsPassage ? getPassage(culture.htsPassage) : 'Unknown passage')
      .replace('{{cultureValidation}}', culture.htsCultureValidMethod ? culture.htsCultureValidMethod : 'STR Profiling')
      .replace('{{tumourValidation}}', culture.htsValidMethod ? getValidationMethod(culture.htsValidMethod) : '')
      .replace('{{compundSize}}', culture.htsNumDrugs >= 150 ? 'full' : 'partial')
      .replace('{{version}}', culture.screenName === 'standard_126' ? 'v1.0' : culture.screenName.split('_').pop() || 'Unknown version');
  }, [culture, preclinicalFailed]);

  // Effect that will generate the report
  useEffect(() => {
    async function generateReport(): Promise<void> {
      if (reportRef.current) {
        const fileBlob = await generateReportPDF({
          element: reportRef.current,
          keepTogether: '.keep-together',
          forcePageBreak: '.page-break',
          template: (context: IReportContext) => renderToStaticMarkup(
            <ThemeProvider theme={zccTheme}>
              <PreclinicalReportTemplate
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

    if (isGeneratingReport && signaturesRef.current && reportType === 'PRECLINICAL_REPORT') {
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
        <Report ref={reportRef}>
          <Grid
            container
            direction="column"
            flexWrap="nowrap"
            sx={{ height: '100%', paddingTop: '100px', paddingBottom: '40px' }}
          >
            {!isGeneratingReport && (
              <PreclinicalReportTemplate
                logoDataUri={logoDataUri}
                demographics={demographics}
              />
            )}
            <PaddedSection>
              <PatientProfile
                demographics={demographics}
                patient={reportPatient}
                analysisSet={reportAnalysisSet}
                isMTB
                mtbDate={latestClinVersion?.meetings.find((r) => r.type === 'HTS')?.date ?? undefined}
              />
              <ClinicalReportCommentInput
                title={(
                  <CustomTypography variant="label" style={{ fontSize: '10px' }}>
                    Clinical Information
                  </CustomTypography>
                )}
                threadType="REPORTS"
                entityType="PRECLINICAL_REPORT"
                entityId={pendingReport?.id || ''}
                type="CLINICAL_INFORMATION"
                removeArchive
                disabled={!canEditContent || !pendingReport?.id}
              />
            </PaddedSection>
            <PaddedSection>
              <BiomaterialTable
                biomaterials={biomaterials || []}
                showPreclinical
              />
            </PaddedSection>
            <PaddedSection>
              <ClinicalReportCommentInput
                title="Patient-derived xenograft (PDX) establishment"
                threadType="REPORTS"
                entityType="PRECLINICAL_REPORT"
                entityId={pendingReport?.id || ''}
                type="PDX_SUMMARY"
                initialText={pdxCommentInitialVal}
                removeArchive
                disabled={!canEditContent || !pendingReport?.id}
              />
            </PaddedSection>
            <PaddedSection>
              <ClinicalReportCommentInput
                key={`In-vitro drug testing-${preclinicalFailed}-${formattedHTSComment}`}
                title="In-vitro drug testing"
                threadType="REPORTS"
                entityType="PRECLINICAL_REPORT"
                entityId={pendingReport?.id ?? ''}
                type="HTS_SUMMARY"
                initialText={formattedHTSComment}
                removeArchive
                disabled={!canEditContent || !preclinicalFailed || !pendingReport?.id}
                fetchSavedComment={Boolean(preclinicalFailed)}
              />
            </PaddedSection>
            {!preclinicalFailed && htsResults?.length && culture && (
              <PaddedSection>
                <HTSSummary
                  culture={culture}
                  drugs={htsResults || []}
                  canManage={canEditContent}
                />
              </PaddedSection>
            )}
            {!preclinicalFailed && Boolean(htsCombinations?.length) && (
              <PaddedSection>
                <HTSCombinationSummary
                  combinations={htsCombinations || []}
                  canManage={canEditContent}
                />
              </PaddedSection>
            )}
            <PaddedSection>
              <MTBInterpretations />
            </PaddedSection>
            <PaddedSection>
              {!preclinicalFailed && (
                <ReportRecommendations
                  recommendationTypes={['THERAPY', 'GROUP']}
                  canEditRec={canEditRecs}
                />
              )}
            </PaddedSection>
            {!preclinicalFailed && recommendations.length > 0 && (
              <>
                <PaddedSection>
                  <TierOfRecReference />
                </PaddedSection>
                <PaddedSection>
                  <TherapyAvailablity
                    canEdit={canEditRecs}
                  />
                </PaddedSection>
              </>
            )}
            <PaddedSection>
              <References />
            </PaddedSection>
            <PaddedSection>
              <Signatures ref={signaturesRef} />
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
                htsSingle
                htsCombo
                aSNP
                str
                ihc
                methodsText={htsReportMethods}
              />
            </PaddedSectionSmall>
            <PaddedSectionSmall sx={{ paddingBottom: 0 }}>
              <Disclaimer
                disclaimer={preclinicalReportDisclaimer}
              />
            </PaddedSectionSmall>
          </Grid>
        </Report>
      ) : (
        <div
          style={{
            position: 'absolute', top: 300, left: 0, right: 0, bottom: 0,
          }}
        >
          <LoadingAnimation />
        </div>
      )}
    </Box>
  );
}
