import {
  Grid,
  IconButton,
} from '@mui/material';
import {
  Maximize2Icon, Minimize2Icon, PanelRightCloseIcon, PanelRightOpenIcon, XIcon,
} from 'lucide-react';
import { ReactNode, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../../Common/Typography';
import ExpandedModalTitle from './ExpandedModalTitle';

type GridSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface IGridLayoutOptions {
  middleSection: GridSize;
  lastSection: GridSize;
}

interface IProps {
  icon?: ReactNode;
  title?: string | ReactNode;
  titleContent?: string | ReactNode;
  expandPanel?: ReactNode;
  isCommentsCollapsed?: boolean;
  isResourceCollapsed?: boolean;
  isFullScreen?: boolean;
  hidePanels?: boolean;
  onClose: () => void;
  onResoucesCollapse: () => void;
  onCommentsCollapse: () => void;
  onFullScreen: () => void;
}

export function ExpandedModalHeader({
  icon,
  title,
  titleContent,
  expandPanel,
  isCommentsCollapsed,
  isResourceCollapsed,
  isFullScreen,
  onClose,
  onResoucesCollapse,
  onCommentsCollapse,
  onFullScreen,
  hidePanels = false,
}: IProps): JSX.Element {
  const getGridSystemValues = (): IGridLayoutOptions => {
    if (isCommentsCollapsed) {
      return {
        middleSection: 2,
        lastSection: 4,
      };
    }
    return {
      middleSection: 4,
      lastSection: 2,
    };
  };

  return (
    <Grid container alignItems="center" height="100%" flexWrap="nowrap" width="100%" justifyContent="space-between">
      <Grid size={5} height="100%" padding="16px 32px">
        <ExpandedModalTitle
          title={title}
          icon={icon}
          titleContent={titleContent}
        />
      </Grid>
      {!hidePanels && !expandPanel && (
        <>
          <Grid
            size={getGridSystemValues().middleSection}
            height="100%"
            alignItems="center"
            padding="16px"
            container
            borderLeft={`2px solid ${corePalette.grey30}`}
            gap="8px"
          >
            <Grid>
              <IconButton onClick={onCommentsCollapse}>
                {isCommentsCollapsed ? (
                  <PanelRightOpenIcon />
                ) : (
                  <PanelRightCloseIcon />
                )}
              </IconButton>
            </Grid>
            <Grid>
              <CustomTypography variant="bodyRegular" fontWeight="bold">
                Variant Comments
              </CustomTypography>
            </Grid>
          </Grid>
          <Grid
            size={getGridSystemValues().lastSection}
            height="100%"
            alignItems="center"
            padding="16px"
            container
            borderLeft={`2px solid ${corePalette.grey30}`}
            gap="8px"
            wrap="nowrap"
          >
            <Grid>
              <IconButton onClick={onResoucesCollapse}>
                {isResourceCollapsed ? (
                  <PanelRightOpenIcon />
                ) : (
                  <PanelRightCloseIcon />
                )}
              </IconButton>
            </Grid>
            <Grid>
              <CustomTypography variant="bodyRegular" fontWeight="bold">
                Resources
              </CustomTypography>
            </Grid>
          </Grid>
        </>
      )}
      <Grid container gap="8px" flexWrap="nowrap" size={1} padding="16px" justifyContent="flex-end">
        <IconButton onClick={onFullScreen}>
          {isFullScreen ? (
            <Minimize2Icon />
          ) : (
            <Maximize2Icon />
          )}
        </IconButton>
        <IconButton onClick={onClose}>
          <XIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
