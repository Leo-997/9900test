import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import {
  ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useState,
} from 'react';
import { corePalette } from '@/themes/colours';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { useUser } from '../../../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { ISignatureFile } from '../../../../../types/FileTracker/FileTracker.types';
import { IApproval } from '../../../../../types/Reports/Approvals.types';
import { mapGroupName } from '../../../../../utils/functions/mapGroupName';
import CustomTypography from '../../../../Common/Typography';

const useStyles = makeStyles(() => ({
  signatureBox: {
    minWidth: '200px',

    '& > .MuiTypography-overline': {
      fontSize: '10px !important',
    },
  },
}));

interface ISignaturesProps {
  highlightDate?: boolean;
  // used when generating a redacted version of the report
  overrideApprovals?: IApproval[];
}

export interface ISignaturesRef {
  getApprovedSignatures: (
    callback?: () => Promise<void>,
  ) => Promise<ISignatureFile[]>;
  clearSignatures: () => void;
}

export const Signatures = forwardRef<ISignaturesRef, ISignaturesProps>((
  {
    highlightDate,
    overrideApprovals,
  }: ISignaturesProps,
  ref,
) => {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { users } = useUser();
  const {
    approvals,
    isGeneratingReport,
  } = useReport();

  const [signatures, setSignatures] = useState<ISignatureFile[] | undefined>();
  const [
    signaturesRenderedCallback,
    setSignaturesRenderedCallback,
  ] = useState<(() => void) | undefined>(undefined);

  const getApprovals = (initialApprovals: IApproval[]): IApproval[] => {
    if (overrideApprovals) return overrideApprovals;
    const filteredApprovals = initialApprovals.filter(
      (a) => a.status !== 'rejected' && a.status !== 'cancelled' && a.showOnReport,
    );

    return filteredApprovals;
  };

  const getAssignee = useCallback((approval: IApproval) => (
    users.find((u) => u.id === approval.assigneeId)
  ), [users]);

  const getUserSignature = useCallback((approval: IApproval): ReactNode => {
    const assignee = getAssignee(approval);
    if (assignee) {
      const sig = signatures?.find((s) => s.userId === approval.assigneeId);
      if (sig?.url) {
        return (
          <img
            src={sig.url}
            alt={`${assignee.givenName} ${assignee.familyName}`}
            style={{
              height: '50px',
            }}
          />
        );
      }
      return `${assignee.givenName} ${assignee.familyName}`;
    }
    return '';
  }, [getAssignee, signatures]);

  useImperativeHandle(ref, () => ({
    getApprovedSignatures: async (
      callback?: () => void,
    ): Promise<ISignatureFile[]> => {
      const signatureFiles = await zeroDashSdk.filetracker.getUserSignatures(
        (overrideApprovals || approvals).map((a) => a.assigneeId || ''),
      );
      const sigs: ISignatureFile[] = [];
      const promises: Promise<void>[] = [];
      for (const s of signatureFiles) {
        promises.push(
          zeroDashSdk.filetracker.downloadSignatureFile(s.fileId)
            .then(async (image) => {
              sigs.push({
                ...s,
                url: URL.createObjectURL(image),
                blob: image,
                buffer: await image.arrayBuffer(),
              });
            }),
        );
      }
      await Promise.all(promises);
      setSignaturesRenderedCallback(() => callback);
      setSignatures(sigs);
      return sigs;
    },
    clearSignatures: (): void => {
      signatures?.forEach((s) => {
        if (s.url) URL.revokeObjectURL(s.url);
      });
      setSignatures(undefined);
    },
  }));

  const getUserTitle = (approval: IApproval): string => {
    const assignee = getAssignee(approval);

    if (assignee?.title) return assignee.title;

    if (approval.groupName) return mapGroupName(approval.groupName).replace(/s$/, '');

    return '';
  };

  const getApprovalDate = (approval: IApproval): string => {
    if (overrideApprovals) {
      return dayjs(approval.approvedAt).format('DD/MM/YYYY');
    }

    if (isGeneratingReport) {
      return dayjs().format('DD/MM/YYYY');
    }

    if (approval.approvedAt) {
      return '';
    }

    return 'Pending approval';
  };

  useEffect(() => {
    if (signatures && signaturesRenderedCallback) {
      signaturesRenderedCallback();
    }
  }, [signatures, signaturesRenderedCallback]);

  return (
    <Grid container direction="row" wrap="nowrap" justifyContent="space-between" className="keep-together">
      {approvals && getApprovals(approvals).map((approval) => (
        <Box
          key={approval.id}
          display="flex"
          flexDirection="column"
          className={classes.signatureBox}
        >
          <CustomTypography variant="label" sx={{ fontSize: '10px' }}>
            <span>{approval.label || 'Authorised by'}</span>
          </CustomTypography>
          <CustomTypography variant="bodyRegular" sx={{ fontSize: '13px', minHeight: '24px' }}>
            <span
              style={{
                height: isGeneratingReport ? '75px' : undefined,
                width: isGeneratingReport ? '200px' : undefined,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {getUserSignature(approval)}
            </span>
          </CustomTypography>
          <CustomTypography variant="bodySmall" sx={{ fontSize: '13px' }}>
            <span style={{ color: corePalette.grey100 }}>
              Signed on:
              &nbsp;
            </span>
            <span style={{ background: highlightDate ? corePalette.yellow50 : undefined }}>
              { getApprovalDate(approval) }
            </span>
          </CustomTypography>
          <CustomTypography variant="label" sx={{ marginTop: '40px', fontSize: '10px' }}>
            <span>{getUserTitle(approval)}</span>
          </CustomTypography>
          <CustomTypography variant="bodyRegular" sx={{ fontSize: '13px' }}>
            <span>
              {getAssignee(approval)?.givenName}
              {' '}
              {getAssignee(approval)?.familyName}
            </span>
          </CustomTypography>
        </Box>
      ))}
    </Grid>
  );
});
Signatures.displayName = 'Signatures';
