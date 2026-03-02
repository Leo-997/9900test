import { corePalette } from '@/themes/colours';
import { IQuickFilter } from '@/types/Common.types';
import { SearchOptions } from '@/types/Search.types';
import { Tooltip, TooltipProps } from '@mui/material';
import CustomButton from '../../Common/Button';

import type { JSX } from "react";

interface IQuickFilterButtonProps<T extends SearchOptions> {
  toggled?: T;
  data: IQuickFilter<T>;
  isLoading?: boolean;
  disabled?: boolean;
  tooltipPlacement?: TooltipProps['placement'];
}

export default function QuickFilterButton<T extends SearchOptions>({
  toggled,
  data,
  isLoading,
  disabled,
  tooltipPlacement,
} : IQuickFilterButtonProps<T>): JSX.Element {
  const {
    tooltip,
    label,
    disabled: dataDisabled,
    onClick,
    checkIsActive,
  } = data;

  return (
    <Tooltip title={tooltip || ''} placement={tooltipPlacement || 'bottom'}>
      <span>
        <CustomButton
          variant="outline"
          size="small"
          label={label}
          onClick={onClick}
          disabled={disabled || isLoading || dataDisabled}
          sx={{
            whiteSpace: 'nowrap',
            ...(checkIsActive(toggled as T) && {
              color: corePalette.green200,
              backgroundColor: corePalette.green10,
            }),
          }}
        />
      </span>
    </Tooltip>
  );
}
