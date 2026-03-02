import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import {
  Box,
  Dialog as MuiDialog,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import {
  IMolecularAlterationDetail,
  IMolSelectedRow,
} from '../../../../../types/MTB/MolecularAlteration.types';
import CustomTypography from '../../../../Common/Typography';
import NavBar from '../../../NavBar/Modal/NavBar';
import ModalHeader from './Components/MolecularAlterationDetails/ModalHeader';
import MolAlterationDetailSamplePanel from './Components/SamplePanel/MolAlterationDetailSamplePanel';

const Dialog = styled(MuiDialog)({
  '& .MuiDialog-paper': {
    width: '100vw',
    maxWidth: '100vw',
    height: '100vh',
    maxHeight: '100vh',
    position: 'fixed',
    top: '0',
    left: '0',
    margin: '0',
    borderRadius: '0',
    overflowY: 'hidden',
  },
});

const useStyles = makeStyles(() => ({
  root: {
    width: '100vw',
    maxWidth: '100vw',
    height: '100vh',
    maxHeight: '100vh',
    position: 'fixed',
    top: '0',
    left: '0',
    margin: '0',
    borderRadius: '0',
    overflowY: 'hidden',
  },
  snvChip: {
    height: '40px',
    borderRadius: '4px',
    backgroundColor: '#F0F4F7',
    padding: '8px 16px',
  },
}));

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  alteration: IMolecularAlterationDetail;
}

export default function MolecularAlterationDetails({
  open,
  setOpen,
  alteration,
}: IProps): JSX.Element {
  const classes = useStyles();
  const {
    slide,
  } = useActiveSlide();
  const { clinicalVersion } = useClinical();
  const [selectedRow, setSelectedRow] = useState<IMolSelectedRow>({
    molId: '',
    groupId: '',
    isCurrentSample: false,
  });

  useEffect(() => {
    if (slide && slide.molAlterationGroupId) {
      setSelectedRow({
        molId: alteration.id,
        groupId: slide?.molAlterationGroupId,
        isCurrentSample: true,
      });
    }
  }, [alteration.id, slide]);

  const getHGVSTitle = (): JSX.Element => {
    if (!alteration.mutationType.includes('SNV')) return <div />;

    const content: string = alteration.additionalData && alteration.additionalData.hgvs
      ? alteration.additionalData.hgvs as string
      : '-';

    return (
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        className={classes.snvChip}
      >
        <CustomTypography variant="label">HGVS</CustomTypography>
        <CustomTypography
          variant="bodyRegular"
          truncate
          style={{ marginLeft: '5px', maxWidth: '300px' }}
        >
          {content}
        </CustomTypography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        className: classes.root,
      }}
    >
      <NavBar
        returnTo={slide?.title}
        status={clinicalVersion.status}
        returnFn={(): void => setOpen(false)}
      />
      <ModalHeader
        alteration={alteration}
        title={getHGVSTitle()}
      />
      <MolAlterationDetailSamplePanel selectedMolRow={selectedRow} />
    </Dialog>
  );
}
