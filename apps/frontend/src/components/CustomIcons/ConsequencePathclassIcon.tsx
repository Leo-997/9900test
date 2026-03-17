import { corePalette } from '@/themes/colours';
import {
  Box, styled,
  Tooltip,
} from '@mui/material';
import { PathClass } from '../../types/Common.types';
import getGeneImportance from '../../utils/functions/getGeneImportance';
import { abbreviatePathclass } from '../../utils/misc/abbreviatePathclass';
import CustomTypography from '../Common/Typography';
import PathclassIcon from './PathclassIcon';

import type { JSX } from "react";

interface IProps {
  height?: number;
  width?: number;
  iconColor?: string;
  consequence?: string;
  pathclass?: PathClass | null;
}

interface IStyleProps {
  pathImp: number;
}

interface IIconProps {
  textColor: string;
  iconColor: string;
}

const getIconProps = (pathImp: number): IIconProps => {
  switch (pathImp) {
    case 3:
      return { textColor: corePalette.red200, iconColor: corePalette.red10 };
    case 2:
      return { textColor: corePalette.green200, iconColor: corePalette.green10 };
    default:
      return { textColor: corePalette.offBlack100, iconColor: corePalette.grey50 };
  }
};

const TooltipText = styled(CustomTypography)<IStyleProps>(({ theme, pathImp }) => ({
  color: pathImp > 1 ? getIconProps(pathImp).textColor : theme.colours.core.offBlack200,
  fontWeight: 600,
}));

export function ConsequencePathclassIcon({
  pathclass = null,
  height = 60,
  width = 60,
  consequence,
}: IProps): JSX.Element {
  const { pathImp } = getGeneImportance(pathclass, undefined);

  const label: string | undefined = abbreviatePathclass(pathclass);

  const tooltipText = pathclass || consequence ? (
    <Box display="flex" flexDirection="column">
      <TooltipText pathImp={pathImp} variant="bodySmall">
        {pathclass}
      </TooltipText>
      { consequence && (
      <>
        <CustomTypography color="inherit" variant="label">
          Consequences
        </CustomTypography>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <CustomTypography color="inherit" style={{ marginLeft: 10 }} variant="bodySmall">
            {consequence?.replaceAll('&', ' & ') || 'UNKOWN'}
          </CustomTypography>
        </Box>
      </>
      )}
    </Box>
  ) : (
    <TooltipText pathImp={pathImp} variant="bodySmall">
      Unknown
    </TooltipText>
  );

  return (
    <Tooltip title={tooltipText} placement="right">
      <div>
        <PathclassIcon
          {...getIconProps(pathImp)}
          pathclass={pathclass}
          text={label || undefined}
          height={height}
          width={width}
        />
      </div>
    </Tooltip>
  );
}
