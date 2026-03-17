import { JSX } from 'react';
import {
  Outlet, useHref, useMatch, useNavigate,
} from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { CustomTabs } from '@/components/Common/Tabs';
import { curationAtlasTabs } from '@/constants/Curation/tabs';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { corePalette } from '@/themes/colours';

const wrapperStyle = {
  width: '100vw',
  marginTop: 80,
  height: 'calc(100vh - 80px)',
  maxHeight: 'calc(100vh - 80px)',
  backgroundColor: corePalette.grey10,
};

const ContentWrapper = styled(Box)(wrapperStyle);
const ScrollableContentWrapper = styled(ScrollableSection)(wrapperStyle);

export default function CurationAtlasRoutes(): JSX.Element {
  const navigate = useNavigate();
  const href = useHref('.');

  const tabMatch = useMatch(`${href}/:tab/*`);
  const curationAtlasTabName = tabMatch?.params.tab;
  const geneListTab = tabMatch?.params['*'];

  const content = (
    <>
      <CustomTabs
        variant="navigation"
        indicatorLocation="bottom"
        value={curationAtlasTabName}
        onChange={(e, v): void => {
          navigate(v);
        }}
        tabs={curationAtlasTabs.map(({ label, to }) => ({
          label,
          value: to,
        }))}
        sx={{
          px: '32px',
          borderBottom: `1px solid ${corePalette.grey50}`,
        }}
      />
      <Outlet />
    </>
  );

  return (
    geneListTab
      ? (
        <ContentWrapper>
          {content}
        </ContentWrapper>
      )
      : (
        <ScrollableContentWrapper>
          {content}
        </ScrollableContentWrapper>
      )
  );
}
