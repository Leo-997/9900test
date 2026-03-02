import { useEffect, useState, type JSX } from 'react';

import { IconButton, Paper } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';

import clsx from 'clsx';
import { XIcon } from 'lucide-react';
import CustomTypography from '../Common/Typography';
import { useCuration } from '../../contexts/CurationContext';

export type FlagStatus =
  | 'NO_FLAGS_YET'
  | 'FLAGS_NOT_CORRECTED'
  | 'FLAGS_ALL_CORRECTED'
  | undefined;

const useStyles = makeStyles(() => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    backgroundColor: '#F3F7FF',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#B5DAFF',
    paddingLeft: 24,
    margin: 8,
    marginBottom: 0,
    marginTop: 0,
  },
  pendingFlagsBg: {
    backgroundColor: '#FFF7EF',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E36D00',
  },
  noPendingFlagsBg: {
    backgroundColor: '#E0FFEF',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#00AB59',
  },
  title: {
    color: '#022034',
  },
}));

interface IProps {
  background?: boolean;
}

export default function ValidationStatusBanner({
  background = false,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { correctionFlags, curationStatus } = useCuration();

  const [status, setStatus] = useState<FlagStatus>();
  const [notificationClosed, setNotificationClosed] = useState<boolean>(false);

  const getBannerText = (): string => {
    switch (status) {
      case 'NO_FLAGS_YET':
        return 'Validate the contamination, purity, ploidy and purple QC metrics are correct before being able to start the main curation.';
      case 'FLAGS_ALL_CORRECTED':
        return 'Sample status: Corrections completed. Verify the data provided in the patient profile and QC tabs is correct before starting the main curation.';
      case 'FLAGS_NOT_CORRECTED':
        return 'Sample status: Under review. (This sample has been flagged for correction)';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (correctionFlags.length === 0 && curationStatus?.status === 'Ready to Start') {
      setStatus('NO_FLAGS_YET');
    } else if (correctionFlags.length === 0) {
      setStatus(undefined);
    } else if (correctionFlags.length !== correctionFlags.filter((c) => c.isCorrected).length) {
      setStatus('FLAGS_NOT_CORRECTED');
    } else {
      setStatus('FLAGS_ALL_CORRECTED');
    }
  }, [correctionFlags, curationStatus?.status]);

  return (
    status && !notificationClosed ? (
      <div style={{
        backgroundColor: background ? '#FFF' : '#F3F5F7',
        paddingBottom: background ? 4 : 8,
        paddingTop: 8,
      }}
      >
        <Paper
          className={clsx({
            [classes.root]: true,
            [classes.noPendingFlagsBg]: status === 'FLAGS_ALL_CORRECTED',
            [classes.pendingFlagsBg]: status === 'FLAGS_NOT_CORRECTED',
          })}
          elevation={0}
        >
          <CustomTypography variant="bodyRegular" className={classes.title}>
            {getBannerText()}
          </CustomTypography>
          <IconButton onClick={(): void => setNotificationClosed(true)}>
            <XIcon />
          </IconButton>
        </Paper>
      </div>
    ) : (
      <div />
    )
  );
}
