import { Box, styled, TabProps } from '@mui/material';
import { ArrowLeftIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JSX } from 'react';
import CustomButton from '@/components/Common/Button';
import { CustomTabs } from '@/components/Common/Tabs';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';

interface IGeneViewHeaderProp {
  name: string,
  geneTabNames: TabProps[],
  currentTabValue: number,
  setCurrentTabValue: (value: number) => void,
  setIsLoading: (value: boolean) => void,
  type: string | undefined
}

const HeaderBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100vw',
  backgroundColor: corePalette.grey10,
});

const TitleBox = styled(Box)({
  padding: '0 32px',
});

const TabWrapper = styled(Box)({
  width: 'calc(100% - 64px)',
  margin: '0 32px',
  borderBottom: `1px solid ${corePalette.grey50}`,
});

export default function ViewPageHeader({
  name,
  geneTabNames,
  currentTabValue,
  setCurrentTabValue,
  setIsLoading,
  type,
}: IGeneViewHeaderProp) : JSX.Element {
  const navigate = useNavigate();

  const handleGeneTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setIsLoading(true);
    setCurrentTabValue(newValue);
  };

  return (
    <HeaderBox>
      <TitleBox>
        <CustomButton
          label="All Gene Panels"
          variant="text"
          startIcon={<ArrowLeftIcon />}
          size="medium"
          onClick={(): Promise<void> | void => navigate('/atlas')}
          sx={{
            height: 'fit-content',
            width: 'fit-content',
            padding: '24px 0',
            '&:hover': {
              textDecoration: 'underline',
              background: corePalette.blank,
            },
            '&:active': {
              textDecoration: 'underline',
              background: corePalette.blank,
              outline: 'none',
              border: 'none',
            },
          }}
        />
        <CustomTypography
          variant="h2"
          fontSize="34px"
          fontWeight="500"
          sx={{
            height: '48px',
            '&:hover': { cursor: 'default' },
          }}
        >
          {name}
          {' '}
          {type === 'gene-list' ? 'List' : 'Gene Panel'}
        </CustomTypography>
      </TitleBox>

      <TabWrapper>
        <CustomTabs
          variant="navigation"
          size="large"
          tabs={[
            ...geneTabNames,
            ...(
              type === 'gene-panel'
                ? [
                  {
                    label: 'Reportable Cytogenetics',
                    value: 'cytogenetics',
                  },
                  {
                    label: 'Reportable RNA Expression',
                    value: 'rna',
                  },
                  {
                    label: 'Landscape Papers',
                    value: 'landscape',
                  },
                ] : []
            ),
          ]}
          indicatorLocation="bottom"
          onChange={handleGeneTabChange}
          value={currentTabValue}
        />
      </TabWrapper>
    </HeaderBox>
  );
}
