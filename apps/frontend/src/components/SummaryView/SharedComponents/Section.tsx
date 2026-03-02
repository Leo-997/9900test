import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Dispatch, ReactNode, SetStateAction, type JSX,
} from 'react';
import Header from './Header';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  section: {
    width: '100%',
    borderRadius: '8px',
    backgroundColor: corePalette.white,
    padding: '8px 0px',
  },
}));

interface IProps {
  children: ReactNode;
  label: string | JSX.Element;
  count?: number;
  loading?: boolean;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  additionalHeaderContent?: ReactNode;
}

export default function Section({
  children,
  label,
  count = 0,
  loading,
  open,
  setOpen,
  additionalHeaderContent,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid key={label.toString()} className={classes.section} marginBottom="16px">
      <Header
        label={label}
        count={count}
        loading={loading}
        open={open}
        toggleOpen={(): void => setOpen && setOpen(!open)}
        additionalHeaderContent={additionalHeaderContent}
      />
      { loading ? <div /> : <Grid container>{children}</Grid> }
    </Grid>
  );
}
