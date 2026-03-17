import { corePalette } from '@/themes/colours';
import {
  Divider,
  IconButton,
  Link,
  ListItemSecondaryAction,
} from '@mui/material';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import {
  ArrowUpRightIcon,
  BookOpenTextIcon, NewspaperIcon,
  QuoteIcon,
  Trash2Icon,
} from 'lucide-react';
import { ReactElement, type JSX } from 'react';
import { CitationSource } from '../../../../types/Evidence/Citations.types';
import { ICitationWithEvidence, IEvidenceActions } from '../../../../types/Evidence/Evidences.types';
import CustomTypography from '../../../Common/Typography';

interface IListItemProps {
  citation: ICitationWithEvidence;
  evidenceSelectButton?: ReactElement<any>;
  onDelete?: () => void;
  onClick?: () => void;
  permissions?: IEvidenceActions;
}

const useStyles = makeStyles(() => ({
  container: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiListItem-container': {
      listStyleType: 'none',
    },
  },
  list: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: 30,
    paddingBottom: 30,
    minHeight: '92px',
    cursor: 'pointer',
    listStyleType: 'none',
  },
  link: {
    display: 'flex',
    flexDirection: 'row',
    color: corePalette.green100,
    textDecoration: 'underline',
  },
  divider: {
    border: '1px dashed #D0D9E2',
    opacity: '0.24',
    width: '100%',
  },
}));

function CitationListItem({
  citation,
  onDelete,
  evidenceSelectButton,
  onClick,
  permissions,
}: IListItemProps): ReactElement<any> {
  const classes = useStyles();

  const getCitationIcon = (source: CitationSource): JSX.Element => {
    switch (source) {
      case 'BOOK':
        return <BookOpenTextIcon />;
      case 'JOURNAL':
        return <NewspaperIcon />;
      default:
        return <QuoteIcon />;
    }
  };

  const getCitationTitle = (
    title: string,
    link: string | undefined,
  ): ReactElement<any> => {
    const titleText = (
      <CustomTypography variant="bodyRegular" color="inherit">
        {`${title} `}
        <ArrowUpRightIcon style={{ display: 'inline' }} />
      </CustomTypography>
    );

    if (!link) {
      return titleText;
    }
    return (
      <Link href={link} className={classes.link} target="_blank">
        {titleText}
      </Link>
    );
  };

  const canDelete = (): boolean => (
    Boolean(
      permissions?.delete
      && onDelete,
    )
  );

  const {
    title,
    source,
    link,
    authors,
    publication,
    year,
    externalId,
    createdAt,
  } = citation;

  let titlePrefix;
  if (source === 'PUBMED' || source === 'PMC') {
    titlePrefix = `${source === 'PUBMED' ? 'PMID' : 'PMC'}: ${externalId} | `;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
      className={classes.container}
    >
      <ListItem className={classes.list} onClick={onClick}>
        <ListItemAvatar>{getCitationIcon(source)}</ListItemAvatar>
        <Box display="flex" flexDirection="column" style={{ width: '100%' }}>
          <ListItemText style={{ width: '100%', maxWidth: 'calc(100% - 75px)' }}>
            {getCitationTitle(
              `${titlePrefix || ''}${title}`,
              link,
            )}
            {authors && (
              <CustomTypography truncate>
                <b>Author:</b>
                {' '}
                {authors}
              </CustomTypography>
            )}

            {publication && (
              <CustomTypography truncate>
                <b>Publication:</b>
                {' '}
                {publication}
              </CustomTypography>
            )}
            {year && (
              <CustomTypography>
                <b>Year:</b>
                {' '}
                {year}
              </CustomTypography>
            )}
          </ListItemText>
          <ListItemText>
            <CustomTypography variant="bodySmall">
              added on&nbsp;
              {dayjs(createdAt).format('DD/MM/YYYY, hh:mm a')}
            </CustomTypography>
          </ListItemText>
        </Box>
        <ListItemSecondaryAction
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column-reverse',
            width: '48px',
          }}
        >
          {evidenceSelectButton}
          {canDelete() && (
            <IconButton
              onClick={(): void => {
                if (onDelete) onDelete();
              }}
            >
              <Trash2Icon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
      <Divider className={classes.divider} />
    </Box>
  );
}

export default CitationListItem;
