import { useState, type JSX } from 'react';
import {
  Box,
  IconButton,
  styled,
  TableCell as MuiTableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { makeStyles } from '@mui/styles';
import { EyeOffIcon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { ClinicalInformationData, ClinicalInformationField, IClinicalInformation } from '../../../../../types/MTB/ClinicalInfo.types';
import CustomTypography from '../../../../Common/Typography';
import Select from '../../../../Input/Select';
import OutlinedTextInput from '../../../../Input/OutlinedTextInput';
import { clinicalInfoOptions } from '../../../../../constants/clinicalInfo';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';

const TableCell = styled(MuiTableCell)({
  padding: '4px 0 4px 16px',
  borderBottom: 'none',
});

const useStyles = makeStyles(() => ({
  row: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& #hide-row-button': {
        visibility: 'visible',
        opacity: 1,
      },
    },
    backgroundColor: '#FFFFFF',
    width: 'fit-content',
    minWidth: '100%',
  },
  menu: {
    overflowY: 'auto',
    width: '100%',
    height: '40px',
  },
}));

interface IProps {
  label: ClinicalInformationField;
  row: IClinicalInformation;
  clinicalInfo: ClinicalInformationData;
}

export default function ClinicalInformationRow({
  label,
  row,
  clinicalInfo,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    clinicalVersion,
    isReadOnly,
    isPresentationMode,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    setClinicalInfo,
  } = useActiveSlide();

  const [text, setText] = useState<string>(row.note);

  const canEditGermlineFindings = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const updateRowData = async (key: keyof IClinicalInformation, val: string): Promise<void> => {
    if (slide) {
      try {
        await zeroDashSdk.mtb.clinicalInfo.updateClinicalInformation(
          clinicalVersion.id,
          slide.id,
          {
            ...clinicalInfo,
            [label]: {
              ...clinicalInfo[label],
              [key]: val,
            },
          },
        );

        setClinicalInfo((prev) => {
          if (prev) {
            return {
              ...prev,
              [label]: {
                ...prev[label],
                [key]: val,
              },
            };
          }

          return prev;
        });
      } catch (err) {
        enqueueSnackbar('Could not update clinical information, please try again', { variant: 'error' });
      }
    }
  };

  const updateHiddenRow = async (): Promise<void> => {
    if (slide) {
      try {
        await zeroDashSdk.mtb.clinicalInfo.updateClinicalInformation(
          clinicalVersion.id,
          slide.id,
          {
            ...clinicalInfo,
            [label]: {
              ...clinicalInfo[label],
              isHidden: !row.isHidden,
            },
          },
        );

        setClinicalInfo((prev) => {
          if (prev) {
            return {
              ...prev,
              [label]: {
                ...prev[label],
                isHidden: !row.isHidden,
              },
            };
          }

          return prev;
        });
      } catch (err) {
        enqueueSnackbar('Could not update visibility, please try again', { variant: 'error' });
      }
    }
  };

  return (
    <TableRow
      className={clsx({
        [classes.row]: canEditGermlineFindings && !isPresentationMode,
      })}
    >
      <TableCell
        style={{
          minWidth: '45px',
          maxWidth: '45px',
          paddingRight: 0,
        }}
      >
        <Tooltip
          title={`${row.isHidden ? 'Display' : 'Hide'} row in presentation mode`}
          placement="top"
        >
          <Box
            minWidth="45px"
            flex="unset"
          >
            <IconButton
              id="hide-row-button"
              onClick={updateHiddenRow}
              sx={{
                color: corePalette.grey200,
                opacity: row.isHidden ? 1 : 0,
                visibility: row.isHidden ? 'visible' : 'hidden',
                transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
              }}
            >
              <EyeOffIcon />
            </IconButton>
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell
        style={{
          minWidth: '310px',
          maxWidth: '310px',
        }}
      >
        <CustomTypography variant="bodyRegular">
          {label}
        </CustomTypography>
      </TableCell>
      <TableCell
        style={{
          minWidth: '100px',
          maxWidth: '160px',
        }}
      >
        <Select
          key={`${label}-val`}
          disabled={!canEditGermlineFindings || isPresentationMode}
          variant="outlined"
          className={classes.menu}
          options={clinicalInfoOptions}
          value={row.value}
          onChange={(e): Promise<void> => updateRowData('value', e.target.value as string)}
        />
      </TableCell>
      <TableCell
        style={{
          width: '80vw',
          minWidth: '440px',
        }}
      >
        <OutlinedTextInput
          multiline
          disabled={!canEditGermlineFindings || isPresentationMode}
          value={text}
          placeholder="Additional notes"
          sx={{
            minWidth: '200px',
            width: '100%',
            minHeight: '40px',
            height: '100%',
            padding: '8px 14px',
          }}
          onBlur={(e): Promise<void> => updateRowData('note', e.target.value)}
          onChange={(e): void => setText(e.target.value)}
        />
      </TableCell>
    </TableRow>
  );
}
