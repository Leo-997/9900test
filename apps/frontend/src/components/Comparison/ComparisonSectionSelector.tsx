import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
import {
  comparisonSectionOptions,
  ComparisonSectionKey,
} from '@/types/Comparison.types';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    marginBottom: '4px',
  },
  chipRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  chipSelected: {
    backgroundColor: corePalette.blue30,
    color: corePalette.blue300,
    border: `1px solid ${corePalette.blue30}`,
    fontWeight: 500,
  },
  chipUnselected: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    border: `1px solid ${corePalette.grey30}`,
    fontWeight: 500,
  },
}));

interface IProps {
  selectedSections: ComparisonSectionKey[];
  toggleSection: (section: ComparisonSectionKey) => void;
}

export default function ComparisonSectionSelector({
  selectedSections,
  toggleSection,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box display="flex" flexDirection="column" gap="4px">
        <CustomTypography
          variant="label"
          color={corePalette.grey100}
          className={classes.label}
          component="div"
        >
          SECTIONS
        </CustomTypography>
        <CustomTypography variant="titleSmall" fontWeight="medium" component="div">
          Choose comparison sections
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200} component="div">
          Select the sections you want to show in the comparison workspace.
        </CustomTypography>
      </Box>

      <Box className={classes.chipRow}>
        {comparisonSectionOptions.map((section) => {
          const selected = selectedSections.includes(section.key);

          return (
            <Chip
              clickable
              key={section.key}
              label={section.label}
              onClick={() => toggleSection(section.key)}
              className={selected ? classes.chipSelected : classes.chipUnselected}
            />
          );
        })}
      </Box>
    </Box>
  );
}
