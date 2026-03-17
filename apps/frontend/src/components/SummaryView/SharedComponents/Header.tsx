import { Box, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ChevronDownIcon } from 'lucide-react';
import { ReactNode, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import CustomChip from '@/components/Common/Chip';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  header: {
    height: '60px',
    width: '100%',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0px 8px',
  },
  fullRadius: {
    borderRadius: '4px',
  },
  chipLabel: {
    color: 'inherit',
  },
  downIcon: {
    textAlign: 'center',
    color: 'inherit',
    height: 8,
    width: 16,
    marginLeft: 16,
    marginRight: 16,
  },
  rightIcon: {
    paddingTop: 5,
    textAlign: 'center',
    color: 'inherit',
    height: 21,
    width: 8,
    marginLeft: 20,
    marginRight: 20,
  },
  dummyLeftDiv: {
    width: 48,
    height: 5,
  },
}));

interface IProps {
  label: string | JSX.Element;
  open: boolean | undefined;
  toggleOpen: () => void;
  count?: number;
  loading?: boolean;
  additionalHeaderContent?: ReactNode;
}

export default function Header({
  label,
  open,
  toggleOpen,
  count,
  loading,
  additionalHeaderContent,
}: IProps): JSX.Element {
  const classes = useStyles();

  function getChip(): JSX.Element | null {
    if (loading) {
      return (
        <CustomChip
          pill
          icon={(
            <Box color={corePalette.green300} display="flex" alignItems="center">
              <CircularProgress size={18} />
            </Box>
          )}
          label="Loading"
          size="large"
          backgroundColour={corePalette.green10}
          colour={corePalette.green300}
        />
      );
    }
    if (count) {
      return count >= 1
        ? (
          <CustomChip
            pill
            label={`${count} reportable`}
            size="large"
            backgroundColour={corePalette.green10}
            colour={corePalette.green300}
          />
        ) : (
          <CustomChip
            pill
            label="None reportable"
            size="large"
            backgroundColour={corePalette.green10}
            colour={corePalette.green300}
          />
        );
    }
    return null;
  }

  return (
    <Grid
      container
      gap="8px"
      alignItems="center"
      justifyContent="flex-start"
      onClick={(): void => toggleOpen()}
      className={
        open ? classes.header : clsx(classes.header, classes.fullRadius)
      }
      wrap="nowrap"
    >
      <Grid>
        <ChevronDownIcon
          width="32px"
          height="32px"
          style={{
            transition: 'all 1s cubic-bezier(.19,1,.22,1)',
            transform: !open ? 'rotate(-90deg)' : undefined,
          }}
        />
      </Grid>
      <Grid size={12}>
        <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
          <Grid>
            <CustomTypography variant="titleRegular" fontWeight="medium">{label}</CustomTypography>
          </Grid>
          <Grid>{getChip()}</Grid>
          <Grid>
            {additionalHeaderContent}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
