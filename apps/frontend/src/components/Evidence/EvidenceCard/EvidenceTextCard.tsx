import { Box, IconButton, Link } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useState, type JSX } from 'react';
import { ArrowUpRightIcon, XIcon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import { getCitationId } from '@/utils/functions/pubmed/getCitationId';
import useEvidences from '../../../api/useEvidences';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { ICitationWithMeta } from '../../../types/Evidence/Citations.types';
import {
  Evidence,
  isCitation, isResource,
} from '../../../types/Evidence/Evidences.types';
import { IResourceWithMeta } from '../../../types/Evidence/Resources.types';
import { IDownloadURL } from '../../../types/FileTracker/FileTracker.types';
import ImageThumbnail from '../../Common/ImageThumbnail';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  root: {
    boxSizing: 'border-box',
    padding: '0px',
    width: '100%',
    gap: '8px',
  },
  headerText: {
    height: '24px',
    color: '#022034',
  },
  sourceText: {
    minHeight: '20px',
    width: '100%',
    maxWidth: '100%',
    fontWeight: 700,
    color: '#273957',
  },
  linkText: {
    color: corePalette.green100,
    minHeight: '20px',
    maxWidth: '100%',
    padding: '0px',
    gap: '4px',
    display: 'flex',
  },
  image: {
    width: 'unset',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& img': {
      maxHeight: '200px',
      width: 'unset',
    },
  },
}));

interface IEvidenceTextCardProps {
  readonly?: boolean;
  evidenceId: string;
  evidence?: Evidence;
  initialUrl?: IDownloadURL;
  onDelete?: () => void;
}

export default function EvidenceTextCard({
  readonly,
  evidenceId,
  evidence,
  initialUrl,
  onDelete,
}: IEvidenceTextCardProps):JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { getEvidenceById } = useEvidences();

  const [citation, setCitation] = useState<ICitationWithMeta | undefined>(
    evidence && isCitation(evidence) ? evidence : undefined,
  );
  const [resource, setResource] = useState<IResourceWithMeta | undefined>(
    evidence && isResource(evidence) ? evidence : undefined,
  );
  const [url, setUrl] = useState<IDownloadURL | undefined>(initialUrl);

  const getAuthors = (authors: string): string => {
    const authorsArr = authors.split(',').map((a) => a.trim().replace(/\.$/, ''));
    const authorsStr = `${authorsArr.filter((a, i) => i < 3).join(', ')}${authorsArr.length > 3 ? ', et al' : ''}`;
    return authorsStr.includes('et al')
      ? authorsStr
      : authorsStr.replace(/,([^,]*)$/, ' and $1');
  };

  const getPublication = (publication: string): ReactNode => {
    const matches = publication.split(',');
    if (matches.length > 1) {
      return `, ${matches[0]}, ${matches[1]}`;
    }

    if (matches[0]) {
      return `, ${matches[0]}`;
    }

    return '';
  };

  const getCitation = (currCitation: ICitationWithMeta): JSX.Element => {
    const bottomText = (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="flex-start"
        justifyContent="center"
      >
        <CustomTypography className={classes.sourceText} variant="bodySmall">
          {`${getAuthors(currCitation.authors || '')}. `}
          {`(${currCitation.year}). `}
          {`${currCitation.title.replace(/\.$/, '')}`}
          {getPublication(currCitation.publication || '')}
          {getCitationId(currCitation.source, currCitation.externalId)}
        </CustomTypography>
        {currCitation.link && (
          <ArrowUpRightIcon />
        )}
      </Box>
    );

    if (!currCitation.link) {
      return bottomText;
    }

    return (
      <Link
        rel="noopener noreferrer"
        href={currCitation.link.replace(/^((https?):\/\/)?/, 'https://')}
        className={classes.linkText}
        target="_blank"
      >
        {bottomText}
      </Link>
    );
  };

  const getResource = (currResource: IResourceWithMeta): JSX.Element => {
    const bottomText = (
      <CustomTypography className={classes.sourceText} variant="bodySmall" truncate>
        {currResource.type === 'LINK' ? currResource.url : currResource.name}
      </CustomTypography>
    );

    if (currResource.type === 'IMG') {
      return (
        <>
          <ImageThumbnail
            headerTitle={currResource.name}
            imageUrl={url?.url || ''}
            className={classes.image}
          />
          <CustomTypography className={classes.sourceText} variant="bodySmall">
            {currResource.name}
          </CustomTypography>
        </>
      );
    }

    return (
      <Link
        rel="noopener noreferrer"
        href={
          currResource.type === 'LINK'
            ? currResource?.url?.replace(/^((https?):\/\/)?/, 'https://')
            : url?.url
        }
        className={classes.linkText}
        target="_blank"
      >
        {bottomText}
        <ArrowUpRightIcon />
      </Link>
    );
  };

  useEffect(() => {
    if (!evidence) {
      getEvidenceById(evidenceId)
        .then((resp) => {
          if (resp && isCitation(resp)) setCitation(resp);
          if (resp && isResource(resp)) setResource(resp);
        });
    }
  }, [evidence, evidenceId, getEvidenceById]);

  useEffect(() => {
    if (!initialUrl && (resource?.type === 'IMG' || resource?.type === 'PDF') && resource.fileId) {
      zeroDashSdk.filetracker.downloadFile(resource.fileId)
        .then((resp) => {
          const newUrl = {
            fileId: resource.fileId as string,
            fileName: resource.name,
            url: URL.createObjectURL(resp),
          };
          setUrl(newUrl);
          if (resource.fileId) {
            sessionStorage.setItem(
              resource.fileId,
              JSON.stringify({ ...newUrl, expiry: dayjs().add(1, 'hour').toISOString() }),
            );
          }
        });
    }
  }, [
    initialUrl,
    resource?.fileId,
    resource?.name,
    resource?.type,
    zeroDashSdk.filetracker,
  ]);

  return (
    <Box
      className={classes.root}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      position="relative"
    >
      {onDelete && !readonly && (
        <IconButton
          onClick={onDelete}
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
          }}
          size="small"
        >
          <XIcon size="18px" />
        </IconButton>
      )}
      {/* Evidences */}
      {citation && (
        getCitation(citation)
      )}
      {resource && (
        getResource(resource)
      )}
    </Box>
  );
}
