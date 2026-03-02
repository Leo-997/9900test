import { lighten } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { IReportContext } from '../../../../../types/Reports/Reports.types';
import CustomTypography from '../../../../Common/Typography';
import ReportStamp from '../../../../CustomIcons/ReportStamp';

const Template = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  '& .MuiTypography-overline': {
    letterSpacing: '1px',
  },
});

const Header = styled('div')({
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

const HeaderContent = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
});

const Logo = styled('img')({
  height: '48px',
});

const HeaderTextBox = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '0px 5%',
});

const Footer = styled('div')({
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

const FooterLeft = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
  position: 'absolute',
  left: 0,
});

const FooterRight = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  position: 'absolute',
  right: 0,
});

interface IProps {
  logoDataUri: string;
  context?: IReportContext;
}

export function GermlineNFLeafletTemplate({
  logoDataUri,
  context,
}: IProps): JSX.Element {
  return (
    <Template>
      <Header>
        <HeaderContent>
          <Logo src={logoDataUri} alt="zero2-logo" />
          <HeaderTextBox>
            <CustomTypography textAlign="center" variant="titleRegular" fontSize="20px" fontWeight="bold">
              My Child&apos;s Testing Did Not Find Any Gene Changes Related to Genetic Cancer Risk
            </CustomTypography>
          </HeaderTextBox>
        </HeaderContent>
        {!context && (
          <CustomTypography variant="label" style={{ color: corePalette.offBlack100, fontSize: '9px' }}>
            Preview
          </CustomTypography>
        )}
      </Header>
      <Footer>
        <FooterLeft>
          <CustomTypography variant="label" style={{ color: corePalette.offBlack100, fontSize: '8px' }}>
            SCHN HREC REF NO. 2022/ETH01232
          </CustomTypography>
          <CustomTypography variant="label" style={{ color: corePalette.offBlack100, fontSize: '8px' }}>
            { context ? `Page ${2 - (context.totalPages - context.pageNum)} of 2` : 'Page X of 2' }
          </CustomTypography>
        </FooterLeft>
        <FooterRight>
          <CustomTypography variant="label" style={{ color: corePalette.offBlack100, fontSize: '8px' }}>
            ZERO2 Information Sheet - No Reportable Germline Variants Detected V1
          </CustomTypography>
          <CustomTypography variant="label" style={{ color: corePalette.offBlack100, fontSize: '8px' }}>
            Date: 06-Apr-2022
          </CustomTypography>
        </FooterRight>
      </Footer>
      <ReportStamp
        style={{
          width: '145px',
          height: '201px',
          position: 'absolute',
          top: '-40px',
          right: 0,
          fill: 'none',
          zIndex: 0,
          stroke: context ? lighten(corePalette.yellow30, 0.5) : corePalette.grey30,
        }}
      />
    </Template>
  );
}
