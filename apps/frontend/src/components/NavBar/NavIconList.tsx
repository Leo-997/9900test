import {
  ButtonBase,
  darken,
  Grid,
  lighten,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactElement, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import CircosIcon from '../CustomIcons/CircosIcon';
import CircosIconSelected from '../CustomIcons/CircosIconSelected';
import IGVIcon from '../CustomIcons/IGVIcon';
import IGVIconSelected from '../CustomIcons/IGVIconSelected';
import LibraryIcon from '../CustomIcons/LibraryIcon';
import LibraryIconSelected from '../CustomIcons/LibraryIconSelected';
import LinxIcon from '../CustomIcons/LinxIcon';
import LinxIconSelected from '../CustomIcons/LinxIconSelected';
import ReportsIcon from '../CustomIcons/ReportsIcon';
import SummaryTextIcon from '../CustomIcons/SummaryTextIcon';

interface IIconButtonProps {
  isSelected?: boolean;
}

const IconButton = styled(ButtonBase)<IIconButtonProps>(({ theme, isSelected }) => {
  const backgroundColor = isSelected ? theme.colours.core.offBlack100 : theme.colours.core.white;
  const hoverColor = isSelected ? lighten(backgroundColor, 0.1) : darken(backgroundColor, 0.1);
  return {
    margin: '0px',
    padding: '0px',
    width: '72px',
    height: '72px',
    borderRadius: 5,
    transition: 'all 0.7s cubic-bezier(.19,1,.22,1)',
    backgroundColor,
    '&:hover': {
      backgroundColor: hoverColor,
    },
  };
});

const useStyles = makeStyles(() => ({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  iconHide: {
    display: 'none',
  },
}));

interface INavIconProps {
  drawerType: string;
  handleOpen(drawerType: string): void;
  isSummary: boolean;
}

function NavIconList({
  drawerType,
  isSummary,
  handleOpen,
}: INavIconProps): ReactElement<any> {
  const classes = useStyles();
  const { search } = useLocation();

  const canReadReport = useIsUserAuthorised('report.read');
  const canDownload = useIsUserAuthorised('curation.sample.read'); // To allow viewers to download IGV files
  // const handleGenomePaint = (): void => {
  //   window.open("http://proteinpaint.ccimr.cloud:3000/", "_blank");
  // };

  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);
      if (
        params.get('navBar') === 'reports'
        && !isSummary
        && canReadReport
      ) {
        handleOpen('REPORTS');
      }
    }
  }, [search, isSummary, handleOpen, canReadReport]);

  return (
    <Grid container style={{ height: 72 }}>
      {/* Uncomment when proteinpaint is ready */}
      {/* <Grid
        item
        xs={12}
        className={
          isPrecuration ? `${classes.panel} ${classes.iconHide}` : classes.panel
        }
      >
        <Button className={classes.iconBtn} onClick={handleGenomePaint}>
          <GenomePaintIcon
            className={classes.imageIcon}
          />
        </Button>
      </Grid> */}
      <Grid
        size={12}
        className={classes.panel}
        style={{ marginTop: '0', paddingTop: '0' }}
      >
        <IconButton
          onClick={(): void => handleOpen('CIRCOS')}
          isSelected={drawerType === 'CIRCOS'}
        >
          {drawerType === 'CIRCOS' ? (
            <CircosIconSelected />
          ) : (
            <CircosIcon />
          )}
        </IconButton>
      </Grid>
      <Grid size={12} className={classes.panel}>
        <IconButton
          onClick={(): void => handleOpen('LINX')}
          isSelected={drawerType === 'LINX'}
        >
          {drawerType === 'LINX' ? (
            <LinxIconSelected />
          ) : (
            <LinxIcon />
          )}
        </IconButton>
      </Grid>
      {canDownload && (
        <Grid size={12} className={classes.panel}>
          <IconButton
            onClick={(): void => handleOpen('IGV')}
            isSelected={drawerType === 'IGV'}
          >
            {drawerType === 'IGV' ? (
              <IGVIconSelected />
            ) : (
              <IGVIcon />
            )}
          </IconButton>
        </Grid>
      )}
      <Grid size={12} className={classes.panel}>
        <IconButton
          onClick={(): void => handleOpen('LIBRARY')}
          isSelected={drawerType === 'LIBRARY'}
        >
          {drawerType === 'LIBRARY' ? (
            <LibraryIconSelected />
          ) : (
            <LibraryIcon />
          )}
        </IconButton>
      </Grid>
      {!isSummary && (
        <>
          <Grid size={12} className={classes.panel}>
            <IconButton
              onClick={(): void => handleOpen('SUMMARY')}
            >
              <SummaryTextIcon />
            </IconButton>
          </Grid>
          {canReadReport && (
            <Grid size={12} className={classes.panel}>
              <IconButton
                onClick={(): void => handleOpen('REPORTS')}
              >
                <ReportsIcon />
              </IconButton>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
}

export default NavIconList;
