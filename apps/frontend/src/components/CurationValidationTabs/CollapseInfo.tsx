import Box from '@mui/material/Box';
import { useState, type JSX } from 'react';

import { IconButton } from '@mui/material';
import { styled } from '@mui/styles';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CustomTypography from '../Common/Typography';

type Props = {
  reasonNote: string;
};

const Icon = styled(IconButton)(({
  icon: {
    height: 40,
    width: 40,
    position: 'relative',
    top: '-10px',
  },
}));

const TruncatingTypography = styled(CustomTypography)({
  display: '-webkit-box',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WebkitLineClamp: 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export default function CollapseInfo({ reasonNote }: Props): JSX.Element {
  // const classes = useStyles();
  const [isExpanded, setExpanded] = useState<boolean>(false);

  return (
    <Box display="flex" flexDirection="row" style={{ paddingBottom: isExpanded ? 26 : 0 }}>
      <TruncatingTypography
        width="100%"
      >
        <Box
          component="span"
          sx={{
            '& p': {
              margin: 0,
            },
          }}
        >
          <ReactMarkdown>
            {reasonNote || ''}
          </ReactMarkdown>
        </Box>
      </TruncatingTypography>
      <Icon onClick={(): void => setExpanded(!isExpanded)}>
        {isExpanded ? (
          <ChevronUpIcon />
        ) : (
          <ChevronDownIcon />
        )}
      </Icon>
    </Box>
  );
}
