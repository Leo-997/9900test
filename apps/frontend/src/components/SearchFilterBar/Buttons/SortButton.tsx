import { corePalette } from '@/themes/colours';
import {
  Box,
  FormControl,
  Menu,
  styled,
} from '@mui/material';
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { ISortOptions } from '../../../types/Search.types';
import { ISortMenuOption } from '../../../types/misc.types';
import CustomButton from '../../Common/Button';
import CustomTypography from '../../Common/Typography';
import ClearSortMenuItem from '../ClearSortMenuItem';
import SortMenu from '../SortMenu';

interface IStyleProps {
  isCompressed?: boolean;
}

const Wrapper = styled(Box)<IStyleProps>(({ isCompressed }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: isCompressed ? '5px' : '8px',
  minHeight: '36px',
}));

interface ISortProps<T extends ISortOptions> {
  toggled: T;
  setToggled: Dispatch<SetStateAction<T>>;
  sortOptions: ISortMenuOption<string>[];
  isCompressed?: boolean;
  disabled?: boolean;
}

export default function SortButton<T extends ISortOptions>({
  toggled,
  setToggled,
  sortOptions,
  isCompressed = false,
  disabled = false,
}: ISortProps<T>): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleChangeDynamic = (value: string): void => {
    const newSortColumns: string[] = [];
    const newSortDirections: string[] = [];
    if (value !== '') {
      const values = value.split(';');

      values.forEach((val: string) => {
        const valueSplit = val.split(':');
        newSortColumns.push(valueSplit[0]);
        newSortDirections.push(valueSplit[1]);
      });
    }

    setToggled({
      ...toggled,
      sortColumns: newSortColumns,
      sortDirections: newSortDirections,
    });
    setAnchorEl(null);
  };

  const prepSortTag = (): JSX.Element => {
    if (isCompressed) return <div />;

    let icon = <div />;
    if (toggled.sortDirections) {
      switch (toggled.sortDirections[0]) {
        case 'asc':
          icon = <ArrowUp color={corePalette.green150} />;
          break;
        case 'desc':
          icon = <ArrowDown color={corePalette.green150} />;
          break;
        default:
          icon = <div />;
      }
    }

    return (
      <CustomTypography
        variant="bodySmall"
        sx={{
          color: corePalette.green150,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {toggled.sortColumns && !isCompressed ? toggled.sortColumns[0] : ''}
        {icon}
      </CustomTypography>
    );
  };

  return (
    <Wrapper>
      <CustomButton
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        variant={toggled.sortColumns && toggled.sortColumns.length > 0 ? 'subtle' : 'text'}
        size="small"
        disabled={disabled}
        startIcon={!isCompressed && (
          <ArrowUpDown />
        )}
        endIcon={<ChevronDown />}
        label={(
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="8px"
          >
            <CustomTypography color="inherit" variant="bodySmall" whiteSpace="nowrap">
              Sort
              {' '}
              {!isCompressed && ' by'}
            </CustomTypography>
            {!isCompressed && toggled.sortDirections && toggled.sortDirections[0] && (
              prepSortTag()
            )}
          </Box>
        )}
        sx={{
          backgroundColor: toggled.sortColumns && toggled.sortColumns.length > 0
            ? corePalette.green10
            : 'inherit',
          width: '100%',
          color: corePalette.offBlack100,
        }}
      />
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        MenuListProps={{ disablePadding: true }}
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
      >
        <FormControl>
          <SortMenu menuItems={sortOptions} onChange={handleChangeDynamic} />
          <ClearSortMenuItem
            clearDisabled={toggled.sortColumns?.length === 0}
            onChange={handleChangeDynamic}
          />
        </FormControl>
      </Menu>
    </Wrapper>
  );
}
