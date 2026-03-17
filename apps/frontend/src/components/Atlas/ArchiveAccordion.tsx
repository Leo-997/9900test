import CustomChip from '@/components/Common/Chip';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import {
  Box,
  Collapse,
  List,
  styled,
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { Archive, ChevronDown } from 'lucide-react';
import ArchiveContent from './ArchiveContent';

import type { JSX } from "react";

interface IGeneArchives {
  archivedLists: IGeneList[];
  name: string;
  listType: string;
  archiveOpen: boolean;
  setArchiveOpen: (open: boolean) => void
}

const LogoTitleWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
});

const ButtonWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export default function ArchiveAccordion({
  archivedLists,
  name,
  listType,
  archiveOpen,
  setArchiveOpen,
}: IGeneArchives): JSX.Element {
  const handleClick = (): void => {
    setArchiveOpen(!archiveOpen);
  };

  return (
    <List>
      <ListItemButton
        disableRipple
        sx={{
          backgroundColor: corePalette.blank,
          cursor: 'default',
          '&:hover': {
            backgroundColor: corePalette.blank,
          },
        }}
      >
        <ButtonWrapper>
          <LogoTitleWrapper>
            {archivedLists.length > 0 && (
              archiveOpen ? (
                <ChevronDown
                  onClick={handleClick}
                  style={{
                    transition: 'transform 0.3s ease-in-out',
                    height: '20px',
                    width: '20px',
                    cursor: 'pointer',
                  }}
                />
              ) : (
                <ChevronDown
                  onClick={handleClick}
                  style={{
                    transition: 'transform 0.3s ease-in-out',
                    height: '20px',
                    width: '20px',
                    cursor: 'pointer',
                    transform: 'rotate(-90deg)',
                  }}
                />
              )
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '8px',
                gap: '8px',
              }}
            >
              <Archive
                style={{
                  height: '20px',
                  width: '20px',
                }}
              />
              <CustomTypography variant="titleSmall" fontWeight="medium">
                Archived
                {' '}
                {name}
                {' '}
                {listType}
                {' '}
                lists
              </CustomTypography>
              <CustomChip
                label={archivedLists.length}
                pill
                backgroundColour={corePalette.grey30}
                fontWeight="bold"
              />
            </Box>
          </LogoTitleWrapper>
          <CustomTypography
            color={corePalette.grey100}
            sx={{
              marginLeft: '35px',
              marginTop: '10px',
            }}
          >
            For any previous list versions prior to
            {' '}
            <span style={{ fontWeight: 'bold' }}>
              V
              {archivedLists[archivedLists.length - 1]?.version}
            </span>
            {' '}
            not displayed here, please refer to SharePoint folders
          </CustomTypography>
        </ButtonWrapper>
      </ListItemButton>
      <Collapse in={archiveOpen} timeout="auto" unmountOnExit>
        <Box sx={{ marginLeft: 4, borderLeft: `1px solid ${corePalette.grey50}` }}>
          {archivedLists.map((item, idx) => (
            <ArchiveContent
              key={item.id ?? idx}
              archivedList={item}
              name={name}
              listType={listType}
            />
          ))}
        </Box>
      </Collapse>
    </List>
  );
}
