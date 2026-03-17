import { useEffect, useState, type JSX } from 'react';

import { makeStyles } from '@mui/styles';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import GraphPanel from '../MutationalSignatures/GraphPanel';
import SignaturePanel from '../MutationalSignatures/SignaturePanel';

import { ISignatureData, IUpdateSignature } from '../../types/MutationalSignatures.types';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import getVariantId from '../../utils/functions/getVariantId';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import SignatureModal from '../MutationalSignatures/SignatureModal';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';

const useStyles = makeStyles(() => ({
  wrapper: {
    maxHeight: 'calc(100vh - 160px)',
    width: '100%',
  },
  sectionWrapper: {
    width: '100%',
  },
}));

export default function MutationalSignaturesTabContent(): JSX.Element {
  const classes = useStyles();
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { tumourBiosample } = useAnalysisSet();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<ISignatureData>();
  const [sigs, setSigs] = useState<ISignatureData[]>([]);

  useEffect(() => {
    async function getUrlSigId(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.mutsig.getSignatureById(
          tumourBiosample.biosampleId,
          variantId,
        );
        setNotifItem(data);
        setExpanded(true);
      }
    }
    getUrlSigId();
  }, [tumourBiosample?.biosampleId, search, zeroDashSdk.mutsig]);

  useEffect(() => {
    async function getSigData(): Promise<void> {
      if (tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.mutsig.getSignatures(
          tumourBiosample.biosampleId,
        );
        setSigs(data);
      }
    }

    getSigData();
  }, [tumourBiosample?.biosampleId, zeroDashSdk.mutsig]);

  const handleUpdateSignature = async (body: IUpdateSignature): Promise<void> => {
    if (tumourBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.mutsig.updateSignature(
          newBody,
          notifItem.signature,
          tumourBiosample.biosampleId,
        );
        setSigs((prev) => prev.map((sig) => ({
          ...sig,
          ...(notifItem.signature === sig.signature
            ? newBody
            : {}),
        })));
      } catch {
        enqueueSnackbar('Cannot update signature data, please try again', { variant: 'error' });
      }
    }
  };

  return (
    <ScrollableSection className={classes.wrapper}>
      <GraphPanel />
      <ScrollableSection className={classes.sectionWrapper}>
        {sigs.map((sig: ISignatureData) => (
          <SignaturePanel
            data={sig}
            setData={setSigs}
            key={sig.signature}
          />
        ))}
      </ScrollableSection>
      {expanded && tumourBiosample && notifItem && (
      <ExpandedModal
        open={expanded}
        variantId={notifItem.signature}
        biosampleId={tumourBiosample.biosampleId}
        handleClose={(): void => setExpanded(false)}
        title="SIGNATURE"
        titleContent={`Signature ${notifItem.signature.replace('sig', '')}`}
        curationDataComponent={(
          <SignatureModal
            data={notifItem}
            handleUpdateData={handleUpdateSignature}
          />
      )}
        variant={notifItem}
        handleUpdateVariant={handleUpdateSignature}
        hideIncludeInReport
        variantType="MUTATIONAL_SIG"
      />
      )}
    </ScrollableSection>
  );
}
