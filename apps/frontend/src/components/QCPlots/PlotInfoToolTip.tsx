import {
  Box,
  ClickAwayListener,
  IconButton,
  Popper,
  PopperPlacementType,
  styled,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import { makeStyles } from '@mui/styles';
import { ChevronDownIcon, Info, XIcon } from 'lucide-react';
import React, { useState, type JSX } from 'react';
import CustomTypography from '../Common/Typography';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';

export type PlotLegendItem = {
  title: string;
  summary: string;
  content: string;
};

type PlotInfoProps = {
  legendTitle: string;
  legendData: PlotLegendItem[];
  popperPlacement?: PopperPlacementType;
  className?: string;
};

const AccordionSummary = styled(MuiAccordionSummary)(() => ({
  '& .MuiAccordionSummary-content': {
    paddingLeft: 0,
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 0,
    height: 70,
    '&.Mui-expanded': {
      height: 40,
    },
  },
}));

const useStyles = makeStyles(() => ({
  root: {
    width: 684,
    marginRight: 40,
    zIndex: 2500,
    backgroundColor: '#FFF',
    boxShadow: '0 12px 28px rgba(18, 47, 92, 0.12)',
    borderRadius: 4,
  },
  container: {
    margin: 16,
    overflow: 'auto',
  },
  header: {
    height: 60,
  },

  accordionTitle: {
    fontWeight: 500,
    marginBottom: 10,
  },
  accordionExpanded: {
    backgroundColor: '#F3F7FF',
  },
  summaryRoot: {
    paddingLeft: 0,
    alignItems: 'flex-start',
  },
  summaryDefault: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 0,
    height: 110,
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '100%',
    margin: 0,
    marginRight: 20,
  },
  summaryExpanded: {
    height: 40,
  },
  accordionDetails: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    paddingBottom: 26,
  },
}));

export default function PlotInfoToolTip({
  legendTitle,
  legendData,
  popperPlacement,
  className,
}: PlotInfoProps): JSX.Element {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleOpenInfo = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    setOpenInfo(true);
  };

  const handleCloseInfo = (): void => {
    setAnchorEl(null);
    setOpenInfo(false);
  };

  return (
    <>
      <IconButton onClick={handleOpenInfo} className={className}>
        <Info />
      </IconButton>
      <Popper
        open={openInfo}
        anchorEl={anchorEl}
        placement={popperPlacement ?? 'left-start'}
        className={classes.root}
      >
        <ClickAwayListener onClickAway={handleCloseInfo}>
          <div className={classes.container}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              className={classes.header}
            >
              <CustomTypography variant="h5">{legendTitle}</CustomTypography>
              <IconButton onClick={handleCloseInfo}>
                <XIcon />
              </IconButton>
            </Box>
            <ScrollableSection style={{ height: '100%', maxHeight: 650 }}>
              {legendData.length === 1 ? (
                <>
                  <CustomTypography
                    variant="label"
                    className={classes.accordionTitle}
                  >
                    {legendData[0].title}
                  </CustomTypography>
                  {legendData[0].content
                  && legendData[0].content.split('\n').map((content) => (
                    <CustomTypography variant="bodyRegular" display="block" style={{ marginTop: 15 }}>
                      {content}
                    </CustomTypography>
                  ))}
                </>
              ) : (
                legendData.map(({ title, summary, content }) => (
                  <>
                    <hr className={classes.hairline} />
                    <Accordion
                      expanded={expanded === title}
                      onChange={(e, isExpanded): void => setExpanded(isExpanded ? title : false)}
                      style={{ margin: 0, paddingLeft: 8, paddingRight: 8 }}
                      classes={{ expanded: classes.accordionExpanded }}
                      elevation={0}
                      key={title}
                    >
                      <AccordionSummary
                        expandIcon={(
                          <IconButton>
                            <ChevronDownIcon />
                          </IconButton>
                        )}
                      >
                        <CustomTypography
                          variant="label"
                          className={classes.accordionTitle}
                        >
                          {title}
                        </CustomTypography>
                        {!(expanded === title) && (
                          <CustomTypography variant="bodyRegular">{summary}</CustomTypography>
                        )}
                      </AccordionSummary>
                      <AccordionDetails className={classes.accordionDetails}>
                        {content
                        && content.split('\n').map((c) => (
                          <CustomTypography variant="bodyRegular" display="block">
                            {c}
                          </CustomTypography>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </>
                )))}
            </ScrollableSection>
          </div>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
