import {
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  OutlinedInput,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useState, type JSX,
} from 'react';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useClinical } from '@/contexts/ClinicalContext';
import Select from '@/components/Input/Select';
import { reportAsOptions, rnaExpressionOptions, yesNoOptions } from '../../../../../constants/options';
import { boolToStr, strToBool } from '../../../../../utils/functions/bools';
import mapMutationType from '../../../../../utils/functions/mapMutationType';
import CustomButton from '../../../../Common/Button';
import CustomTypography from '../../../../Common/Typography';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';

interface IEditableFields {
  description?: string;
  clinicalAlteration?: string;
  clinicalReportable?: string;
  clinicalTargetable?: boolean;
  clinicalNotes?: string;
  clinicalRnaExpression?: string;
  frequency?: string;
  prognosticFactor?: boolean;
}

const useStyles = makeStyles(() => ({
  dialogRoot: {
    width: '428px',
    borderRadius: 16,

    '& > .MuiDialogTitle-root': {
      padding: 0,
    },
    overflow: 'hidden',
  },
  dialogContent: {
    padding: '16px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  label: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  submitButton: {
    height: '48px',
    width: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  cancelButton: {
    height: '48px',
    width: '100%',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  menu: {
    overflowY: 'auto',
    width: '100%',
    height: '56px',
  },
  footer: {
    padding: '32px 0',
    height: '76px',
    position: 'sticky',
    bottom: '0px',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    minWidth: '68px',
    marginLeft: '8px',
  },
  cancelBtn: {
    minWidth: '84px',
  },
}));

interface IEditModalProps {
  open: boolean;
  closeModal: () => void;
  molAlterationId: string;
  onDataChange: () => void;
  isModalView?: boolean;
  isForNonGeneType?: boolean;
}

export default function AlterationSummaryEditModal({
  open,
  closeModal,
  molAlterationId,
  onDataChange,
  isModalView = false,
  isForNonGeneType,
}: IEditModalProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { clinicalVersion } = useClinical();

  const [molAlteration, setMolAlteration] = useState<IMolecularAlterationDetail>();
  const [editableFields, setEditableFields] = useState<IEditableFields>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const classes = useStyles(editableFields);

  const getMolAlteration = useCallback(async () => {
    const data = await zeroDashSdk.mtb.molAlteration.getMolAlterationById(
      clinicalVersion.id,
      molAlterationId,
    );
    setMolAlteration(data);

    setEditableFields({
      description: data?.description,
      clinicalAlteration: data?.clinicalAlteration,
      clinicalTargetable: data?.clinicalTargetable,
      clinicalNotes: data?.clinicalNotes,
      clinicalReportable: data?.clinicalReportable,
      frequency: data?.frequency,
      prognosticFactor: data?.prognosticFactor,
      ...(!isForNonGeneType
        ? { clinicalRnaExpression: data?.clinicalRnaExpression }
        : {}),
    });
  }, [zeroDashSdk.mtb.molAlteration, clinicalVersion.id, molAlterationId, isForNonGeneType]);

  const updateMolAlteration = async (): Promise<void> => {
    try {
      setIsSaving(true);
      await zeroDashSdk.mtb.molAlteration.updateMolAlteration(
        clinicalVersion.id,
        editableFields,
        molAlterationId,
      );
      setIsSaving(false);
      onDataChange();
      closeModal();
    } catch (error) {
      setIsSaving(false);
      enqueueSnackbar('Could not update details, please try again', { variant: 'error' });
    }
  };

  const handleTextChange = (value: string, key: string): void => {
    setEditableFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    getMolAlteration();
  }, [getMolAlteration]);

  return (
    <Dialog open={open} PaperProps={{ className: classes.dialogRoot }}>
      <DialogTitle>
        <Box
          display="flex"
          flexDirection="row"
          height="76px"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          padding="32px 32px 0 32px"
        >
          <CustomTypography variant="h5" fontWeight="medium">
            {isModalView ? 'Clinical Interpretation' : 'Molecular Summary'}
          </CustomTypography>
          <IconButton onClick={closeModal}>
            <XIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <ScrollableSection style={{ minHeight: '100%', maxHeight: 'calc(100vh - 264px)' }}>
        <Box className={classes.dialogContent}>
          {!isModalView && (
            <CustomTypography variant="titleRegular" fontWeight="bold">
              Clinical Interpretation
            </CustomTypography>
          )}
          <CustomTypography variant="label" className={classes.label}>
            {isForNonGeneType ? 'DESCRIPTION' : 'ALTERATION'}
          </CustomTypography>
          <OutlinedInput
            multiline
            value={
              isForNonGeneType
                ? editableFields?.description
                : editableFields?.clinicalAlteration
              }
            onChange={(e): void => handleTextChange(e.target.value, isForNonGeneType ? 'description' : 'clinicalAlteration')}
            placeholder="Enter description here"
          />
          {!isForNonGeneType && (
            <>
              <CustomTypography variant="label" className={classes.label}>
                RNA EXPRESSION VALUE
              </CustomTypography>
              <Select
                key="rna-exp-value"
                variant="outlined"
                sx={{ height: '40px' }}
                className={classes.menu}
                options={rnaExpressionOptions}
                value={editableFields.clinicalRnaExpression || ''}
                onChange={(e): void => {
                  setEditableFields({
                    ...editableFields,
                    clinicalRnaExpression: e.target.value as string,
                  });
                }}
              />
            </>
          )}
          <CustomTypography variant="label" className={classes.label}>
            FREQUENCY
          </CustomTypography>
          <OutlinedInput
            value={editableFields?.frequency}
            onChange={(e): void => handleTextChange(e.target.value, 'frequency')}
            placeholder="Enter description here"
          />
          <CustomTypography variant="label" className={classes.label}>
            PROGNOSTIC FACTOR
          </CustomTypography>
          <Select
            key="prognostic-factor"
            variant="outlined"
            sx={{ height: '40px' }}
            className={classes.menu}
            options={yesNoOptions}
            value={boolToStr(editableFields?.prognosticFactor)}
            onChange={(e): void => {
              setEditableFields({
                ...editableFields,
                prognosticFactor: strToBool(e.target.value as string) ?? undefined,
              });
            }}
          />
          <CustomTypography variant="label" className={classes.label}>
            REPORT AS
          </CustomTypography>
          <Select
            key="report-as-select-id"
            variant="outlined"
            sx={{ height: '40px' }}
            className={classes.menu}
            options={reportAsOptions}
            value={editableFields.clinicalReportable || ''}
            onChange={(e): void => {
              setEditableFields({
                ...editableFields,
                clinicalReportable: e.target.value as string,
              });
            }}
          />
          <CustomTypography variant="label" className={classes.label}>
            DESCRIPTION
          </CustomTypography>
          <OutlinedInput
            multiline
            value={editableFields?.description}
            onChange={(e): void => handleTextChange(e.target.value, 'description')}
            placeholder="Enter description here"
          />
          <CustomTypography variant="label" className={classes.label}>
            TARGETABLE (Clinical)
          </CustomTypography>
          <Grid container direction="row">
            <Grid size={6}>
              <CustomButton
                variant={editableFields?.clinicalTargetable ? 'bold' : 'subtle'}
                label="Yes"
                fullWidth
                onClick={(): void => {
                  setEditableFields({
                    ...editableFields,
                    clinicalTargetable: true,
                  });
                }}
                sx={{
                  borderRadius: '8px 0px 0px 8px',
                }}
              />
            </Grid>
            <Grid size={6}>
              <CustomButton
                variant={!editableFields?.clinicalTargetable ? 'bold' : 'subtle'}
                label="No"
                fullWidth
                onClick={(): void => {
                  setEditableFields({
                    ...editableFields,
                    clinicalTargetable: false,
                  });
                }}
                sx={{
                  borderRadius: '0px 8px 8px 0px',
                  '&:focus': {
                    border: 'none !important',
                  },
                }}
              />
            </Grid>
          </Grid>
          <CustomTypography variant="label" className={classes.label}>
            COMMENTS
          </CustomTypography>
          <OutlinedInput
            multiline
            value={editableFields?.clinicalNotes}
            onChange={(e): void => handleTextChange(e.target.value, 'clinicalNotes')}
            placeholder="Enter description here"
          />
          {!isModalView && (
            <>
              <Divider
                orientation="horizontal"
                style={{ width: '100%', marginTop: 15, marginBottom: 15 }}
              />
              <CustomTypography variant="titleRegular" fontWeight="bold">
                Curation Data
              </CustomTypography>
              {!isForNonGeneType && (
                <>
                  <CustomTypography variant="label" className={classes.label}>
                    GENE
                  </CustomTypography>
                  <CustomTypography fontWeight="bold">
                    {molAlteration?.gene}
                  </CustomTypography>
                </>
              )}
              <CustomTypography variant="label" className={classes.label}>
                MUTATION TYPE
              </CustomTypography>
              <CustomTypography fontWeight="bold">
                {mapMutationType(molAlteration?.mutationType)}
              </CustomTypography>
              <CustomTypography variant="label" className={classes.label}>
                ALTERATION
              </CustomTypography>
              <CustomTypography truncate fontWeight="bold">
                {molAlteration?.alteration}
              </CustomTypography>

              {isForNonGeneType ? (
                <>
                  <CustomTypography variant="label" className={classes.label}>
                    Description
                  </CustomTypography>
                  <CustomTypography truncate fontWeight="bold">
                    {molAlteration?.description}
                  </CustomTypography>
                </>
              ) : (
                <>
                  <CustomTypography variant="label" className={classes.label}>
                    PATHWAY
                  </CustomTypography>
                  <CustomTypography fontWeight="bold">
                    {molAlteration?.pathway}
                  </CustomTypography>
                </>
              )}
              <CustomTypography variant="label" className={classes.label}>
                CLASSIFICATION (Curation)
              </CustomTypography>
              <CustomTypography fontWeight="bold">
                {molAlteration?.curationClassification || 'Not classified'}
              </CustomTypography>
              <CustomTypography variant="label" className={classes.label}>
                TARGETABLE (Curation)
              </CustomTypography>
              <CustomTypography fontWeight="bold">
                {molAlteration?.curationTargetable ? 'Yes' : 'No'}
              </CustomTypography>
            </>
          )}
        </Box>
      </ScrollableSection>

      <DialogActions className={classes.footer}>
        <Box display="flex" gap="12px">
          <CustomButton
            variant="subtle"
            label="Cancel"
            className={classes.cancelBtn}
            onClick={closeModal}
          />
          <CustomButton
            variant="bold"
            label="Save"
            className={classes.saveBtn}
            onClick={updateMolAlteration}
            loading={isSaving}
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
