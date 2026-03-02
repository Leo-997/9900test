import { CustomTabs } from '@/components/Common/Tabs';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ForwardedRef, forwardRef, useState } from 'react';
import { IMolAlterationSampleDetails } from '../../../../../../../types/MTB/MolecularAlteration.types';
import { TabProps } from '../../../../../../../types/Tabs.types';
import CustomTypography from '../../../../../../Common/Typography';
import CommentPanel from './CommentPanel';

const useStyles = makeStyles(() => ({
  commentSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '24px',
    gap: '24px',
    width: '100%',
    height: '448px',
    background: '#FFFFFF',
  },
  commentHeader: {
    width: '100%',
    height: '24px',
    color: '#030313',
  },
  commentSubSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px 0px 16px',
    gap: '32px',
    width: '100%',
    height: '352px',
  },
  curationBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '8px',
    width: '100%',
    height: '128px',
  },
  curationHeader: {
    width: '100%',
    height: '16px',
    fontWeight: 500,
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    color: '#022034',
  },
  tabs: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px',
    width: '100%',
    minWidth: '759px',
    height: '40px',
    background: 'white',
  },
  tabContent: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px 24px',
    height: '40px',
    color: '#62728C !important',
    minHeight: '40px',
    minWidth: '0px',
    fontWeight: 400,
  },
  tabText: {
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    textTransform: 'none',
  },
  tabActive: {
    borderBottom: '2px solid #006FED',
    color: '#006FED !important',
    fontWeight: 700,
  },
}));

interface IProps {
  data: IMolAlterationSampleDetails;
  isCurrentMolSample?: boolean;
}

const CommentDetail = forwardRef(
  (
    { data, isCurrentMolSample = false }: IProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const classes = useStyles();

    const [tabValue, setTabValue] = useState<string>('comments');

    const tabs: TabProps[] = [
      {
        label: 'Comments',
        to: 'comments',
        children: <CommentPanel comment={data.reportComment} />,
      },
      {
        label: 'End Note encoded',
        to: 'EndNoteEncoded',
        children: <CommentPanel comment="End Note encoded" />,
      },
    ];

    return (
      <div ref={ref}>
        <Box className={classes.commentSection}>
          <CustomTypography variant="h6" fontWeight="bold" className={classes.commentHeader}>
            Comments
          </CustomTypography>
          <Box className={classes.commentSubSection}>
            <Box className={classes.curationBox}>
              <CustomTypography variant="label" className={classes.curationHeader}>
                Molecular curation comment
              </CustomTypography>
              <CommentPanel
                enableAddButton={false}
                comment={data.curationComment}
              />
            </Box>
            {!isCurrentMolSample && (
              <Box
                style={{
                  height: '176px',
                }}
                className={classes.curationBox}
              >
                <CustomTypography
                  variant="label"
                  className={classes.curationHeader}
                >
                  MTB report
                </CustomTypography>

                <CustomTabs
                  variant="sub-navigation"
                  tabs={tabs.map(((tab) => ({ label: tab.label, value: tab.to })))}
                  value={tabValue}
                  onChange={(e, value): void => setTabValue(value)}
                />
                {tabs.find((tab) => tab.to === tabValue)?.children}
              </Box>
            )}
          </Box>
        </Box>
      </div>
    );
  },
);
export default CommentDetail;
