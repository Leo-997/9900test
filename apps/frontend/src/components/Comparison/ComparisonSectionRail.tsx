import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
import { ComparisonSectionKey } from '@/types/Comparison.types';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: '#F0F4F7',
    padding: '4px 0 0',
  },
  card: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  sectionChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
    cursor: 'pointer',
  },
}));

interface ISectionItem {
  key: ComparisonSectionKey;
  label: string;
}

interface IProps {
  selectedSections: ISectionItem[];
}

export default function ComparisonSectionRail({
  selectedSections,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.card}>
        <Box className={classes.titleRow}>
          <CustomTypography variant="titleRegular" fontWeight="medium">
            Active sections
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            Jump to any visible section below.
          </CustomTypography>
        </Box>

        <Box className={classes.chipRow}>
          {selectedSections.map((section) => (
            <Chip
              clickable
              component="a"
              href={`#comparison-section-${section.key}`}
              key={section.key}
              label={section.label}
              className={classes.sectionChip}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
