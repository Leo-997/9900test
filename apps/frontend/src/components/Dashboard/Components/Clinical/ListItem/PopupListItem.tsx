import CustomTypography from '@/components/Common/Typography';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import {
  Box, Checkbox,
  TableCell, TableRow,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ClockAlertIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { ClinicalMeetingType } from '@/types/Meetings/Meetings.types';
import { clinicalStatuses } from '../../../../../constants/MTB/navigation';
import { IClinicalDashboardSample } from '../../../../../types/Dashboard.types';
import { IChipProps } from '../../../../../types/Samples/Sample.types';
import mapEvent from '../../../../../utils/functions/mapEvent';
import StatusChip from '../../../../Chips/StatusChip';

const useStyles = makeStyles(() => ({
  patientBlock: {
    width: '100%',
    minWidth: 'fit-content',
    height: '100%',
    margin: '2px 0 16px 2px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 0.5px 2px rgba(96, 97, 112, 0.16), 0px 0px 1px rgba(40, 41, 61, 0.08)',
  },
  rowItem: {
    height: '52px',
    backgroundColor: '#FFFFFF',
    border: 'none',
    padding: 0,
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  expediteChip: {
    paddingBottom: '0',
  },
  dateChip: {
    display: 'inline',
    border: '1px solid #D0D9E2',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '13px',
    paddingLeft: 5,
    paddingRight: 5,
  },
  userBtn: {
    width: '36px',
    height: '36px',
  },
  stickyLeft: {
    position: 'sticky',
    left: 0,
  },
  stickyRight: {
    position: 'sticky',
    right: 0,
  },
  checkbox: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&.Mui-checked': {
      color: '#1E86FC',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '&.Mui-disabled': {
        color: 'rgba(30, 134, 252, 0.26)',
      },
    },
    color: '#273957',
  },
}));

interface IProps {
  date: string;
  data: IClinicalDashboardSample;
  selectedCases: string[];
  setSelectedCases: Dispatch<SetStateAction<string[]>>;
  clinicalMeetingType: ClinicalMeetingType;
}

export default function PopupListItem({
  date,
  data,
  selectedCases,
  setSelectedCases,
  clinicalMeetingType,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const {
    patientId,
    clinicalVersionId,
    analysisSetId,
    zero2FinalDiagnosis,
    expedite,
    clinicalStatus,
  } = data;

  const meetingRecordDate = data.meetings
    .find((r) => r.type === clinicalMeetingType)?.date;

  const [analysisSet, setAnalysisSet] = useState<IAnalysisSet>();

  const primaryBiosample = useMemo(() => getPrimaryBiosample(
    analysisSet?.biosamples || [],
  ), [analysisSet]);

  const setClinicalStatusTooltip = (chip: IChipProps): string => {
    let tooltipPrefix = '';

    if (chip.status.includes('Addendum') && data.addendums.length > 0) {
      tooltipPrefix = data.addendums[0].addendumType === 'hts' // Check most recent addendum
        ? 'HTS '
        : 'General ';
    }

    return tooltipPrefix + (chip.tooltipText || '').replace('Addendum', 'addendum');
  };

  const setClinicalStatusTag = (): JSX.Element[] | undefined => {
    const { chips } = clinicalStatuses[clinicalStatus];

    if (chips) {
      return (
        chips.map((chip) => (
          <StatusChip
            {...chip.chipProps}
            tooltipText={setClinicalStatusTooltip(chip.chipProps)}
            maxWidth="calc(100% - 10px)"
          />
        ))
      );
    }

    return undefined;
  };

  const handleCheckboxChange = (checked: boolean): void => {
    setSelectedCases((prev) => {
      if (checked) {
        return [
          ...prev,
          clinicalVersionId,
        ];
      }
      return prev.filter((c) => c !== clinicalVersionId);
    });
  };

  useEffect(() => {
    if (date && dayjs(meetingRecordDate).isSame(dayjs(date), 'day')) {
      setSelectedCases((prev) => [...prev, clinicalVersionId]);
    }
  }, [clinicalMeetingType, clinicalVersionId, data, date, meetingRecordDate, setSelectedCases]);

  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getAnalysisSetById(
      analysisSetId,
    )
      .then((resp) => (
        setAnalysisSet(resp)
      ));
  }, [analysisSetId, zeroDashSdk.curation.analysisSets]);

  return (
    <TableRow>
      <TableCell className={classes.rowItem} style={{ width: '48px' }}>
        <Box
          width="48px"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
        >
          <Checkbox
            classes={{
              root: classes.checkbox,
            }}
            checked={selectedCases.includes(clinicalVersionId)}
            disabled={dayjs(meetingRecordDate).isSame(dayjs(date), 'day')}
            onChange={(e, checked): void => handleCheckboxChange(checked)}
          />
        </Box>
      </TableCell>
      <TableCell
        className={clsx(classes.rowItem, classes.stickyLeft)}
        component="th"
        scope="row"
        style={{ width: '360px', borderRadius: '0 0 0 4px' }}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Box
            width="32px"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            {Boolean(expedite) && (
              <Tooltip
                title="This case is expedited"
                placement="right"
              >
                <ClockAlertIcon color={corePalette.orange100} />
              </Tooltip>
            )}
          </Box>
          <Link
            className={classes.link}
            to={`/${patientId}/${analysisSetId}/clinical/${clinicalVersionId}/mtb/OVERVIEW`}
          >
            <CustomTypography truncate variant="bodyRegular">
              {primaryBiosample?.biosampleId ?? patientId}
            </CustomTypography>
          </Link>
        </Box>
      </TableCell>
      <TableCell className={classes.rowItem} style={{ width: '155px' }}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          gap="4px"
        >
          {setClinicalStatusTag()}
        </Box>
      </TableCell>
      <TableCell className={classes.rowItem} style={{ width: '150px' }}>
        <CustomTypography variant="bodyRegular">
          {mapEvent(analysisSet?.sequencedEvent || '-', true)}
        </CustomTypography>
      </TableCell>
      <TableCell className={classes.rowItem} style={{ width: '336px' }}>
        <CustomTypography variant="bodyRegular">
          {zero2FinalDiagnosis}
        </CustomTypography>
      </TableCell>
    </TableRow>
  );
}
