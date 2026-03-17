import {
  Box,
  Checkbox,
  createFilterOptions,
  FormControl,
  MenuItem,
  Select,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { useMemo, useState, type JSX } from 'react';
import { ISelectOption } from '@/types/misc.types';
import ItemButton from '@/components/Buttons/ItemButton';
import CustomAutocomplete from '@/components/Common/Autocomplete';
import CustomTypography from '@/components/Common/Typography';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import { FilterAccordion } from '../../Common/FilterAccordion';

const filterOptions = createFilterOptions<ISelectOption<string>>({
  limit: 100,
  stringify: (option) => option.name,
});

export type ColourMode = 'zero2Subcategory2' | 'zero2FinalDiagnosis';

interface IProps {
  availableBiosamples: string[];
  selectedBiosamples: string[];
  onBiosamplesChange: (biosamples: string[]) => void;
  colourMode: ColourMode;
  onColourModeChange: (mode: ColourMode) => void;
  availableSubcategories: Set<string>;
  selectedSubcategories: Set<string>;
  onSubcategoriesChange: (subcategories: Set<string>) => void;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export function TSNEAnnotationSelection({
  availableBiosamples,
  selectedBiosamples,
  onBiosamplesChange,
  colourMode,
  onColourModeChange,
  availableSubcategories,
  selectedSubcategories,
  onSubcategoriesChange,
}: IProps): JSX.Element {
  const [subcatSearch, setSubcatSearch] = useState<string>('');

  const options = useMemo(() => availableBiosamples.map((biosample) => ({
    name: biosample,
    value: biosample,
  })), [availableBiosamples]);

  const value = useMemo(
    () => options.filter((option) => selectedBiosamples.includes(option.value)),
    [options, selectedBiosamples],
  );

  const subcategoryItems = useMemo(
    () => Array.from(availableSubcategories).sort((a, b) => a.localeCompare(b)),
    [availableSubcategories],
  );

  const filteredSubcategories = subcategoryItems.filter(
    (item) => item.toLowerCase().includes(subcatSearch.toLowerCase()),
  );

  const areAllSelected = filteredSubcategories.length > 0
    && filteredSubcategories.every((item) => selectedSubcategories.has(item));

  const toggleSelectAll = (): void => {
    const newSelectedSubcategories = new Set(selectedSubcategories);
    if (areAllSelected) {
      filteredSubcategories.forEach((item) => {
        newSelectedSubcategories.delete(item);
      });
    } else {
      filteredSubcategories.forEach((item) => {
        newSelectedSubcategories.add(item);
      });
    }
    onSubcategoriesChange(newSelectedSubcategories);
  };

  const handleSubcategoryChange = (subcategory: string): void => {
    const newSelectedSubcategories = new Set(selectedSubcategories);
    if (selectedSubcategories.has(subcategory)) {
      newSelectedSubcategories.delete(subcategory);
    } else {
      newSelectedSubcategories.add(subcategory);
    }
    onSubcategoriesChange(newSelectedSubcategories);
  };

  return (
    <ItemButton
      mainText="Plot Options"
      isActive
      additionalContent={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          justifyContent="flex-start"
          gap="16px"
          width="100%"
          paddingTop="16px"
        >
          <Box
            display="flex"
            flexDirection="column"
            gap="12px"
            width="100%"
          >
            <FormControl fullWidth size="small">
              <CustomTypography variant="label">
                Colour by
              </CustomTypography>
              <Select
                labelId="colour-mode-label"
                id="colour-mode-select"
                value={colourMode}
                onChange={(e): void => onColourModeChange(e.target.value as ColourMode)}
              >
                <MenuItem value="zero2Subcategory2">Subcategory 2</MenuItem>
                <MenuItem value="zero2FinalDiagnosis">Final Diagnosis</MenuItem>
              </Select>
            </FormControl>
            <CustomAutocomplete
              id="biosample-autocomplete"
              label="Highlight RNA-Seq IDs"
              multiple
              options={options}
              filterOptions={filterOptions}
              getOptionLabel={(option: ISelectOption<string>): string => option.name || ''}
              isOptionEqualToValue={(option, val): boolean => option.value === val.value}
              value={value}
              onChange={(e, val): void => {
                onBiosamplesChange(val ? val.map((option) => option.value) : []);
              }}
              disableCloseOnSelect
              fullWidth
              renderOption={(props, option, { selected }): JSX.Element => (
                <li {...props}>
                  <Box display="flex" alignItems="center" gap="8px">
                    <Checkbox checked={selected} />
                    {option.name}
                  </Box>
                </li>
              )}
            />
            <FilterAccordion
              title="Filter by Subcategory2"
              globalExpanded={false}
              searchTerm={subcatSearch}
              onSearchTermChange={setSubcatSearch}
              searchPlaceholder="Search subcategories..."
            >
              <ScrollableSection
                style={{
                  width: '100%',
                  height: '300px',
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={areAllSelected}
                        onChange={toggleSelectAll}
                        disabled={filteredSubcategories.length === 0}
                      />
                    )}
                    label={areAllSelected ? 'Deselect All' : 'Select All'}
                  />
                  {filteredSubcategories.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={(
                        <Checkbox
                          checked={selectedSubcategories.has(item)}
                          onChange={(): void => handleSubcategoryChange(item)}
                        />
                      )}
                      label={item}
                    />
                  ))}
                </FormGroup>
              </ScrollableSection>
            </FilterAccordion>
          </Box>
        </Box>
      )}
    />
  );
}
