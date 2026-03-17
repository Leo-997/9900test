import {
  Box,
  Collapse,
  List,
  styled,
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState, type JSX } from 'react';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { corePalette } from '@/themes/colours';
import CustomTypography from '@/components/Common/Typography';
import ArchiveGeneGrid from './ArchiveTable';
import Pagination from '../Common/DataGrid/Pagination';

interface IGeneArchives {
  archivedList: IGeneList;
  name: string;
  listType:string;
}

const ButtonWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  alignItems: 'flex-start',
});

const TitleWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'flex-start',
});

const LogoWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'center',
});

const VersionNoteWrapper = styled(Box)({
  backgroundColor: corePalette.grey30,
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  height: 'fit-content',
  width: 'fit-content',
  marginLeft: '30px',
});

const ArchiveMainContent = styled(Box)({
  pl: '50px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const TableContent = styled(Box)({
  maxHeight: '80%',
  width: '100%',
  paddingLeft: '50px',
});

export default function ArchiveContent({
  archivedList,
  name,
  listType,
}: IGeneArchives): JSX.Element {
  const [subOpen, setSubOpen] = React.useState(false);
  const geneList = archivedList.genes;
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const handleClick = (): void => {
    setSubOpen(!subOpen);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [rowsPerPage]);

  const noteText = archivedList.archiveNotes && archivedList.archiveNotes.trim() !== ''
    ? archivedList.archiveNotes
    : 'Provide description about what was updated in this version for this gene list';

  return (
    <List
      sx={{ width: '100%', bgcolor: corePalette.blank }}
      component="nav"
    >
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
          <Box>
            <TitleWrapper>
              <LogoWrapper>
                {subOpen ? (
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
                )}
              </LogoWrapper>
              <CustomTypography
                fontWeight="bold"
                color={corePalette.offBlack100}
              >
                {name}
                {' '}
                {listType}
                {' '}
                version
                {' '}
                {archivedList.version}
              </CustomTypography>
            </TitleWrapper>
          </Box>
          <VersionNoteWrapper>
            <CustomTypography
              variant="label"
              fontSize="small"
              color={corePalette.grey200}
              fontWeight="bold"
            >
              Archive note
            </CustomTypography>
            <CustomTypography
              fontSize="small"
              color={corePalette.grey100}
            >
              {noteText}
            </CustomTypography>
          </VersionNoteWrapper>
        </ButtonWrapper>
      </ListItemButton>
      <Collapse in={subOpen} timeout="auto" unmountOnExit>
        <ArchiveMainContent>
          <TableContent>
            <ArchiveGeneGrid
              genes={archivedList.genes || []}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              listType={listType}
            />
          </TableContent>
          <Pagination
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            currentPage={currentPage}
            onCurrentPageChange={setCurrentPage}
            totalResults={geneList?.length || 0}
          />
        </ArchiveMainContent>
      </Collapse>
    </List>
  );
}
