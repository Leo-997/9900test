import { Box, Tooltip, lighten } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../../../../Common/Typography';
import { IArchiveSample } from '../../../../../types/MTB/Archive.types';
import AlterationChip from '../../../../Chips/AlterationChip';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#FFFFFF',
    // the behaviour of the transition is jittery without this
    border: '1px solid #FFFFFF',
    padding: '16px',
    gap: '12px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: '8px',
    marginTop: '4px',
    transition: 'all 0.7s cubic-bezier(.19, 1, .22, 1)',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      cursor: 'pointer',
    },
  },
  rootSelected: {
    backgroundColor: lighten(corePalette.green10, 0.5),
    border: `1px solid ${corePalette.green150}`,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
  },
  alterationChipRed: {
    backgroundColor: '#FEE0E9',
    borderColor: '#B00047',
  },
  alterationChipGreen: {
    backgroundColor: '#D1FCE6',
    borderColor: '#015831',
  },
}));

interface IProps {
  sample: IArchiveSample;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function ArchiveSampleListItem({
  sample,
  isSelected = false,
  onSelect,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      className={clsx({
        [classes.root]: true,
        [classes.rootSelected]: isSelected,
      })}
      onClick={onSelect}
    >
      <Box className={classes.item} flex={1} minWidth="185px">
        <CustomTypography variant="label">
          Patient ID
        </CustomTypography>
        <CustomTypography truncate>
          {sample.patientId}
        </CustomTypography>
      </Box>
      <Box className={classes.item} flex={1} minWidth="120px">
        <CustomTypography variant="label">
          Zero2 Category
        </CustomTypography>
        <CustomTypography truncate>
          {sample.zero2Category}
        </CustomTypography>
      </Box>
      <Box className={classes.item} flex={1} minWidth="165px">
        <CustomTypography variant="label">
          Zero2 Subcategory 1
        </CustomTypography>
        <CustomTypography truncate>
          {sample.zero2Subcat1}
        </CustomTypography>
      </Box>
      <Box className={classes.item} flex={1} minWidth="185px">
        <CustomTypography variant="label">
          Zero2 Subcategory 2
        </CustomTypography>
        <CustomTypography truncate>
          {sample.zero2Subcat2}
        </CustomTypography>
      </Box>
      <Box className={classes.item} flex={2} minWidth="170px">
        <CustomTypography variant="label">
          Zero2 Final Diagnosis
        </CustomTypography>
        <CustomTypography truncate>
          {sample.zero2FinalDiagnosis}
        </CustomTypography>
      </Box>
      {Boolean(sample.relevantMolAlterations?.length) && (
        <Box className={classes.item} minWidth="100%" gap="8px">
          <CustomTypography variant="label">
            Relevant Alterations
          </CustomTypography>
          <Box display="flex" gap="8px" flexWrap="wrap">
            {sample.relevantMolAlterations?.map((a) => (
              <Tooltip
                title={a.additionalData?.methClass as string || ''}
                disableFocusListener={a.mutationType !== 'METHYLATION_CLASSIFIER'}
                disableHoverListener={a.mutationType !== 'METHYLATION_CLASSIFIER'}
                disableTouchListener={a.mutationType !== 'METHYLATION_CLASSIFIER'}
              >
                <span>
                  <AlterationChip
                    key={a.id}
                    alteration={a}
                    mutationType={a.mutationType}
                    className={clsx({
                      [classes.alterationChipRed]: a.mutationType === 'METHYLATION_CLASSIFIER' && a.additionalData?.interpretation === 'NO MATCH',
                      [classes.alterationChipGreen]: a.mutationType === 'METHYLATION_CLASSIFIER' && a.additionalData?.interpretation === 'MATCH',
                    })}
                  />
                </span>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
