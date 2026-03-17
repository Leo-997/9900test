import {
  Box, IconButton, Table, TableBody, TableContainer, TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { makeStyles } from '@mui/styles';
import { Trash2Icon } from 'lucide-react';
import CustomModal from '@/components/Common/CustomModal';
import { useState, type JSX } from 'react';
import CustomTypography from '../../../../Common/Typography';
import { ClinicalInformationField } from '../../../../../types/MTB/ClinicalInfo.types';
import ClinicalInformationRow from './ClinicalInformationRow';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import DataTable from '../../../../../layouts/Tables/DataTable';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  },
  hideButton: {
    visibility: 'hidden',
    opacity: 0,
    padding: '8px',
    transition: 'all cubic-bezier(.19,1,.22,1) 0.6s',
  },
  icon: {
    width: '36px',
    height: '36px',
    color: '#022034',
    marginLeft: 'auto',
  },
  title: {
    width: '100%',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& input:disabled': {
      color: '#022034',
    },
  },
  titleText: {
    fontSize: '24px',
  },
}));

interface IProps {
  isPresentationMode: boolean;
}

export default function ClinicalInformationSection({
  isPresentationMode,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    clinicalInfo,
    setClinicalInfo,
  } = useActiveSlide();

  const canEditGermlineSection = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const deleteClinicalInformation = async (): Promise<void> => {
    if (slide) {
      try {
        await zeroDashSdk.mtb.clinicalInfo.deleteClinicalInformation(
          clinicalVersion.id,
          slide.id,
        );
        setClinicalInfo(undefined);
      } catch (err) {
        enqueueSnackbar('Could not delete clinical information, please try again', { variant: 'error' });
      }
    }
  };

  const getContent = (): JSX.Element => {
    if (isPresentationMode && clinicalInfo) {
      return (
        <DataTable
          rows={
            Object.entries(clinicalInfo)
              .filter(([, val]) => !val.isHidden)
              .map(([key, val]) => ({
                cells: [
                  {
                    content: key,
                    align: 'flex-start',
                  },
                  {
                    content: `${val.value}${val.note ? ` - ${val.note}` : ''}`,
                    align: 'flex-start',
                  },
                ],
              }))
          }
        />
      );
    }

    return (
      <TableContainer>
        <TableBody>
          <Table>
            {clinicalInfo && Object.entries(clinicalInfo).map(([key, val]) => (
              <ClinicalInformationRow
                key={key}
                label={key as ClinicalInformationField}
                row={val}
                clinicalInfo={clinicalInfo}
              />
            ))}
          </Table>
        </TableBody>
      </TableContainer>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="8px"
      className={classes.root}
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="10px"
      >
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
        >
          {!isPresentationMode && (
          <CustomTypography variant="label" style={{ color: '#022034' }}>
            Section Name
          </CustomTypography>
          )}
          {isPresentationMode ? (
            <CustomTypography variant="titleRegular" fontWeight="medium">
              Clinical Information
            </CustomTypography>
          ) : (
            <TextField
              disabled
              variant="standard"
              value="Clinical Information"
              className={classes.title}
              InputProps={{
                classes: {
                  input: classes.titleText,
                },
              }}
            />
          )}
        </Box>
        {!isPresentationMode && (
          <IconButton
            disabled={!canEditGermlineSection}
            className={classes.icon}
            onClick={(): void => setDeleteModalOpen(true)}
          >
            <Trash2Icon />
          </IconButton>
        )}
      </Box>
      {getContent()}
      {deleteModalOpen && (
        <CustomModal
          title="Delete section"
          content={'Are you sure you want to remove this section?\nThis action cannot be undone.'}
          open={deleteModalOpen}
          onClose={(): void => setDeleteModalOpen(false)}
          variant="alert"
          buttonText={{
            cancel: 'No, don\'t delete',
            confirm: 'Yes, delete',
          }}
          onConfirm={deleteClinicalInformation}
        />
      )}
    </Box>
  );
}
