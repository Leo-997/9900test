import { ReactNode, type JSX } from 'react';
import { Box, Tooltip } from '@mui/material';
import { InfoIcon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import CustomTypography from './Typography';

interface IProps {
  label?: string;
  value?: string | number | ReactNode;
  valueClass?: string;
  tooltip?: string;
  valueTooltip?: string | null;
  truncate?: boolean;
  direction?: 'column' | 'row';
}

export default function DataPanel({
  label,
  value,
  valueClass,
  tooltip,
  valueTooltip,
  truncate = true,
  direction = 'column',
}: IProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection={direction}
      gap="8px"
      alignItems={direction === 'column' ? 'flex-start' : 'center'}
    >
      {label && (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap="4px"
          height="16px"
        >
          {tooltip && (
            <Tooltip title={tooltip}>
              <InfoIcon size={14} />
            </Tooltip>
          )}
          <CustomTypography
            variant="label"
            truncate
            color={corePalette.grey100}
          >
            {label}
          </CustomTypography>
        </Box>
      )}
      {!value || typeof value === 'string' || typeof value === 'number' ? (
        <CustomTypography
          variant="bodyRegular"
          className={valueClass}
          truncate={truncate}
        >
          {value ?? '-'}
          {valueTooltip && (
            <Tooltip title={valueTooltip}>
              <InfoIcon size={20} />
            </Tooltip>
          )}
        </CustomTypography>
      ) : (
        value
      )}
    </Box>
  );
}
