import { corePalette } from '@/themes/colours';
import { IChip } from '@/types/Chip.types';
import {
  Box,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, type JSX } from 'react';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';

const InputWrapper = styled(Box)(() => ({
  position: 'relative',
  minHeight: 50,
  flexWrap: 'wrap',
  marginTop: 15,
  gap: '8px',
  display: 'flex',
}));

const useStyles = makeStyles(() => ({
  chipsWrapper: {
    maxHeight: '170px',
  },
  inputWrapper: {
    position: 'relative',
    minHeight: 50,
    flexWrap: 'wrap',
    maxWidth: 441,
    marginTop: 15,
  },
}));

interface IChipsProps {
  type: 'success' | 'error';
  chips: IChip[];
  handleDelete: (chip: string) => void;
  successTitle: string;
  errorTitle?: string;
}

export default function ChipsList({
  type,
  chips,
  handleDelete,
  successTitle,
  errorTitle,
}: IChipsProps): JSX.Element {
  const classes = useStyles();

  const renderChips = (chip: IChip): ReactNode => (
    <CustomChip
      pill
      size="medium"
      label={chip.label}
      onDelete={(): void => handleDelete(chip.label)}
      key={chip.key}
      backgroundColour={
          type === 'success'
            ? corePalette.green10
            : corePalette.red10
        }
      colour={
          type === 'success'
            ? corePalette.green150
            : corePalette.red100
        }
      sx={{
        '& .MuiChip-deleteIcon': {
          color:
            type === 'success'
              ? `${corePalette.green150} !important`
              : `${corePalette.red50} !important`,
        },
      }}
    />
  );

  return (
    <>
      <CustomTypography style={{ textTransform: 'capitalize', marginBottom: '8px' }} variant="label">
        { type === 'success'
          ? successTitle
          : errorTitle}
      </CustomTypography>
      {chips.length > 0
        && (
        <ScrollableSection className={classes.chipsWrapper}>
          <InputWrapper>
            {chips.map((g) => renderChips(g))}
          </InputWrapper>
        </ScrollableSection>
        )}
    </>
  );
}
