import {
  Box, Menu,
  MenuItem as MuiMenuItem,
  styled,
} from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon, CirclePlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import CustomButton from '../Common/Button';

const MenuItem = styled(MuiMenuItem)(() => ({
  width: '300px',
}));

interface IProps {
  loading: boolean;
  allExpanded: boolean;
  setAllExpanded: Dispatch<SetStateAction<boolean>>;
  setPathclassModalOpen: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
}

export function SVMoreOptionsButton({
  loading,
  allExpanded,
  setAllExpanded,
  setPathclassModalOpen,
  disabled,
}: IProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      padding="0px 8px"
    >
      <CustomButton
        variant="text"
        size="small"
        label="More Options"
        endIcon={anchorEl ? (
          <ChevronUpIcon />
        ) : (
          <ChevronDownIcon />
        )}
        onClick={(e): void => setAnchorEl(e.currentTarget)}
      />
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={(): void => setAnchorEl(null)}
      >
        <MenuItem onClick={(): void => setAllExpanded((prev) => !prev)}>
          <Box display="flex" gap="8px">
            {allExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {allExpanded ? 'Collapse ' : 'Expand '}
            all SVs
          </Box>
        </MenuItem>

        <MenuItem
          onClick={(): void => setPathclassModalOpen(true)}
          disabled={loading || disabled}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            width="100%"
          >
            <Box display="flex" justifyContent="center">
              <Box width="24px" height="24px" />
              Clear pathogenicity
            </Box>
            <CirclePlusIcon />
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
}
