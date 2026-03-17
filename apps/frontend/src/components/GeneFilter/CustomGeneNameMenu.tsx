import {
  Checkbox,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IGene } from '../../types/Common.types';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import SearchBar from '../Search/SearchBar';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
  },
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  searchBar: {
    minWidth: '250px !important',
  },
}));

interface ICustomGeneNameMenuProps {
  anchorElGeneName: null | HTMLElement;
  setAnchorElGeneName: Dispatch<SetStateAction<null | HTMLElement>>;
  selectedGeneList: IGene[];
  setSelectedGeneList: Dispatch<SetStateAction<IGene[]>>;
}

export default function CustomGeneNameMenu({
  anchorElGeneName,
  setAnchorElGeneName,
  selectedGeneList,
  setSelectedGeneList,
}: ICustomGeneNameMenuProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const classes = useStyles();
  const [geneList, setGeneList] = useState<IGene[]>([]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const gene = geneList.filter(
      (g) => g?.geneId?.toString() === event.target.value,
    )[0];
    if (event.target.checked) {
      if (selectedGeneList.every((item) => item.gene !== gene.gene)) {
        setSelectedGeneList([...selectedGeneList, gene]);
      } else {
        setSelectedGeneList([...selectedGeneList]);
      }
    } else {
      setSelectedGeneList(
        selectedGeneList.filter(
          (item: IGene) => item?.geneId?.toString() !== event.target.value,
        ),
      );
    }
  };

  const filterGeneOptions = async (query: string): Promise<void> => {
    try {
      const genes = await zeroDashSdk.gene.getGenes(
        { gene: query },
      );
      setGeneList(genes);
    } catch (err) {
      console.error(err);
      setGeneList([]);
    }
  };

  return (
    <Menu
      className={classes.menu}
      anchorEl={anchorElGeneName}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorElGeneName)}
      onClose={(): void => setAnchorElGeneName(null)}
      autoFocus={false}
      disableAutoFocusItem={false}
    >
      <SearchBar
        className={classes.searchBar}
        searchMethod={filterGeneOptions}
        searchOnChange
        ignoreStyles
      />
      <div>
        <Divider />
        <ScrollableSection style={{ maxHeight: '500px' }}>
          {geneList.map((gene: IGene) => (
            <MenuItem className={classes.menuItem} key={`all${gene.gene}`}>
              <FormControlLabel
                value={gene.geneId}
                control={(
                  <Checkbox
                    checked={selectedGeneList.includes(gene)}
                    onChange={handleSelect}
                    disableRipple
                    disableFocusRipple
                  />
                )}
                label={gene.gene}
                labelPlacement="end"
              />
            </MenuItem>
          ))}
        </ScrollableSection>
      </div>
    </Menu>
  );
}
