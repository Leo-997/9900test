import {
    Box,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { XIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { impacts } from '../../constants/options';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { Impact, ImpactGroups } from '../../types/Common.types';
import { ISNVGermlineSearchOptions, ISNVSearchOptions } from '../../types/Search.types';
import ChipsList from '../Chips/ChipsList';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import ListMenu from '../SearchFilterBar/ListMenu';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
    padding: 0,
    '& .MuiMenu-paper': {
      padding: 0,
      top: '-100px',
    },
    '& .MuiMenu-list': {
      padding: 0,
    },
  },
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  genelistLbl: {
    marginTop: 14,
    marginLeft: 15,
  },
  genelistCount: {
    marginTop: 14,
    marginLeft: 15,
  },
  headerGrid: {
    display: 'flex',
  },
  addConsequenceBtn: {
    marginRight: 28,
    right: 0,
  },
  searchBar: {
    width: '350px',
  },
  selectedConsequencesWrapper: {
    maxHeight: '170px',
  },
  inputWrapper: {
    position: 'relative',
    minHeight: 50,
    flexWrap: 'wrap',
  },
  consequenceChipContainer: {
    width: '95%',
  },
}));

interface IProps<T extends ISNVSearchOptions | ISNVGermlineSearchOptions> {
  anchorEl: null | HTMLElement;
  setAnchorEl: Dispatch<SetStateAction<null | HTMLElement>>;
  toggled: T;
  setToggled: Dispatch<SetStateAction<T>>;
  closeParent?: () => void;
}

export default function ConsequenceMenu<T extends ISNVSearchOptions | ISNVGermlineSearchOptions>({
  anchorEl,
  setAnchorEl,
  toggled,
  setToggled,
  closeParent,
}: IProps<T>): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [impactGroups, setImpactGroups] = useState<ImpactGroups | undefined>();
  const [selectedConsequences, setSelectedConsequences] = useState<string[]>([]);
  const [latestList, setLatestList] = useState<string[]>([]);
  const [consequenceOptions, setConsequenceOptions] = useState<string[]>([]);

  const [anchorElConsequence, setAnchorElConsequence] = useState<null | HTMLElement>(null);
  const [anchorElImpactList, setAnchorElImpactList] = useState<null | HTMLElement>(null);

  const handleClose = (event, reason): void => {
    setAnchorEl(null);
    if (reason === 'escapeKeyDown' && closeParent) {
      closeParent();
    }
  };

  const handleSubmit = (): void => {
    setToggled((prev) => ({
      ...prev,
      consequence: [...selectedConsequences],
    }));
    setLatestList(selectedConsequences.slice());
    setAnchorEl(null);
    setSelectedConsequences([]);
  };

  const handleSelectImpact = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const imp = event.target.value;
    if (event.target.checked) {
      setSelectedConsequences(Array.from(
        impactGroups
          ? new Set([...selectedConsequences, ...impactGroups[imp]])
          : new Set([...selectedConsequences]),
      ));
    } else {
      setSelectedConsequences([
        ...selectedConsequences.filter(
          (c: string) => impactGroups && !impactGroups[imp].includes(c),
        ),
      ]);
    }
  };

  const handleDeleteSelectedConsequence = (con: string): void => {
    const updatedConsequences = selectedConsequences.filter(
      (item: string) => item !== con,
    );
    setSelectedConsequences(updatedConsequences);
  };

  const checkImpact = (imp: Impact): boolean => {
    if (!impactGroups) return false;
    return impactGroups[imp].every((c) => selectedConsequences.includes(c));
  };

  useEffect(() => {
    setSelectedConsequences(toggled.consequence);
    setLatestList(toggled.consequence);
  }, [toggled]);

  useEffect(() => {
    zeroDashSdk.consequences.getConsequences()
      .then((data) => {
        const typedData = data as ImpactGroups;
        setImpactGroups(typedData);
        setConsequenceOptions([...typedData.high, ...typedData.medium, ...typedData.low]);
      });
  }, [zeroDashSdk.consequences]);

  return (
    <Menu
      className={classes.menu}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      autoFocus={false}
      disableAutoFocusItem={false}
      disableRestoreFocus
    >
      <Grid container minWidth="480px" padding="16px" direction="column" flexWrap="nowrap">
        <Grid container direction="row">
          <Grid size={10} className={classes.headerGrid}>
            <Box>
              <CustomTypography
                variant="bodyRegular"
                fontWeight="bold"
                className={classes.genelistLbl}
              >
                Consequences
              </CustomTypography>
            </Box>
          </Grid>
          <Grid size={2} container justifyContent="flex-end">
            <IconButton
              onClick={(): void => setAnchorEl(null)}
            >
              <XIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container direction="row" justifyContent="flex-end" gap="8px" padding="12px 0px">
          <CustomButton
            variant="text"
            label="Add consequence"
            onClick={(e): void => setAnchorElConsequence(e.currentTarget)}
            className={clsx(classes.addConsequenceBtn)}
          />
          <CustomButton
            variant="text"
            label="Add impact list"
            onClick={(e): void => setAnchorElImpactList(e.currentTarget)}
            className={clsx(classes.addConsequenceBtn)}
          />
        </Grid>
      </Grid>
      <Grid container direction="column" style={{ margin: '0 15px 10px 15px', width: '95%' }}>
        <ChipsList
          type="success"
          chips={selectedConsequences.map((consequence) => ({
            key: consequence,
            label: consequence,
          }))}
          handleDelete={handleDeleteSelectedConsequence}
          successTitle="Consequences"
        />
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="flex-end"
        style={{ marginBottom: '8px', paddingRight: '8px', gap: '8px' }}
      >
        <CustomButton
          onClick={(): void => setSelectedConsequences([])}
          label="Clear all"
          variant="subtle"
          size="small"
        />
        <CustomButton
          variant="bold"
          size="small"
          label={`Apply Filter (${selectedConsequences.length})`}
          disabled={latestList.length === selectedConsequences.length}
          onClick={handleSubmit}
        />
      </Grid>
      <ListMenu
        anchorEl={anchorElConsequence}
        setAnchorEl={setAnchorElConsequence}
        value={selectedConsequences}
        onChange={(newList): void => setSelectedConsequences(newList)}
        menuOptions={consequenceOptions}
      />
      {anchorElImpactList && (
        <Menu
          className={classes.menu}
          anchorEl={anchorElImpactList}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          keepMounted
          open={Boolean(anchorElImpactList)}
          onClose={(): void => setAnchorElImpactList(null)}
          autoFocus={false}
          disableAutoFocusItem={false}
        >
          <div>
            <Divider />
            <ScrollableSection style={{ maxHeight: '500px', width: '150px' }}>
              {impacts.map((imp: Impact) => (
                <MenuItem className={classes.menuItem} key={imp}>
                  <FormControlLabel
                    value={imp}
                    control={(
                      <Checkbox
                        checked={checkImpact(imp)}
                        onChange={(e): void => {
                          handleSelectImpact(e);
                          setAnchorElImpactList(null);
                        }}
                        disableRipple
                        disableFocusRipple
                      />
                      )}
                    label={imp[0].toUpperCase() + imp.substring(1)}
                    labelPlacement="end"
                  />
                </MenuItem>
              ))}
            </ScrollableSection>
          </div>
        </Menu>
      )}
    </Menu>
  );
}
