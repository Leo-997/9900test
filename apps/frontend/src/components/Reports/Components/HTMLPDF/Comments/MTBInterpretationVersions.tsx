import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useState, type JSX } from 'react';
import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { AutoWidthSelect } from '@/components/Input/Select/AutoWidthSelect';
import { DiffEditor } from '@/components/plate-ui/Editor/diff-editor';
import { useUser } from '@/contexts/UserContext';
import { ICommentVersion } from '@/types/Comments/ClinicalComments.types';

interface IProps {
  open: boolean;
  onClose: () => void;
  versions: ICommentVersion[];
}

export function MTBInterpretationVersions({
  open,
  onClose,
  versions,
}: IProps): JSX.Element {
  const { users } = useUser();

  const [selectedAnotherVersion, setSelectedAnotherVersion] = useState<ICommentVersion | undefined>(
    versions[1],
  );
  const [selectedCurrentVersion, setSelectedCurrentVersion] = useState<ICommentVersion | undefined>(
    versions[0],
  );

  const formatName = (createdBy?: string, at?: string): string => {
    const user = users.find((u) => u.id === createdBy);
    return user ? `Created by ${user.givenName} ${user.familyName} ${
      dayjs(at).format('[on] DD/MM/YYYY [at] h:mm A')
    }` : '';
  };

  return (
    <CustomModal
      title="Compare versions"
      open={open}
      onClose={onClose}
      showActions={{ cancel: false, confirm: false, secondary: false }}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          gap="24px"
          padding="0px 24px"
        >
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label">
                Selected Version
              </CustomTypography>
              <AutoWidthSelect
                value={selectedCurrentVersion?.id}
                options={versions.map((v) => ({
                  name: formatName(v.createdBy, v.createdAt),
                  value: v.id,
                }))}
                onChange={(e): void => setSelectedCurrentVersion(
                  versions.find((v) => v.id === e.target.value),
                )}
              />
            </Box>
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label">
                Compare to Version
              </CustomTypography>
              <AutoWidthSelect
                value={selectedAnotherVersion?.id}
                options={versions.map((v) => ({
                  name: formatName(v.createdBy, v.createdAt),
                  value: v.id,
                }))}
                onChange={(e): void => setSelectedAnotherVersion(
                  versions.find((v) => v.id === e.target.value),
                )}
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection="column">
            <CustomTypography>
              Changes between versions
            </CustomTypography>
            <DiffEditor
              current={selectedCurrentVersion?.comment || ''}
              another={selectedAnotherVersion?.comment || ''}
              hideComments={false}
              hideEvidence
            />
          </Box>
        </Box>
      )}
    />
  );
}
