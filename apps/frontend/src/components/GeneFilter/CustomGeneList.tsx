import {
    Box,
    Divider,
    Grid,
    IconButton,
    Menu,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { IGene } from '../../types/Common.types';

import ChipsList from '../Chips/ChipsList';
import CustomTypography from '../Common/Typography';
import AddGenesButtons from './AddGenesButtons';
import CustomGeneNameMenu from './CustomGeneNameMenu';
import { GeneListsMenu } from './GeneListsMenu';
import NewGeneListSection from './NewGeneListSection';
import PasteGeneList from './PasteGeneList';
import SelectedGeneList from './SelectedGeneList';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
    padding: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiMenu-paper': {
      padding: 0,
      top: '-100px',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiMenu-list': {
      padding: 0,
    },
  },
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: '#F3F7FF',
    },
  },
  containerGrid: {
    minWidth: '520px',
    paddingBottom: '16px',
  },
  headerGrid: {
    display: 'flex',
  },
}));

interface ICustomGeneListProps {
  anchorElGeneList: null | HTMLElement;
  setAnchorElGeneList: Dispatch<SetStateAction<null | HTMLElement>>;
  defaultValue: IGene[];
  onChange: (newGenes: IGene[]) => void;
  closeParent?: () => void;
}

export default function CustomGeneList({
  anchorElGeneList,
  setAnchorElGeneList,
  defaultValue,
  onChange,
  closeParent,
}: ICustomGeneListProps): JSX.Element {
  const classes = useStyles();
  const [selectedGeneList, setSelectedGeneList] = useState<IGene[]>([]);
  const [invalidGenes, setInvalidGenes] = useState<IGene[]>([]);

  const [viewPastedGeneList, setViewPastedGeneList] = useState(false);
  const [anchorElGeneName, setAnchorElGeneName] = useState<null | HTMLElement>(
    null,
  );
  const [anchorElPresetList, setAnchorElPresetList] = useState<null | HTMLElement>(null);
  const [newListSection, setNewListSection] = useState<boolean>(false);

  const handleAddGene = (e): void => {
    setAnchorElGeneName(e.currentTarget);
  };

  const handlePasteGene = (): void => {
    setViewPastedGeneList(!viewPastedGeneList);
    setNewListSection(false);
  };

  const handleAddGeneList = (e): void => {
    setAnchorElPresetList(e.currentTarget);
  };

  const handleClose = (event, reason: 'backdropClick' | 'escapeKeyDown'): void => {
    setAnchorElGeneList(null);
    if (reason === 'escapeKeyDown' && closeParent) {
      closeParent();
    }
  };

  const handleDeleteInvalidGene = (geneId: string): void => {
    const updatedGenelist = invalidGenes.filter(
      (item: IGene) => item.gene !== geneId,
    );
    setInvalidGenes(updatedGenelist);
  };

  useEffect(() => {
    setSelectedGeneList(defaultValue);
  }, [defaultValue]);

  return (
    <Menu
      className={classes.menu}
      anchorEl={anchorElGeneList}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      keepMounted
      open={Boolean(anchorElGeneList)}
      onClose={handleClose}
      autoFocus={false}
      disableAutoFocusItem={false}
      disableRestoreFocus
    >
      <Grid container direction="column" flexWrap="nowrap" padding="16px" minWidth="520px">
        <Grid container direction="row" flexWrap="nowrap">
          <Grid size={10} container gap="8px" flexWrap="nowrap">
            <Box>
              <CustomTypography
                variant="bodyRegular"
                fontWeight="bold"
              >
                &#8288;Custom Gene List
              </CustomTypography>
            </Box>
            <Box>
              <CustomTypography
                variant="bodyRegular"
              >
                {`${selectedGeneList.length} genes`}
              </CustomTypography>
            </Box>
          </Grid>
          <Grid size={2} container justifyContent="flex-end">
            <IconButton
              onClick={(): void => setAnchorElGeneList(null)}
            >
              <XIcon />
            </IconButton>
          </Grid>
        </Grid>
        <AddGenesButtons
          anchorElGeneName={anchorElGeneName}
          anchorElPresetList={anchorElPresetList}
          viewPastedGeneList={viewPastedGeneList}
          handleAddGene={handleAddGene}
          handlePasteGene={handlePasteGene}
          handleAddGeneList={handleAddGeneList}
        />
      </Grid>
      {viewPastedGeneList && (
        <div>
          <Divider />
          <PasteGeneList
            selectedGeneList={selectedGeneList}
            setSelectedGeneList={setSelectedGeneList}
            setInvalidGenes={setInvalidGenes}
          />
        </div>
      )}
      <div>
        {invalidGenes.length > 0
          && (
          <>
            <Divider />
            <Box display="flex" flexDirection="column" style={{ margin: 12 }}>
              <ChipsList
                type="error"
                chips={invalidGenes.map((g) => ({
                  label: g.gene,
                  key: g.gene,
                }))}
                handleDelete={handleDeleteInvalidGene}
                successTitle="CUSTOM GENE LIST"
                errorTitle="THE FOLLOWING GENES COULD NOT BE ADDED AS THEY COULD NOT BE VALIDATED"
              />
            </Box>
          </>
          )}
        <Divider />
        <SelectedGeneList
          defaultValue={defaultValue}
          onChange={onChange}
          selectedGeneList={selectedGeneList}
          setSelectedGeneList={setSelectedGeneList}
          setAnchorElGeneList={setAnchorElGeneList}
          setViewPastedGeneList={setViewPastedGeneList}
          setInvalidGeneList={setInvalidGenes}
          setNewListSection={setNewListSection}
        />
        { newListSection
          && (
          <NewGeneListSection
            selectedGeneList={selectedGeneList}
            setNewListSection={setNewListSection}
          />
          )}
      </div>
      <CustomGeneNameMenu
        anchorElGeneName={anchorElGeneName}
        setAnchorElGeneName={setAnchorElGeneName}
        selectedGeneList={selectedGeneList}
        setSelectedGeneList={setSelectedGeneList}
      />
      <GeneListsMenu
        anchorEl={anchorElPresetList}
        setAnchorEl={setAnchorElPresetList}
        selectedGeneList={selectedGeneList}
        setSelectedGeneList={setSelectedGeneList}
      />
    </Menu>
  );
}
