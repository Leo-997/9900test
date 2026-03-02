import {
  Box,
  Divider as MuiDivider,
  styled,
} from '@mui/material';
import { CSSProperties, ReactNode, type JSX } from 'react';
import CustomButton from '../Common/Button';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import Counts from './Counts';

const Divider = styled(MuiDivider)(({ theme }) => ({
  height: '32px',
  color: theme.colours.core.grey50,
  borderRadius: '4px',
}));

interface IStyleProps {
  dashboard?: boolean;
  isCompressed?: boolean;
}

const Wrapper = styled(Box)<IStyleProps>(({ dashboard, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  height: 'auto',
  padding: '8px',
  borderRadius: '0px 4px 4px 4px',
  borderBottom: dashboard ? 'none' : `1px solid ${theme.colours.core.grey50}`,
  boxSizing: 'border-box',
  backgroundColor: theme.colours.core.white,
  overflow: 'visible',
}));

const StyledScrollableSection = styled(ScrollableSection)({
  minHeight: '36px',
  width: '100%',
  overflowY: 'hidden',
  '& .simplebar-content': {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
});

interface IProps {
  children?: ReactNode;
  beforeCounts?: ReactNode;
  dashboard?: boolean;
  search?: ReactNode;
  isDefault?: boolean;
  resetToDefault?: () => void;
  counts?: { current: number; total: number };
  styleOverride?: CSSProperties;
  afterCounts?: ReactNode;
  isCompressed?: boolean;
}

export default function SearchFilterBar({
  children,
  beforeCounts,
  dashboard = false,
  search,
  isDefault = true,
  resetToDefault,
  counts,
  styleOverride,
  afterCounts,
  isCompressed = false,
}: IProps): JSX.Element {
  return (
    <Wrapper
      style={styleOverride}
      dashboard={dashboard}
    >
      {search && (
        <>
          {search}
          <Divider orientation="vertical" />
        </>
      )}
      <StyledScrollableSection>
        {children}
        {(isDefault === false && resetToDefault !== undefined) && (
        <CustomButton
          variant="text"
          size="small"
          label={isCompressed ? 'Reset' : 'Reset to default'}
          onClick={() => resetToDefault?.()}
          sx={{
            minWidth: isCompressed ? '60px' : '140px',
            marginLeft: isCompressed ? '6px' : '18px',
          }}
        />
        )}
      </StyledScrollableSection>
      {beforeCounts && (
        <>
          <Divider orientation="vertical" sx={{ marginRight: '8px' }} />
          {beforeCounts}
        </>
      )}
      {counts && <Counts counts={counts} isCompressed={isCompressed} />}
      {afterCounts && (
        <>
          <Divider orientation="vertical" sx={{ marginRight: '8px' }} />
          {afterCounts}
        </>
      )}
    </Wrapper>
  );
}
