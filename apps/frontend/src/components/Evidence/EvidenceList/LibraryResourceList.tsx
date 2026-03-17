import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import { createStyles, makeStyles } from '@mui/styles';
import { useMemo, type JSX } from 'react';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '../../../hooks/useIsUserAuthorised';
import { IResourceWithEvidence } from '../../../types/Evidence/Evidences.types';
import EvidenceListItem from './ListItems/EvidenceListItem';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => createStyles({
  root: {
    width: '100%',
  },
  demo: {
    backgroundColor: corePalette.white,
  },
}));

interface IProps {
  listItems: IResourceWithEvidence[];
  onViewResource: (resource: IResourceWithEvidence) => void;
  onDeleteResource: (id: string) => Promise<void>;
  onUpdateResource: (resourceId: string, newResouce: IResourceWithEvidence) => void;
  isReadOnly?: boolean;
}

function LibraryResourceList({
  listItems,
  onViewResource,
  onDeleteResource,
  onUpdateResource,
  isReadOnly = false,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();

  const canUpdate = useIsUserAuthorised('evidence.write') && !isCaseReadOnly;
  const canDelete = useIsUserAuthorised('curation.evidence.write', isAssignedCurator) && !isCaseReadOnly;
  const canDownload = useIsUserAuthorised('evidence.download');

  const permissions = useMemo(() => ({
    // edit translates to updating the MS.
    // Should not care about curation readonly as it is not curation sepcific
    edit: canUpdate,
    delete: !isReadOnly && canDelete,
    download: canDownload,
  }), [canDelete, canDownload, canUpdate, isReadOnly]);

  const handleDeleteEvidence = (resource: IResourceWithEvidence): void => {
    if (resource.internalEvidenceId) {
      onDeleteResource(resource.internalEvidenceId);
    }
  };

  return (
    <div className={classes.root}>
      <Grid size={12}>
        <div className={classes.demo}>
          <List style={{ width: '100%', paddingTop: '0px' }}>
            {listItems.map((resource) => (
              <EvidenceListItem
                key={resource.id}
                evidence={resource}
                onClick={(): void => onViewResource(resource)}
                onDelete={(): void => handleDeleteEvidence(resource)}
                onUpdate={(newResource): void => onUpdateResource(resource.id, newResource)}
                permissions={permissions}
              />
            ))}
          </List>
        </div>
      </Grid>
    </div>
  );
}

export default LibraryResourceList;
