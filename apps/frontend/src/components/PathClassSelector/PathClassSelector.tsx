import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import {
  MenuItem, Select,
} from '@mui/material';
import { createStyles, CSSProperties, makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import { pathClassOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { PathClass } from '../../types/Common.types';
import CustomTypography from '../Common/Typography';

const useStyles = makeStyles(() => createStyles({
  select: {
    height: 40,
    maxWidth: '100%',
    borderRadius: 4,
  },
  selectMenu: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
    minWidth: 80,
  },
  selectMenuItem: {
    height: 44,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },

  selectButton: ({ pathclass }: { pathclass: PathClass | null }) => {
    let customStyles: CSSProperties;
    if (
      pathclass === 'C5: Pathogenic'
        || pathclass === 'C4: Likely Pathogenic'
    ) {
      customStyles = {
        backgroundColor: '#FEF1F6',
        color: '#DD0951',
      };
    } else if (pathclass === 'C3.8: VOUS' || pathclass === 'C3: VOUS') {
      customStyles = {
        backgroundColor: '#E0FFEF',
        color: '#048057',
      };
    } else {
      customStyles = {
        backgroundColor: '#D0D9E2',
        color: '#022034',
      };
    }

    return {
      height: 40,
      maxWidth: '100%',
      borderRadius: 4,
      ...customStyles,
    };
  },

  selectItem: {
    height: 44,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },
  selectButtonPlain: {
    color: '#022034',
    height: 40,
    maxWidth: '100%',
    borderRadius: 4,
  },
}));

type CurrentPathClass = PathClass | null;
interface IPathClasSelectorProps {
  biosampleId: string;
  currentPathClass: CurrentPathClass;
  updatePathClass(pathclass: PathClass): void;
}

export function PathClassSelector({
  biosampleId,
  currentPathClass,
  updatePathClass,
}: IPathClasSelectorProps): JSX.Element {
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [pathClass, setPathClass] = useState<CurrentPathClass>(
    currentPathClass ?? null,
  );

  const classes = useStyles({ pathclass: pathClass });

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  const handleUpdatePathClass = (newPathClass: PathClass):void => {
    setPathClass(newPathClass || null);
    updatePathClass(newPathClass || null);
  };

  return (
    <Select
      key="somatic-snv-class-select-label"
      autoWidth
      value={pathClass}
      variant="outlined"
      className={classes.selectButton}
      MenuProps={{
        // eslint-disable-next-line @typescript-eslint/naming-convention
        MenuListProps: { className: classes.selectMenu },
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
      }}
      renderValue={(val): JSX.Element => (
        <CustomTypography variant="bodyRegular" fontWeight="bold">{val as PathClass}</CustomTypography>
      )}
      onChange={(val): void => handleUpdatePathClass(val.target.value as PathClass)}
    >
      {pathClassOptions.map((option) => (
        <MenuItem
          key={option.name}
          disabled={isReadOnly || !canEdit}
          value={option.value}
          className={classes.selectItem}
        >
          <CustomTypography variant="bodyRegular">{option.name}</CustomTypography>
        </MenuItem>
      ))}
    </Select>
  );
}
