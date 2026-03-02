import { corePalette } from '@/themes/colours';
import {
    Grid, Link,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowUpRightIcon } from 'lucide-react';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

const Paper = styled(MuiPaper)(() => ({
  margin: '4px 0 4px 0',
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
  width: 'fit-content',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  paddingLeft: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  paddingRight: '8px',
  width: '25%',
  minWidth: '400px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '100px',
  minWidth: '100px',
  flexDirection: 'column',
  height: '80px',
}));

const ItemLarge = styled(Item)(() => ({
  width: '150px',
  minWidth: '150px',
}));

const useStyles = makeStyles(() => ({
  card: {
    width: '100%',
    height: '150px',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: '0 0 0 50px',
    margin: '8px 0',
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'space-evenly',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
    border: 'none',
    boxShadow: 'none',
    height: '70%',
  },
  chip: {
    color: '#fff',
    borderRadius: '8px',
    width: '85%',
    height: '28px',
    marginRight: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  chipActivated: {
    backgroundColor: '#FF2465',
  },
  chipInhibited: {
    backgroundColor: '#17B260',
  },
  arrowIcon: {
    color: '#1E86FC',
    marginLeft: '10px',
    verticalAlign: 'text-bottom',
  },
  footnote: {
    marginTop: '0.5em',
  },
  dynamicWrapper: {
    width: '100%',
    height: '100%',
  },
}));

export interface IPathway {
  pathwayId: number;
  name: string;
  status: string;
  pSize: string;
  nde: string;
  pNde: string;
  ta: string;
  ppert: string;
  pg: string;
  pgfdr: string;
  pgfwer: string;
  kegglink: string;
}

interface IProps {
  pathway: IPathway;
}

export default function PathwaysListItem({
  pathway,
}: IProps): JSX.Element {
  const classes = useStyles();

  const numDec = (num: number): number => {
    const match = (`${num}`).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0),
    );
  };

  const shortenFloat = (val: string): string => (
    numDec(parseFloat(val)) > 3 ? parseFloat(val).toExponential(2) : val
  );

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container direction="column" height="100%" justifyContent="center">
          <CustomTypography variant="label">NAME</CustomTypography>
          <CustomTypography variant="titleRegular" fontWeight="medium">{pathway.name}</CustomTypography>
          <CustomTypography variant="bodyRegular" className={classes.footnote}>
            ID:
            {pathway.pathwayId}
          </CustomTypography>
        </Grid>
      </StickySection>
      <Item container>
        <CustomTypography variant="label">STATUS</CustomTypography>
        <CustomChip
          backgroundColour={pathway.status === 'Activated' ? corePalette.red100 : corePalette.green100}
          colour={corePalette.white}
          label={pathway.status}
        />
      </Item>
      <Item container>
        <CustomTypography variant="label">pSIZE</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.pSize)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">NDE</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.nde)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">pNDE</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.pNde)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">tA</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.ta)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">pPERT</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.ppert)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">pG</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.pg)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">pGFdr</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.pgfdr)}</CustomTypography>
      </Item>
      <Item container>
        <CustomTypography variant="label">pGFWER</CustomTypography>
        <CustomTypography variant="bodyRegular">{shortenFloat(pathway.pgfwer)}</CustomTypography>
      </Item>
      <ItemLarge container>
        <CustomTypography variant="label">KEGGLINK</CustomTypography>
        <Link href={pathway.kegglink}>
          <CustomTypography variant="bodyRegular" color={corePalette.green150}>
            View Pathway
            <ArrowUpRightIcon />
          </CustomTypography>
        </Link>
      </ItemLarge>
    </Paper>
  );
}
