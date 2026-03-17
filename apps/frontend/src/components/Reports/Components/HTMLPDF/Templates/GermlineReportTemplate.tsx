import { Box, lighten, styled } from '@mui/material';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { IPatientDemographics } from '../../../../../types/Patient/Patient.types';
import { IReportContext } from '../../../../../types/Reports/Reports.types';
import CustomTypography from '../../../../Common/Typography';
import ReportStamp from '../../../../CustomIcons/ReportStamp';

const Template = styled('div')({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  pointerEvents: 'none',
  overflow: 'hidden',
  '& .MuiTypography-overline': {
    letterSpacing: '1px',
  },
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

interface IGermlineNFTemplateProps {
  logoDataUri: string;
  context?: IReportContext;
  demographics?: IPatientDemographics | null;
}

export function GermlineReportTemplate({
  logoDataUri,
  context,
  demographics,
}: IGermlineNFTemplateProps): JSX.Element {
  return (
    <Template>
      <Header>
        <Box display="flex" flexDirection="row" alignItems="center" width="100%">
          <img src={logoDataUri} alt="zero2-logo" style={{ height: '48px' }} />
          <Box display="flex" flexDirection="column" alignItems="center" width="100%">
            <CustomTypography variant="titleRegular" fontSize="24px" fontWeight="bold">
              <span>Germline Cancer Genetics Research Report</span>
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              <span style={{ textTransform: 'capitalize' }}>
                {
                  demographics && demographics.firstName && demographics.lastName
                    ? `${demographics.firstName} ${demographics.lastName?.toUpperCase()}`
                    : ''
                }
              </span>
              <span>
                &nbsp;&#183; Report issue date:&nbsp;
                <span>{dayjs().format('DD MMM YYYY')}</span>
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
          <CustomTypography variant="label" style={{ color: '#022034', fontSize: '8px' }}>
            ZERO2 GERMLINE CANCER GENETICS RESEARCH REPORT V3.1 RELEASED JANUARY 2026
            <br />
            <br />
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
