import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IDetailedHTSDrugCombination, IHTSReportable } from '@/types/HTS.types';
import {
    Box,
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { Maximize2Icon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { ClassificationChip, TargetableChip } from '../Chips';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import { HTSCombinationModalContent } from './HTSCombinationModalContent';
import { HtsFooter } from './HtsFooter';

const Paper = styled(MuiPaper)(() => ({
  margin: '4px 0 4px 0',
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
  width: 'fit-content',
  paddingRight: '64px',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  paddingLeft: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  paddingRight: '8px',
  width: '30%',
  minWidth: '500px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  flexDirection: 'column',
  height: '100%',
  flexShrink: 0,
  gap: '8px',
  width: '200px',
  minWidth: '200px',
}));

const ItemSmall = styled(Item)(() => ({
  width: '160px',
  minWidth: '160px',
}));

const ItemLarge = styled(Item)(() => ({
  width: '230px',
  minWidth: '230px',
}));

interface IProps {
  combination: IDetailedHTSDrugCombination;
  onChange: (id: string, body: Partial<IHTSReportable>) => void;
}

export function HTSCombinationListItem({
  combination,
  onChange,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [expanded, setExpanded] = useState<boolean>(false);

  const updateResult = async (body: Partial<IHTSReportable>): Promise<void> => {
    try {
      await zeroDashSdk.hts.updateDrugCombination(
        combination.biosampleId,
        combination.id,
        body,
      );
      onChange(combination.id, body);
    } catch {
      enqueueSnackbar('Could not update combination, please try again.', { variant: 'error' });
    }
  };

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={1}>
            <IconButton
              onClick={(): void => setExpanded(!expanded)}
            >
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid direction="column" padding="8px" container flex={5} height="100%">
            <CustomTypography variant="label">
              Drug Name
            </CustomTypography>
            <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
              {combination.screen1Data?.drugName}
            </CustomTypography>
            <Box display="flex" gap="4px" width="100%">
              <CustomTypography truncate>
                Compound ID:
                {' '}
                {combination.screen1Data?.internalId}
              </CustomTypography>
            </Box>
            <Box display="flex" gap="4px" width="100%">
              <CustomTypography>
                Pathway:
              </CustomTypography>
              <CustomTypography truncate style={{ width: '70%' }}>
                {combination.screen1Data?.classes?.map((c) => c.name).join(', ')}
              </CustomTypography>
            </Box>
          </Grid>
          <Grid direction="column" padding="8px" container flex={5} height="100%">
            <CustomTypography variant="label">
              Drug Name
            </CustomTypography>
            <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
              {combination.screen2Data?.drugName}
            </CustomTypography>
            <Box display="flex" gap="4px" width="100%">
              <CustomTypography truncate>
                Compound ID:
                {' '}
                {combination.screen2Data?.internalId}
              </CustomTypography>
            </Box>
            <Box display="flex" gap="4px" width="100%">
              <CustomTypography>
                Pathway:
              </CustomTypography>
              <CustomTypography truncate style={{ width: '70%' }}>
                {combination.screen2Data?.classes?.map((c) => c.name).join(', ')}
              </CustomTypography>
            </Box>
          </Grid>
        </Grid>
      </StickySection>
      <ItemSmall container>
        <Box>
          <CustomTypography variant="label">
            Combination effect
          </CustomTypography>
          <CustomTypography truncate>
            {combination.combinationEffect}
          </CustomTypography>
        </Box>
      </ItemSmall>
      <Item container>
        <Box>
          <CustomTypography variant="label">
            Drug 1 % Effect At Css
          </CustomTypography>
          <CustomTypography truncate>
            {combination.effectCssScreen1 ?? '-'}
          </CustomTypography>
        </Box>
        <Box>
          <CustomTypography variant="label">
            Drug 2 % Effect At Css
          </CustomTypography>
          <CustomTypography truncate>
            {combination.effectCssScreen2 ?? '-'}
          </CustomTypography>
        </Box>
      </Item>
      <Item container>
        <Box>
          <CustomTypography variant="label">
            Drug 1 % Effect At Cmax
          </CustomTypography>
          <CustomTypography truncate>
            {combination.effectCmaxScreen1 ?? '-'}
          </CustomTypography>
        </Box>
        <Box>
          <CustomTypography variant="label">
            Drug 2 % Effect At Cmax
          </CustomTypography>
          <CustomTypography truncate>
            {combination.effectCmaxScreen2 ?? '-'}
          </CustomTypography>
        </Box>
      </Item>
      <ItemLarge container>
        <Box>
          <CustomTypography variant="label">
            Combination % Effect At Css
          </CustomTypography>
          <CustomTypography truncate>
            {combination.effectCssCombo ?? '-'}
          </CustomTypography>
        </Box>
        <Box>
          <CustomTypography variant="label">
            Combination % Effect At Cmax
          </CustomTypography>
          <CustomTypography truncate>
            {combination.effectCmaxCombo ?? '-'}
          </CustomTypography>
        </Box>
      </ItemLarge>
      <Item container>
        <CustomTypography variant="label">
          Reportable
        </CustomTypography>
        { combination.reportable !== null && combination.reportable !== undefined && (
          <TargetableChip
            targetable={combination.reportable ? 'Yes' : 'No'}
          />
        )}
      </Item>
      <Item container>
        <CustomTypography variant="label">
          Reporting Rationale
        </CustomTypography>
        {(
          combination.reportingRationale !== null
          && combination.reportingRationale !== undefined
        ) && (
          <ClassificationChip
            classification={combination.reportingRationale}
            reportable={combination.reportable}
          />
        )}
      </Item>
      {expanded && (
        <ExpandedModal
          variantType="HTS_COMBINATION"
          variantId={combination.id}
          biosampleId={combination.biosampleId}
          open={expanded}
          handleClose={(): void => setExpanded(false)}
          title="Combination"
          titleContent={`${combination.screen1Data?.drugName} + ${combination.screen2Data?.drugName}`}
          curationDataComponent={(
            <HTSCombinationModalContent
              combination={combination}
            />
          )}
          overrideFooter={(
            <HtsFooter
              biosampleId={combination.biosampleId}
              variantId={combination.id}
              variantType="HTS_COMBINATION"
              data={combination}
              updateReportable={updateResult}
            />
          )}
          overrideType="hts"
        />
      )}
    </Paper>
  );
}
