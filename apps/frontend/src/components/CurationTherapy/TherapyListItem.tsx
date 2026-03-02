import { ReactElement } from 'react';
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  styled,
} from '@mui/material';
import { CircleCheckBigIcon, PillIcon, PlusCircleIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { corePalette } from '@/themes/colours';
import { ICurationTherapy } from '@/types/Therapies/CurationTherapies.types';
import CustomTypography from '../Common/Typography';

const StyledDivider = styled(Divider)({
  border: '1px solid #D0D9E2',
  opacity: '0.24',
  width: '100%',
});

interface IListItemProps {
  therapy: ICurationTherapy;
  isSelected: boolean;
  onSelect: (therapy: ICurationTherapy) => void;
  canSelectTherapy: boolean;
}

function TherapyListItem({
  therapy,
  isSelected,
  onSelect,
  canSelectTherapy,
}: IListItemProps): ReactElement<any> {
  const getDrugsText = (): string => {
    const drugs: string[] = [];
    therapy.drugs.forEach((drug) => {
      if (drug.clinicalDrug) {
        return drugs.push(`${drug.class.name} (${drug.clinicalDrug.name})`);
      }
      return drugs.push(drug.class.name);
    });

    return therapy.drugs.length > 1 ? `${drugs.slice(0, -1).join(', ')} and ${drugs[drugs.length - 1]}` : drugs[0];
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
    >
      <ListItem>
        <ListItemAvatar><PillIcon /></ListItemAvatar>
        <Box display="flex" flexDirection="column" style={{ width: '100%' }}>
          <ListItemText style={{ width: '100%', maxWidth: 'calc(100% - 75px)' }}>
            <CustomTypography truncate>
              <b>Drugs:</b>
              {' '}
              {/* {therapy.drugs.map((d) => d.name).join(', ')} */}
              {getDrugsText()}
            </CustomTypography>

            {therapy.chemotherapyNote && (
            <CustomTypography truncate>
              <b>Chemotherapy:</b>
              {' '}
              {therapy.chemotherapyNote}
            </CustomTypography>
            )}
            {therapy.radiotherapyNote && (
              <CustomTypography>
                <b>Radiotherapy:</b>
                {' '}
                {therapy.radiotherapyNote}
              </CustomTypography>
            )}
          </ListItemText>
          <ListItemText>
            <CustomTypography variant="bodySmall">
              added on&nbsp;
              {dayjs(therapy.createdAt).format('DD/MM/YYYY, hh:mm a')}
            </CustomTypography>
          </ListItemText>
        </Box>
        <ListItem
          secondaryAction
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column-reverse',
            width: '48px',
          }}
        >
          <IconButton
            sx={{ transition: 'all cubic-bezier(.19,1,.22,1) 0.7s', padding: '6px' }}
            onClick={(): void => onSelect(therapy)}
            disabled={!canSelectTherapy}
          >
            {isSelected ? (
              <CircleCheckBigIcon fill={corePalette.blank} stroke={corePalette.green150} />
            ) : (
              <PlusCircleIcon />
            )}
          </IconButton>
        </ListItem>
      </ListItem>
      <StyledDivider />
    </Box>
  );
}

export default TherapyListItem;
