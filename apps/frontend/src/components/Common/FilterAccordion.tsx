import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionSummary,
  AccordionProps,
  Typography,
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import { ReactNode, useEffect, useState, type JSX } from 'react';
import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import CustomButton from './Button';

interface IFilterAccordionProps extends Omit<AccordionProps, 'children'> {
  title: string;
  children: ReactNode;
  globalExpanded: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchPlaceholder: string;
  onReset?: () => void;
  onApply?: () => void;
  hasChanges?: boolean;
}

export function FilterAccordion({
  title,
  children,
  globalExpanded,
  searchTerm,
  onSearchTermChange,
  searchPlaceholder,
  onReset,
  onApply,
  hasChanges = false,
  ...rest
}: IFilterAccordionProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsExpanded(globalExpanded);
  }, [globalExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setIsSearchOpen(false);
    }
  }, [isExpanded]);

  return (
    <MuiAccordion
      expanded={isExpanded}
      onChange={(): void => setIsExpanded((prev) => !prev)}
      {...rest}
    >
      <AccordionSummary expandIcon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography>{title}</Typography>
          {isExpanded && (
            <IconButton
              onClick={(e): void => {
                e.stopPropagation();
                setIsSearchOpen((prev) => !prev);
              }}
              sx={{
                padding: '0',
                marginRight: '8px',
              }}
            >
              <SearchIcon />
            </IconButton>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {isSearchOpen && (
          <TextField
            variant="outlined"
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e): void => onSearchTermChange(e.target.value)}
            margin="dense"
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        {children}
        {(onReset || onApply) && (
          <Box
            display="flex"
            justifyContent="flex-end"
            gap="8px"
            paddingTop="16px"
            marginTop="16px"
          >
            {onReset && (
              <CustomButton
                variant="subtle"
                size="small"
                label="Reset"
                onClick={onReset}
              />
            )}
            {onApply && (
              <CustomButton
                variant="bold"
                size="small"
                label="Apply"
                onClick={onApply}
                disabled={!hasChanges}
              />
            )}
          </Box>
        )}
      </AccordionDetails>
    </MuiAccordion>
  );
}
