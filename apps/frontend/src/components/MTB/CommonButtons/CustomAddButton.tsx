import {
  Box,
} from '@mui/material';
import {
  CheckIcon, MinusIcon, PlusIcon,
} from 'lucide-react';
import { useMemo, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import CustomButton from '../../Common/Button';

export interface IProps {
  isAdded: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  buttonLabel?: string;
}

export function CustomAddButton({
  isAdded,
  onAdd,
  onRemove,
  buttonLabel,
}: IProps): JSX.Element {
  const label = useMemo(() => {
    if (buttonLabel) return buttonLabel;
    return isAdded ? 'Remove' : 'Add';
  }, [buttonLabel, isAdded]);

  return (
    <div>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="16px"
        width="max-content"
      >
        {isAdded && (
          <CustomButton
            variant="subtle"
            label="Added"
            startIcon={<CheckIcon />}
            size="small"
            disabled
            sx={{
              border: `1px solid ${corePalette.green10}`,
              backgroundColor: corePalette.green10,
            }}
          />
        )}
        <CustomButton
          variant="outline"
          label={label}
          startIcon={isAdded ? <MinusIcon /> : <PlusIcon />}
          size="small"
          onClick={isAdded ? onRemove : onAdd}
        />
      </Box>
    </div>
  );
}
