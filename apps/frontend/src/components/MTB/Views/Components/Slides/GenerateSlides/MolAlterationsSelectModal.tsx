import CustomButton from '@/components/Common/Button';
import CustomModal from '@/components/Common/CustomModal';
import { corePalette } from '@/themes/colours';
import { Box, Table, TableBody } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { IMolAltSelectModalColumn, IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import {
  assignRelevantTypeAlterations,
  INonGeneTypeAlterationsObject,
} from '../../../../../../utils/functions/assignRelevantAlterations';
import LoadingAnimation from '../../../../../Animations/LoadingAnimation';
import CustomTypography from '../../../../../Common/Typography';
import { MolAlterationsSelectModalHeader } from './MolAlterationsSelectModalHeader';
import { MolAlterationsSelectModalListItem } from './MolAlterationsSelectModalListItem';
import { MethylationAlterationGroup } from './NonGenesAlterations/MethylationAlterationGroup';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    position: 'absolute',
    minWidth: '832px',
    minHeight: '628px',
    background: '#FFFFFF',
    boxShadow: '0px 16px 32px rgba(18, 47, 92, 0.16)',
    borderRadius: '8px',
    overflowY: 'visible',
    maxHeight: 'calc(100vh - 80px)',
  },
  dialogHeader: {
    padding: '24px',
    gap: '8px',
    width: '832px',
    height: '116px',
    background: '#F3F5F7',
    borderRadius: '8px 8px 0px 0px',
  },
  dialogContent: {
    padding: '24px',
    minWidth: '832px',
    minHeight: '432px',
    gap: '16px',
  },
  scrollListBox: {
    padding: '0px',
    width: '784px',
    height: '280px',
    backgroundColor: 'white',
  },
  action: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px',
    gap: '16px',
    width: '169px',
    height: '48px',
  },
}));

const geneColumnSettings: IMolAltSelectModalColumn[] = [
  {
    label: 'Gene/Cytogenetics',
    key: 'gene',
    width: '160px',
  },
  {
    label: 'Alteration',
    key: 'clinicalAlteration',
    width: '280px',
  },
  {
    label: 'RNA Expression',
    key: 'clinicalRnaExpression',
    width: '140px',
  },
  {
    label: 'Targetable',
    key: 'clinicalTargetable',
    width: '70px',
  },
];

const noneGeneColumnSettings: IMolAltSelectModalColumn[] = [
  {
    label: 'Classifier',
    key: 'alteration',
    width: '200px',
  },
  {
    label: 'Description',
    key: 'description',
    width: '280px',
  },
  {
    label: 'Targetable',
    key: 'clinicalTargetable',
    width: '70px',
  },
];

const profileColumnSettings: IMolAltSelectModalColumn[] = [
  {
    label: 'Profile Name',
    key: 'mutationType',
    width: '200px',
  },
  {
    label: 'Description',
    key: 'description',
    width: '280px',
  },
];

interface IProps {
  open: boolean;
  onClose: () => void;
  onSave: (alterations?: IMolecularAlterationDetail[]) => void;
  alterations?: IMolecularAlterationDetail[];
  isNewSlide?: boolean;
}

export default function MolAlterationsSelectModal({
  open,
  onClose,
  onSave,
  alterations,
  isNewSlide,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [molAlterations, setMolAlterations] = useState< IMolecularAlterationDetail[]>([]);
  const [geneTypeAlterations, setGeneTypeAlterations] = useState<IMolecularAlterationDetail[]>([]);
  const [
    selectedMolAlterations,
    setSelectedMolAlterations,
  ] = useState<IMolecularAlterationDetail[]>([]);

  const [
    nonGeneTypeAlterations,
    setNonGeneTypeAlterations,
  ] = useState<INonGeneTypeAlterationsObject>({
    sortedMethylationAlterations: [],
    sortedMutationalSignature: [],
    sortedRnaClassifierAlterations: [],
  });

  const getMolAlterations = useCallback(async () => {
    try {
      if (clinicalVersion.id) {
        setIsLoading(true);
        const data = await zeroDashSdk.mtb.molAlteration.getMolAlterations(
          clinicalVersion.id,
          {},
        );
        setMolAlterations(data);
      }
    } catch (error) {
      enqueueSnackbar('Could not fetch alterations, please try again', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [clinicalVersion.id, enqueueSnackbar, zeroDashSdk.mtb.molAlteration]);

  const isChecked = (data: IMolecularAlterationDetail): boolean => (
    selectedMolAlterations.some((a) => (a.id === data.id))
  );

  const onCloseDialog = (): void => {
    setSelectedMolAlterations([]);
    onClose();
  };

  const handleOnChangeAlteration = (
    alteration: IMolecularAlterationDetail,
  ): void => {
    if (isChecked(alteration)) {
      setSelectedMolAlterations((prev) => prev.filter((a) => a.id !== alteration.id));
    } else {
      setSelectedMolAlterations((prev) => [...prev, alteration]);
    }
  };

  useEffect(() => {
    getMolAlterations();
  }, [clinicalVersion, getMolAlterations]);

  useEffect(() => {
    if (!isNewSlide && alterations) setSelectedMolAlterations(alterations);
  }, [alterations, isNewSlide]);

  useEffect(() => {
    const sortAlterations = (
      a: IMolecularAlterationDetail,
      b: IMolecularAlterationDetail,
    ): number => {
      const aOrder = a.summaryOrder || 0;
      const bOrder = b.summaryOrder || 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Push targetable alterations to the top
      if (a.clinicalTargetable === b.clinicalTargetable) return 0;
      if (a.clinicalTargetable) return -1;
      return 1;
    };

    const getRelevantAlterations = ((allAlterations: IMolecularAlterationDetail[]): void => {
      const {
        geneAndCytoAlterations,
        nonGeneAlterationsObject,
      } = assignRelevantTypeAlterations(allAlterations);

      setGeneTypeAlterations(geneAndCytoAlterations.sort(sortAlterations));
      setNonGeneTypeAlterations({
        sortedMethylationAlterations:
          nonGeneAlterationsObject.sortedMethylationAlterations,
        sortedMutationalSignature:
          nonGeneAlterationsObject.sortedMutationalSignature.sort(sortAlterations),
        sortedRnaClassifierAlterations:
          nonGeneAlterationsObject.sortedRnaClassifierAlterations.sort(sortAlterations),
      });
    });

    getRelevantAlterations(molAlterations);
  }, [molAlterations]);

  return (
    <CustomModal
      open={open}
      onClose={onCloseDialog}
      title={(
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
        >
          <CustomTypography variant="titleRegular" fontWeight="medium">
            Select molecular alterations
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey100}>
            Select the relevant molecular alterations
          </CustomTypography>
        </Box>
      )}
      content={isLoading ? (
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <LoadingAnimation />
        </div>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          className={classes.dialogContent}
        >
          {/* IPASS and tumour mutational burden */}
          <Table>
            <MolAlterationsSelectModalHeader columnSettings={profileColumnSettings} />
            <TableBody>
              {molAlterations
                .filter((item) => item.mutationType === 'TMB' || item.mutationType === 'IPASS')
                .map((item) => (
                  <MolAlterationsSelectModalListItem
                    key={item.id}
                    data={item}
                    isChecked={isChecked(item)}
                    handleOnChangeAlteration={handleOnChangeAlteration}
                    columnSettings={profileColumnSettings}
                  />
                ))}
            </TableBody>
          </Table>
          {/* Gene type alterations */}
          <Table>
            <MolAlterationsSelectModalHeader columnSettings={geneColumnSettings} />
            <TableBody>
              {geneTypeAlterations.map((item) => (
                <MolAlterationsSelectModalListItem
                  key={item.id}
                  data={item}
                  isChecked={isChecked(item)}
                  handleOnChangeAlteration={handleOnChangeAlteration}
                  columnSettings={geneColumnSettings}
                />
              ))}
            </TableBody>
          </Table>
          {/* Non Gene type alterations */}
          <Table>
            <MolAlterationsSelectModalHeader columnSettings={noneGeneColumnSettings} />
            <TableBody>
              <MethylationAlterationGroup
                methylationAlterations={nonGeneTypeAlterations.sortedMethylationAlterations}
                handleOnChangeAlteration={handleOnChangeAlteration}
                setSelectedMolAlterations={setSelectedMolAlterations}
                isChecked={isChecked}
                columnSettings={noneGeneColumnSettings}
                selectedMolAlterations={selectedMolAlterations}
              />
              {nonGeneTypeAlterations.sortedRnaClassifierAlterations.map((item) => (
                <MolAlterationsSelectModalListItem
                  key={item.id}
                  data={item}
                  isChecked={isChecked(item)}
                  handleOnChangeAlteration={handleOnChangeAlteration}
                  columnSettings={noneGeneColumnSettings}
                />
              ))}
              {nonGeneTypeAlterations.sortedMutationalSignature.map((item) => (
                <MolAlterationsSelectModalListItem
                  key={item.id}
                  data={item}
                  isChecked={isChecked(item)}
                  handleOnChangeAlteration={handleOnChangeAlteration}
                  columnSettings={noneGeneColumnSettings}
                />
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      overrideActions={(
        <Box className={classes.action}>
          <CustomButton
            variant="warning"
            label="Cancel"
            onClick={onCloseDialog}
            style={{ marginRight: 'auto' }}
          />
          {isNewSlide && (
            <CustomButton
              variant="subtle"
              label="Create blank slide"
              onClick={(): void => onSave()}
              disabled={selectedMolAlterations.length > 0}
            />
          )}
          <CustomButton
            variant="bold"
            label={isNewSlide ? 'Create' : 'Save'}
            onClick={(): void => onSave(selectedMolAlterations)}
            disabled={selectedMolAlterations.length === 0}
          />
        </Box>
      )}
    />
  );
}
