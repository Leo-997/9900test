import {
    Box,
    Grid,
    Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ChevronDownIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { referenceData } from '../../../../../constants/TiersData';
import StatusChip from '../../../../Chips/StatusChip';
import CustomTypography from '../../../../Common/Typography';

const useStyles = makeStyles(() => ({
  root: {
    width: '264px',
  },
  rootDynamic: {
    width: 'min(max(18vw, 264px), 410px)',
  },
  sectionPadding: {
    paddingBottom: '6%',
  },
  overline: {
    fontSize: '12px',
    fontWeight: 'normal',
  },
  fixedColumns: {
    minWidth: '100%',
    maxWidth: '100%',
  },
  dropdownIconInverse: {
    transform: 'rotate(180deg)',
  },
  row: {
    border: '1px solid #ECF0F3',
    borderBottom: 'none',
    padding: '3% 6%',
    backgroundColor: '#FFF',
  },
  dropdown: {
    alignItems: 'center',
    borderRadius: '8px 8px 0 0',
    paddingBottom: '6%',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      cursor: 'pointer',
    },
  },
  hiddenTable: {
    borderBottom: '1px solid #ECF0F3',
    borderRadius: '8px',
    padding: '3% 6%',
  },
  noTopBorder: {
    borderTop: 'none',
  },
  rowMiddle: {
    border: '1px solid #ECF0F3',
    borderTop: 'none',
    padding: '6% 6% 4%',
    backgroundColor: '#FFF',
  },
  dataRow: {
    borderLeft: '1px solid #ECF0F3',
    borderRight: '1px solid #ECF0F3',
    padding: '3% 6%',
    backgroundColor: '#FFF',
    position: 'relative',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      // left: 0,
      height: '1px',
      width: '90%',
      borderTop: '1px solid #ECF0F3',
    },
  },
  bottomBorder: {
    borderBottom: '1px solid #ECF0F3',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  titleColor: {
    color: '#022034',
  },
  columnHeadingsColor: {
    color: '#62728C',
  },
}));

interface IProps {
  defaultOpen?: boolean;
  disableClicks?: boolean;
}

export default function TierReferenceGrid({
  defaultOpen,
  disableClicks,
}: IProps): JSX.Element {
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen || false);

  const handleDropdown = ():void => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <Grid
      container
      className="discussion-tier-grid"
      sx={{
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <Grid
        size={12}
        className={clsx(
          classes.sectionPadding,
          classes.fixedColumns,
        )}
      >
        <Grid
          container
          justifyContent="space-between"
          className={clsx(
            classes.row,
            classes.dropdown,
            !isOpen && classes.hiddenTable,
          )}
          style={{ pointerEvents: disableClicks ? 'none' : undefined }}
          onClick={handleDropdown}
        >
          <Grid>
            <CustomTypography variant="label" className={classes.titleColor}>
              Recommendation Tier
            </CustomTypography>
          </Grid>
          {!disableClicks && (
            <Grid style={{ display: 'flex' }}>
              <ChevronDownIcon
                style={{
                  transform: isOpen ? 'rotate(180deg)' : undefined,
                  transition: 'all 0.5s cubic-bezier(.19, 1, .22, 1)',
                }}
              />
            </Grid>
          )}
        </Grid>
        <Box display={isOpen ? undefined : 'none'}>
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            className={clsx(classes.row, classes.noTopBorder)}
            wrap="nowrap"
          >
            <Grid style={{ minWidth: '50px', paddingRight: '12px' }}>
              <CustomTypography variant="label">Tier</CustomTypography>
            </Grid>
            <Grid>
              <Tooltip
                title="Strength of evidence in relationship to current published literature"
                placement="top"
              >
                <span>
                  <CustomTypography variant="label" truncate>
                    Strength of evidence*
                  </CustomTypography>
                </span>
              </Tooltip>
            </Grid>
          </Grid>
          {referenceData.map((tier, index) => (
            <Grid
              key={tier}
              container
              wrap="nowrap"
              justifyContent="flex-start"
              alignItems="center"
              className={classes.dataRow}
            >
              <Grid style={{ minWidth: '50px', paddingRight: '12px' }}>
                <StatusChip
                  status={(index + 1).toString()}
                  backgroundColor="#E4F9EE"
                  color="#1F313D"
                  size="small"
                />
              </Grid>
              <Grid>
                <CustomTypography variant="bodySmall">
                  {tier}
                </CustomTypography>
              </Grid>
            </Grid>
          ))}
          <Grid
            container
            wrap="nowrap"
            justifyContent="flex-start"
            alignItems="center"
            className={clsx(classes.rowMiddle, classes.bottomBorder)}
          >
            <Grid>
              <CustomTypography variant="bodySmall">
                Strength of evidence in relationship to ZERO diagnostic platform:
                {' '}
                M = Molecular, I = In Vitro, P = PDX
              </CustomTypography>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
