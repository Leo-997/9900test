import { Box, lighten, styled } from '@mui/material';
import dayjs from 'dayjs';
import { useMemo, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { IPatientDemographics } from '../../../../../types/Patient/Patient.types';
import { IReport, IReportContext } from '../../../../../types/Reports/Reports.types';
import { GenePanel } from '../../../../../types/Samples/Sample.types';
import CustomTypography from '../../../../Common/Typography';
import ReportStamp from '../../../../CustomIcons/ReportStamp';

const Template = styled('div')(({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',

  '& .MuiTypography-overline': {
    letterSpacing: '1px',
  },
}));

const Divider = styled('div')({
  backgroundColor: '#AEB9C5',
  width: '1px',
  height: '40px',
  margin: '0px 16px 8px 16px',
});

const Header = styled(Box)({
  zIndex: 10,
  position: 'absolute',
  top: '48px',
  left: '40px',
  right: '40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  height: '53px',
  pointerEvents: 'all',
});

const Footer = styled(Box)({
  zIndex: 10,
  position: 'absolute',
  bottom: '24px',
  right: '40px',
  left: '40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  height: '53px',
  pointerEvents: 'all',
});

const FooterLeft = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
  position: 'absolute',
  left: '0px',
});

const FooterRight = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  position: 'absolute',
  right: '0px',
});

interface IMolecularReportTemplateProps {
  logoDataUri: string;
  context?: IReportContext;
  demographics?: IPatientDemographics | null;
  genePanel?: GenePanel;
  redactedReport?: IReport;
  isPanel?: boolean;
}

export function MolecularReportTemplate({
  logoDataUri,
  context,
  demographics,
  genePanel,
  redactedReport,
  isPanel,
}: IMolecularReportTemplateProps): JSX.Element {
  const reportName = useMemo(() => {
    const defaultTitle = 'Molecular Report';
    if (isPanel) return defaultTitle;
    switch (genePanel) {
      case 'CNS':
        return `CNS Tumour ${defaultTitle}`;
      case 'Thyroid tumour':
        return `Thyroid Tumour ${defaultTitle}`;
      case 'Sarcoma':
        return `Sarcoma & Other Tumours ${defaultTitle}`;
      case 'Hepatoblastoma and hepatocellular carcinoma':
        return `Hepatoblastoma & Hepatocellular Carcinoma ${defaultTitle}`;
      case 'Wilms tumour':
        return `Wilms Tumour ${defaultTitle}`;
      case 'Leukaemia and lymphoma':
        return `Leukaemia & Lymphoma ${defaultTitle}`;
      case 'Neuroblastoma':
        return `Neuroblastoma ${defaultTitle}`;
      default:
        return defaultTitle;
    }
  }, [genePanel, isPanel]);

  const reportVersion = useMemo(() => {
    // Be careful when updating the versions
    // They are not always the same for all reports
    const name = `ZERO2 ${reportName}`;
    const version = 'V3.2 RELEASED JANUARY 2026';
    const defaultName = `${name} ${version} \n `;
    if (isPanel) return defaultName;
    switch (genePanel) {
      case 'CNS':
        return `${name} ${version} \n `;
      case 'Sarcoma':
        return `${name}\n${version}`;
      case 'Neuroblastoma':
        return `${name} ${version} \n `;
      case 'Thyroid tumour':
        return `${name}\n${version}`;
      case 'Hepatoblastoma and hepatocellular carcinoma':
        return `${name}\n${version}`;
      case 'Wilms tumour':
        return `${name} ${version} \n `;
      case 'Leukaemia and lymphoma':
        return `${name}\n${version}`;
      default:
        return defaultName;
    }
  }, [genePanel, reportName, isPanel]);

  return (
    <Template>
      <Header>
        <Box display="flex" flexDirection="row" alignItems="center">
          <img src={logoDataUri} alt="zero2-logo" style={{ height: '48px' }} />
          <Divider />
          <Box display="flex" flexDirection="column">
            <CustomTypography variant="titleRegular" fontWeight="bold">
              <span style={{ fontSize: genePanel === 'Hepatoblastoma and hepatocellular carcinoma' ? '17px' : undefined, margin: 0 }}>
                {reportName}
              </span>
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              <span style={{ textTransform: 'capitalize' }}>
                {
                  !redactedReport && demographics && demographics.firstName && demographics.lastName
                    ? (
                      <>
                        {demographics.firstName}
                        {' '}
                        {demographics.lastName?.toUpperCase()}
                        {' '}
                        &#183;
                        {' '}
                      </>
                    )
                    : ''
                }
              </span>
              <span>
                Report issue date:
                {' '}
                {dayjs(redactedReport?.approvedAt || undefined).format('DD MMM YYYY')}
                {
                  redactedReport
                    ? (
                      <>
                        {' '}
                        &#183;
                        {' '}
                        Redaction date:
                        {' '}
                        {dayjs().format('DD MMM YYYY')}
                      </>
                    ) : ''
                }
              </span>
            </CustomTypography>
          </Box>
        </Box>
        {!context && (
          <CustomTypography variant="label" style={{ color: '#022034', fontSize: '9px' }}>
            Preview
          </CustomTypography>
        )}
      </Header>
      <Footer>
        <FooterLeft>
          <CustomTypography variant="label" style={{ color: '#022034', fontSize: '8px' }}>
            SCHN HREC REF NO. 2022/ETH01232
          </CustomTypography>
          <CustomTypography variant="label" style={{ color: '#022034', fontSize: '8px' }}>
            { context ? `Page ${context.pageNum} of ${context.totalPages}` : 'Page X of X' }
          </CustomTypography>
        </FooterLeft>
        <FooterRight>
          <CustomTypography
            variant="label"
            style={{
              color: '#022034',
              whiteSpace: 'pre-wrap',
              textAlign: 'right',
              fontSize: '8px',
            }}
          >
            {reportVersion}
          </CustomTypography>
        </FooterRight>
      </Footer>
      <ReportStamp
        style={{
          width: '145px',
          height: '201px',
          position: 'absolute',
          top: '-40px',
          right: '0',
          fill: 'none',
          zIndex: 0,
          stroke: context ? lighten(corePalette.yellow30, 0.5) : corePalette.grey30,
        }}
      />
    </Template>
  );
}
