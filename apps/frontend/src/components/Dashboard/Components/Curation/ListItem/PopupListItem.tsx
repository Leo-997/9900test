import {
  Box,
  Checkbox,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ReactNode, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import mapEvent from '@/utils/functions/mapEvent';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import CustomTypography from '@/components/Common/Typography';
import { curationStatuses } from '../../../../../constants/Curation/navigation';
import CurationStatusChip from '../../../../Chips/StatusChip';
import Gender from '../../../../VitalStatus/Gender';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  listItem: {
    alignItems: 'center',
    borderBottom: `1px solid ${corePalette.grey50}`,
    minHeight: '30px',
    padding: '16px 0px',
    columnGap: '12px',
    width: 'fit-content',
    backgroundColor: 'white',
  },
  fixedColumns: {
    position: 'sticky',
    paddingLeft: '0',
    left: 0,
    columnGap: '16px',
    backgroundColor: 'inherit',
  },
  fixedColumnsRight: {
    position: 'sticky',
    paddingLeft: '16px',
    right: 0,
    columnGap: '16px',
    backgroundColor: 'inherit',
    minWidth: '180px',
  },
  expedited: {
    backgroundColor: 'rgb(255,251,247)',

    '&:hover': {
      backgroundColor: 'rgba(255, 247, 239, 1)',
    },
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  label: {
    fontSize: 17,
    color: corePalette.offBlack100,
  },
  manifestLabel: {
    fontSize: 15,
    color: corePalette.offBlack100,
    maxWidth: '100%',
  },
  xs: {
    minWidth: '60px',
    width: '3vw',
  },
  sm: {
    minWidth: '130px',
    width: '5vw',
  },
  md: {
    minWidth: '180px',
    width: '8vw',
  },
  lg: {
    minWidth: '586px',
  },
  menu: {

    '& > ul > li': {
      height: '48px',
    },
  },
  dateColumn: {
    display: 'inline',
    borderWidth: '2px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '13px',
    border: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
    borderColor: '#D0D9E2',
  },
  checkboxBox: {
    width: '50px',
    paddingLeft: '8px',
  },
}));

interface IPopupListItemProps {
  data: IAnalysisSet;
  assignedSample: string[];
  addSampleId: (sampleId: string) => void;
  removeSampleId: (sampleId: string) => void;
}

export function PopupListItem({
  data,
  assignedSample,
  addSampleId,
  removeSampleId,
}: IPopupListItemProps): JSX.Element {
  const classes = useStyles();

  const {
    analysisSetId,
    patientId,
    vitalStatus,
    gender,
    zero2FinalDiagnosis,
    expedite,
    curationStatus,
  } = data;

  const [checked, setChecked] = useState<boolean>(assignedSample?.includes(analysisSetId));

  const setCurationStatusTag = (): ReactNode => (
    <CurationStatusChip
      {...curationStatuses[curationStatus].chipProps}
      maxWidth="fit-content"
    />
  );

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      addSampleId(analysisSetId);
    } else {
      removeSampleId(analysisSetId);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      className={
          clsx(
            classes.listItem,
            { [classes.expedited]: expedite },
          )
        }
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.fixedColumns}
      >
        <Box display="flex" className={classes.checkboxBox}>
          <Checkbox
            checked={checked}
            onChange={handleChecked}
          />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          width="180px"
        >
          <Link
            className={classes.link}
            to={`/${patientId}/${analysisSetId}/curation`}
          >
            <Box display="flex" gap="8px">
              <CustomTypography variant="bodyRegular" fontWeight="bold" truncate>
                {patientId}
              </CustomTypography>
              {vitalStatus && (
                <CustomTypography display="inline" tooltipText={vitalStatus}>
                  <Gender vitalStatus={vitalStatus} gender={gender} />
                </CustomTypography>
              )}
            </Box>
          </Link>
          <Box display="flex">
            <CustomTypography display="inline" className={classes.label}>
              Event:
              {' '}
              {mapEvent(data.sequencedEvent, true)}
            </CustomTypography>
          </Box>
        </Box>
        <Box
          display="flex"
          gap="8px"
          minWidth="130px"
          flexDirection="column"
        >
          {data.expedite && (
            <CustomTypography variant="bodyRegular">
              <CurationStatusChip
                status="Expedite"
                backgroundColor="#FCD7B1"
                color="#E36D00"
              />
            </CustomTypography>
          )}
          {setCurationStatusTag()}
        </Box>
      </Box>
      <Box
        display="flex"
        className={classes.lg}
      >
        <CustomTypography variant="bodyRegular" truncate>
          {zero2FinalDiagnosis || '-'}
        </CustomTypography>
      </Box>
    </Box>
  );
}
