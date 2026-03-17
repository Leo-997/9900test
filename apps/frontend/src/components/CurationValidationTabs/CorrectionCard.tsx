import { Box, Divider, IconButton } from '@mui/material';
import { useEffect, useState, type JSX } from 'react';

import { correctionReasonOptions } from '@/constants/corrections';
import { corePalette } from '@/themes/colours';
import { ISampleCorrectionFlag } from '@/types/Corrections.types';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { CircleCheckBigIcon, InfoIcon } from 'lucide-react';
import CustomTypography from '../Common/Typography';
import ResolveFlagModal from '../CorrectionFlag/ResolveFlagModal';
import CollapseInfo from './CollapseInfo';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IUser } from '../../types/Auth/User.types';

type Props = {
  correction: ISampleCorrectionFlag;
};

const useStyles = makeStyles(() => ({
  root: {
    padding: 26,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  hairline: {
    border: 'none',
    width: '100%',
    margin: 0,
  },
  icon: {
    padding: 0,
    marginLeft: 5,
  },
}));

export default function CorrectionCard({
  correction,
}: Props): JSX.Element {
  const classes = useStyles(correction);
  const zeroDashSdk = useZeroDashSdk();

  const [open, setOpen] = useState<boolean>(false);
  const [correctedBy, setCorrectedBy] = useState<IUser>();

  const {
    reason,
    reasonNote,
    isCorrected,
    correctedById,
    correctionNote,
    correctedAt,
  } = correction;

  useEffect(() => {
    if (correctedById) {
      zeroDashSdk.services.auth.getUserById(correctedById)
        .then((resp) => {
          setCorrectedBy(resp);
        });
    }
  }, [correctedById, zeroDashSdk.services.auth]);

  return (
    <div className={classes.root}>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box display="flex" flexDirection="column">
          <CustomTypography variant="label">
            REASON
          </CustomTypography>
          <CustomTypography
            variant="titleSmall"
            fontWeight="medium"
            onClick={(): void => {
              if (!correction.isCorrected) {
                setOpen(true);
              }
            }}
          >
            {correctionReasonOptions.find((o) => o.value === reason)?.name}
          </CustomTypography>
        </Box>
        {isCorrected ? (
          <div style={{ paddingRight: 8 }}>
            <CircleCheckBigIcon fill={corePalette.blank} stroke={corePalette.green150} />
          </div>
        ) : (
          <IconButton
            style={{ padding: 8 }}
            onClick={(): void => {
              setOpen(true);
            }}
          >
            <InfoIcon fill={corePalette.orange100} stroke={corePalette.white} />
          </IconButton>
        )}
      </div>
      {reasonNote && <CollapseInfo reasonNote={reasonNote} />}
      {isCorrected && (
        <div>
          <CustomTypography variant="titleSmall" fontWeight="medium">
            Corrected
          </CustomTypography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <CustomTypography variant="bodySmall">
              by
              {' '}
              {correctedBy && `${correctedBy?.givenName} ${correctedBy?.familyName}`}
            </CustomTypography>
            {correctedAt && (
              <CustomTypography variant="bodySmall">
                {dayjs(correctedAt).format('DD/MM/YYYY, h:mm a')}
              </CustomTypography>
            )}
          </div>
          {correctionNote && <CollapseInfo reasonNote={correctionNote} />}
        </div>
      )}
      <Divider />
      {open && (
        <ResolveFlagModal
          correction={correction}
          open={open}
          onClose={(): void => {
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
