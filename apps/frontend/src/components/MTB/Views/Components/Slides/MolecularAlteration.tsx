import React, { useState, type JSX } from 'react';
import { Box, IconButton } from '@mui/material';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { makeStyles } from '@mui/styles';
import { ChevronRightIcon } from 'lucide-react';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import CustomTypography from '../../../../Common/Typography';
import mapMutationType from '../../../../../utils/functions/mapMutationType';
import MolecularAlterationDetails from '../Modals/MolecularAlterationDetailsModal';
import { getGeneOrNonGene } from '../../../../../utils/functions/getGeneOrNonGeneBasedAlteration';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#FFFFFF',
    height: '40px',
    border: '1px solid #ECF0F3',
    borderRadius: '8px',
    padding: '8px',
  },
  subtext: {
    color: '#62728C',
    fontSize: '12px',
    lineHeight: 'normal',
  },
  subText2: {
    maxWidth: '123px',
  },
  chevron: {
    width: '20px',
    height: '20px',
    marginRight: '-6px',
  },
}));

interface IMolecularAlteration {
  alteration: IMolecularAlterationDetail;
  isOnSlide?: boolean;
}

export default function MolecularAlteration({
  alteration,
  isOnSlide = true,
}: IMolecularAlteration): JSX.Element {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);

  const canViewAlterationDetails = useIsUserAuthorised('clinical.sample.read');

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="8px"
        className={classes.root}
      >
        <CustomTypography className={classes.subText2} variant="bodyRegular" fontWeight="bold" truncate>
          {getGeneOrNonGene(alteration)}
        </CustomTypography>
        <CustomTypography variant="bodySmall" truncate className={classes.subtext}>
          {mapMutationType(alteration.mutationType)}
        </CustomTypography>
        {canViewAlterationDetails && isOnSlide && (
          <IconButton
            className={classes.chevron}
            onClick={(): void => setOpen(true)}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>
      {isOnSlide && (
        <MolecularAlterationDetails
          open={open}
          setOpen={setOpen}
          alteration={alteration}
        />
      )}
    </>
  );
}
