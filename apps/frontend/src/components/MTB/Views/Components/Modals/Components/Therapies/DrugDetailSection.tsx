import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import { boolToStr } from '@/utils/functions/bools';
import { Box, styled } from '@mui/material';
import { useState, type JSX } from 'react';
import CustomChip from '@/components/Common/Chip';
import { corePalette } from '@/themes/colours';
import DrugDetailModal from './DrugDetailModal';
import DrugVersionsModal from './DrugVersionsModal';

interface IStyleProps {
  isValidated: boolean;
}

const Root = styled(Box)<IStyleProps>(({ theme, isValidated }) => ({
  border: `1px solid ${theme.colours.core.grey50}`,
  borderLeft: `5px solid ${isValidated ? theme.colours.core.green100 : theme.colours.core.yellow100}`,
  backgroundColor: theme.colours.core.grey10,
  position: 'relative',
  borderRadius: '4px',
}));

const Item = styled(Box)(({ theme }) => ({
  minHeight: '32px',
  paddingLeft: '8px',
  borderLeft: `1px solid ${theme.colours.core.grey100}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexWrap: 'wrap',
}));

interface IDrugDetailSectionProps {
  drug: IExternalDrug,
  updateActiveTherapyDrugDetail?: (updatedDrug: IExternalDrug) => void;
  isExpanded?: boolean;
}

export default function DrugDetailSection({
  drug,
  updateActiveTherapyDrugDetail,
  isExpanded = false,
}: IDrugDetailSectionProps): JSX.Element {
  const [openDrugDetailModal, setOpenDrugDetailModal] = useState<boolean>(false);
  const [openVersionsModal, setOpenVersionsModal] = useState<boolean>(false);

  return (
    <>
      <Root
        isValidated={drug.isValidated}
        display="flex"
        flexDirection="column"
        gap="16px"
        padding="16px"
        paddingTop="12px"
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
        >
          <Box
            display="flex"
            flexDirection="column"
            height="44px"
          >
            <CustomTypography variant="bodyRegular" fontWeight="medium">
              {drug.name}
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              {drug.latestVersion === drug.version ? 'Latest' : `Version ${drug.version}`}
              {!drug.isValidated && ' - Awaiting Approval'}
            </CustomTypography>
          </Box>
          {!isExpanded && (
            <Box
              display="flex"
              flexDirection="row"
              gap="8px"
            >
              <CustomButton
                variant="text"
                label="View all versions"
                size="small"
                onClick={():void => setOpenVersionsModal(true)}
              />
              <CustomButton
                variant="text"
                label="View details"
                size="small"
                onClick={():void => setOpenDrugDetailModal(true)}
              />
            </Box>
          )}
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          gap="16px"
          flexWrap="wrap"
        >
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
          >
            <CustomTypography variant="label">
              Drug Classes
            </CustomTypography>
            <Item>
              {drug.classes ? (
                drug.classes.map((c) => (
                  <CustomTypography
                    key={c.id}
                    variant="bodyRegular"
                    fontWeight="medium"
                  >
                    {c.name}
                    ;
                    &nbsp;
                  </CustomTypography>
                ))
              ) : (
                '-'
              )}
            </Item>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
          >
            <CustomTypography variant="label">
              Company
            </CustomTypography>
            <Item>
              <CustomTypography variant="bodyRegular" fontWeight="medium">
                {drug.company || '-'}
              </CustomTypography>
            </Item>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
          >
            <CustomTypography variant="label">
              artg approval
            </CustomTypography>
            <Item>
              <CustomTypography variant="bodyRegular" fontWeight="medium">
                {boolToStr(drug.artgApproved) || '-'}
              </CustomTypography>
            </Item>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
          >
            <CustomTypography variant="label">
              Paediatric Dose
            </CustomTypography>
            <Box display="flex" flexDirection="row">
              <Item>
                <CustomTypography variant="bodyRegular" fontWeight="medium">
                  {boolToStr(drug.hasPaediatricDose) || '-'}
                </CustomTypography>
              </Item>
            </Box>
          </Box>
        </Box>
        {isExpanded && (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            gap="16px"
            flexWrap="wrap"
          >
            <Box
              display="flex"
              flexDirection="column"
              gap="4px"
            >
              <CustomTypography variant="label">
                Targets
              </CustomTypography>
              <Box display="flex" flexDirection="row">
                <Item>
                  {drug.targets.length > 0 ? (
                    drug.targets.map((t) => (
                      <CustomChip
                        pill
                        size="small"
                        label={t.name}
                        backgroundColour={corePalette.green10}
                        colour={corePalette.green200}
                      />
                    ))
                  ) : (
                    '-'
                  )}
                </Item>
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap="4px"
            >
              <CustomTypography variant="label">
                Pathways
              </CustomTypography>
              <Item>
                {drug.pathways.length > 0 ? (
                  drug.pathways.map((p) => (
                    <CustomChip
                      key={p.id}
                      pill
                      size="small"
                      label={p.name}
                      backgroundColour={corePalette.green10}
                      colour={corePalette.green200}
                    />
                  ))
                ) : (
                  '-'
                )}
              </Item>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap="4px"
            >
              <CustomTypography variant="label">
                FDA approved
              </CustomTypography>
              <Item>
                <CustomTypography variant="bodyRegular" fontWeight="medium">
                  {boolToStr(drug.fdaApproved) || '-'}
                </CustomTypography>
              </Item>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap="4px"
            >
              <CustomTypography variant="label">
                TGA approval
              </CustomTypography>
              <Item>
                <CustomTypography variant="bodyRegular" fontWeight="medium">
                  {boolToStr(drug.tgaApproved) || '-'}
                </CustomTypography>
              </Item>
            </Box>
          </Box>
        )}
      </Root>
      {openVersionsModal && (
        <DrugVersionsModal
          drug={drug}
          open={openVersionsModal}
          onClose={(): void => setOpenVersionsModal(false)}
        />
      )}
      {openDrugDetailModal && updateActiveTherapyDrugDetail && (
        <DrugDetailModal
          drug={drug}
          open={openDrugDetailModal}
          setOpen={setOpenDrugDetailModal}
          updateActiveTherapyDrugDetail={updateActiveTherapyDrugDetail}
        />
      )}

    </>
  );
}
