import { Box } from '@mui/material';
import { ITSNEDataPoint } from '@/types/RNAseq.types';
import { corePalette } from '@/themes/colours';
import NivoTooltipWrapper from '../../Common/Nivo/TooltipWrapper';
import CustomTypography from '../../Common/Typography';

import type { JSX } from "react";

interface ITooltipProps {
  node: {
    data: ITSNEDataPoint;
  };
  color?: string;
}

export function TSNETooltip({ node, color }: ITooltipProps): JSX.Element {
  return (
    <div style={{ transform: 'translate(0px, 210px)' }}>
      <NivoTooltipWrapper
        renderContent={(): JSX.Element => (
          <>
            <Box
              sx={{
                mb: 1,
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {node.data.label}
            </Box>
            <hr style={{ border: `1px solid ${corePalette.grey30}`, margin: '12px 0' }} />
            <Box
              sx={{ mb: 0.5 }}
              display="flex"
              alignItems="center"
              gap="8px"
            >
              <CustomTypography
                variant="label"
                color={corePalette.grey100}
                sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
              >
                ZERO2 Subcategory 2
              </CustomTypography>
              <Box
                display="flex"
                alignItems="center"
                gap="4px"
                padding="4px 8px"
                sx={{
                  backgroundColor: corePalette.white,
                  borderRadius: '4px',
                  boxShadow: `0 1px 2px ${corePalette.offBlack200}33`,
                  whiteSpace: 'nowrap',
                }}
              >
                <Box
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color || corePalette.grey30,
                  }}
                />
                <span>{node.data.zero2Subcategory2}</span>
              </Box>
            </Box>
            <Box sx={{ mb: 0.5, whiteSpace: 'nowrap' }}>
              <CustomTypography
                variant="label"
                color={corePalette.grey100}
                sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
              >
                ZERO2 Final Diagnosis
              </CustomTypography>
              {' '}
              <span>{node.data.zero2FinalDiagnosis}</span>
            </Box>
            <Box sx={{ mb: 0.5 }}>
              <CustomTypography
                variant="label"
                color={corePalette.grey100}
                sx={{ whiteSpace: 'nowrap' }}
              >
                X
              </CustomTypography>
              {' '}
              <span style={{ fontWeight: 'bold' }}>{node.data.x?.toFixed(2)}</span>
            </Box>
            <Box sx={{ mb: 0.5 }}>
              <CustomTypography
                variant="label"
                color={corePalette.grey100}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Y
              </CustomTypography>
              {' '}
              <span style={{ fontWeight: 'bold' }}>{node.data.y?.toFixed(2)}</span>
            </Box>
          </>
        )}
        style={{
          border: 'none',
          borderRadius: '8px',
          boxShadow: `0px 4px 12px ${corePalette.offBlack200}33`,
          padding: '12px',
        }}
      />
    </div>
  );
}
