import { Box } from '@mui/material';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

interface IProps {
  isModalHeader?: boolean;
}

export default function ChildSVHeader({
  isModalHeader = false,
}: IProps): JSX.Element {
  return (
    <Box
      display="flex"
      gap="16px"
      padding="12px"
    >
      {isModalHeader && (
        <Box width="32px" flexShrink={0} />
      )}
      <CustomTypography
        truncate
        variant="label"
        style={{
          flex: isModalHeader ? 2 : undefined,
          minWidth: isModalHeader ? '110px' : '388px',
          position: !isModalHeader ? 'sticky' : undefined,
          left: !isModalHeader ? '12px' : undefined,
          backgroundColor: '#FFFFFF',
          paddingLeft: !isModalHeader ? '150px' : '0px',
        }}
      >
        Genes
      </CustomTypography>
      <CustomTypography
        truncate
        variant="label"
        style={{
          flex: isModalHeader ? undefined : 1,
          minWidth: '40px',
        }}
      >
        Type
      </CustomTypography>
      <CustomTypography
        truncate
        variant="label"
        style={{
          flex: isModalHeader ? 1 : 4,
          minWidth: '80px',
        }}
      >
        Fusion Start
      </CustomTypography>
      <CustomTypography
        truncate
        variant="label"
        style={{
          flex: isModalHeader ? 1 : 4,
          minWidth: '80px',
        }}
      >
        Fusion End
      </CustomTypography>
      <CustomTypography
        truncate
        variant="label"
        style={{
          flex: isModalHeader ? 1 : 3,
          minWidth: '80px',
        }}
      >
        RNA Confidence
      </CustomTypography>
      {isModalHeader && (
        <Box width="79px" flexShrink={0} />
      )}
      {!isModalHeader && (
        <>
          <CustomTypography truncate variant="label" style={{ flex: 2 }}>
            Platforms
          </CustomTypography>
          <CustomTypography truncate variant="label" style={{ flex: 2 }}>
            Inframe
          </CustomTypography>
        </>
      )}
    </Box>
  );
}
