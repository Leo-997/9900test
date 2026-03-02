import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { corePalette } from '@/themes/colours';
import { Box, styled } from '@mui/material';
import dnaImage from '../../../../../images/GermlineNFReport/germlineNFDNA.png';
import dnaSearch from '../../../../../images/GermlineNFReport/germlineNFDNASearch.png';
import familyImage from '../../../../../images/GermlineNFReport/germlineNFFamily.png';
import treeImage from '../../../../../images/GermlineNFReport/germlineNFTree.png';
import CustomTypography from '../../../../Common/Typography';

import type { JSX } from "react";

const Root = styled(Box)(() => ({
  gap: '16px',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& ul': {
    fontSize: '14px',
    margin: '0px',
  },
}));

const BoxedContent = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.colours.core.grey30}`,
  padding: '8px 16px',
  borderRadius: '8px',
}));

export default function GermlineNFLeaflet(): JSX.Element {
  const { isGeneratingReport } = useReport();

  return (
    <Root
      className="keep-together"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Box display="flex" flexDirection="column">
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
          style={{ marginTop: '16px', marginBottom: '0px' }}
        >
          What does this result mean?
        </CustomTypography>
        <CustomTypography variant="bodySmall">
          The testing did not find any changes (variants) in the
          tested genes related to genetic cancer risk
        </CustomTypography>
      </Box>
      <BoxedContent>
        <CustomTypography variant="bodyRegular" sx={{ marginBottom: '0px', textAlign: 'center', display: 'block' }}>
          This result
          {' '}
          <b>does not</b>
          {' '}
          exclude a genetic cause, given the following:
        </CustomTypography>
        <ul>
          <li>
            There is a small chance that your child has a gene change that cannot be found with
            current testing methods.
          </li>
          <li>
            A gene change may have been found but we do not know what it means - these are
            not routinely reported.
          </li>
          <li>
            There may be genetic causes of cancer that we have not yet discovered and were not
            checked with this testing.
          </li>
        </ul>
      </BoxedContent>
      <Box display="flex" flexDirection="column" alignItems="center">
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
          style={{
            marginBottom: '0px',
            width: '100%',
            textAlign: 'left',
          }}
        >
          Will the ZERO2 Genetic Cancer Risk Study re-check my child’s testing?
        </CustomTypography>
        <Box display="flex" width="90%" justifyContent="space-between">
          <Box width="70%" paddingTop="8px">
            <ul style={{ paddingLeft: '0px', paddingRight: '48px' }}>
              <li>
                The ZERO2 Genetic Cancer Risk Study Team
                may re-check your child&apos;s non-cancer cells
                (germline sample) if new genetic causes of
                cancer are discovered during the study period.
              </li>
              <li>
                Your child&apos;s doctor will update you if the result
                changes, but the chance of this is low.
              </li>
            </ul>
          </Box>
          <Box
            width="30%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <img src={dnaSearch} alt="dna-search" height="150px" />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
          style={{
            marginBottom: '0px',
            width: '100%',
            textAlign: 'left',
          }}
        >
          What is the chance of another childhood cancer happening in our family?
        </CustomTypography>
        <Box display="flex" width="90%" justifyContent="space-between">
          <Box
            width="30%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <img src={treeImage} alt="dna-search" height="150px" />
          </Box>
          <Box width="70%" paddingTop="8px">
            <ul>
              <li>
                Your child&apos;s cancer could have been a &apos;one-off&apos; event, also
                known as a
                {' '}
                <i>sporadic</i>
                {' '}
                cancer.
              </li>
              <li>
                This usually means the chance of a close family
                member getting the same cancer is
                {' '}
                <b><i>not</i></b>
                {' '}
                high.
              </li>
              <li>
                <i>However</i>
                ,
                {' '}
                this can depend on your child&apos;s cancer type and family history.
              </li>
              <li>
                An appointment with a familial cancer service might be useful.
              </li>
              <li>
                <i>Most</i>
                {' '}
                families
                {' '}
                <i>do not</i>
                {' '}
                need to be referred and so your child&apos;s
                doctor will discuss with you if this is recommended.
              </li>
            </ul>
          </Box>
        </Box>
      </Box>
      { !isGeneratingReport ? (
        <div style={{ padding: '10px 40px' }}>
          <div
            style={{
              height: '1px',
              width: '100%',
              backgroundColor: corePalette.grey30,
            }}
          />
        </div>
      ) : (
        <div className="page-break" />
      )}
      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
      >
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
          style={{ marginBottom: '0px' }}
        >
          What are some important points to keep in mind?
        </CustomTypography>
        <BoxedContent
          display="flex"
          width="100%"
          justifyContent="space-around"
          alignItems="center"
        >
          <Box
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <img src={dnaImage} alt="dna-search" height="150px" />
          </Box>
          <Box display="flex" flexDirection="column" width="65%">
            <CustomTypography variant="bodyRegular" fontWeight="bold" style={{ marginBottom: '0px' }}>
              We may discover new cancer genes over time
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              <ul style={{ paddingLeft: '12px' }}>
                <li>
                  Ask your child&apos;s doctors every 3-5 years during their long-
                  term follow-up if a referral to a clinical genetics service is
                  needed.
                </li>
                <li>
                  Once your child is an adult, they can seek updated advice
                  from their doctor/GP if planning a family.
                </li>
              </ul>
            </CustomTypography>
          </Box>
        </BoxedContent>
        <BoxedContent
          display="flex"
          width="100%"
          justifyContent="space-around"
          alignItems="flex-start"
        >
          <Box
            width="15%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <img src={familyImage} alt="dna-search" height="150px" />
          </Box>
          <Box display="flex" flexDirection="column" width="65%">
            <CustomTypography variant="bodyRegular" fontWeight="bold" style={{ marginBottom: '0px' }}>
              Family history information can change over time
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              <ul style={{ paddingLeft: '12px' }}>
                <li>
                  Update your child&apos;s doctor about any family history changes.
                </li>
                <li>
                  This
                  {' '}
                  <i>may</i>
                  {' '}
                  change the recommendations given by your child&apos;s
                  doctor.
                </li>
              </ul>
            </CustomTypography>
          </Box>
        </BoxedContent>
      </Box>
      <Box>
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
          style={{
            marginBottom: '0px',
            width: '100%',
            textAlign: 'center',
            display: 'block',
          }}
        >
          Who can I contact if I have more questions?
        </CustomTypography>
        <ul>
          <li>
            If you would like to discuss your child&apos;s
            testing in the ZERO2 Genetic Cancer Risk Study
            further, your child&apos;s doctor can arrange
            for you to speak to a Study Genetic Counsellor.
          </li>
          <li>
            Genetic Counsellors are specially
            trained health professions who can provide information
            about genetic testing and genetic results.
          </li>
          <li>
            You can also contact the ZERO2 Genetic Cancer Risk Study Team by email:
            <br />
            <CustomTypography variant="bodySmall" style={{ textAlign: 'center', display: 'block' }}>
              <a
                href="mailto:schn-zero2geneticrisk@health.nsw.gov.au"
                style={{
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 'bold',
                }}
              >
                schn-zero2geneticrisk@health.nsw.gov.au
              </a>
            </CustomTypography>
          </li>
        </ul>
      </Box>
    </Root>
  );
}
