import { Box, Link, Theme } from '@mui/material';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { ReactElement, useEffect, useState } from 'react';

import { createStyles, makeStyles } from '@mui/styles';
import axios from 'axios';
import { ArrowUpRightIcon, LinkIcon } from 'lucide-react';
import { VariantType } from '@/types/misc.types';
import { corePalette } from '@/themes/colours';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles<Theme, {}>((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
  },
  link: {
    color: '#1E86FC',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  arrowIcon: {
    color: '#1E86FC',
    marginLeft: '10px',
    verticalAlign: 'text-bottom',
    transform: 'matrix(-0.71, 0.71, 0.71, 0.71, 0, 0)',
  },
  list: {
    paddingTop: 30,
    paddingBottom: 30,
    width: '100%',
    minHeight: '92px',
  },
  divider: {
    border: '1px dashed #263238',
    opacity: '0.24',
    width: '100%',
  },
  barWrapper: {
    width: '100%',
    height: '54px',
    marginBottom: '14px',
    borderRadius: '0px 4px 4px 4px',
    boxSizing: 'border-box',
    border: '1px solid #fff',
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
    marginTop: '15px',
    padding: '5px',
  },
  search: {
    ...theme.typography.body2,
    position: 'relative',
    borderRadius: '0px 0px 4px 4px',
    border: '1px solid #FFFFFF',
    boxSizing: 'border-box',
    boxShadow: 'none',
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  searchContainer: {
    order: 3,
    margin: '7px 32px 7px 0px',
  },
  iconButton: {
    order: 1,
    '& + *': {
      order: 2,
    },
    color: 'black',
  },
  noData: {
    height: '100%',
    paddingLeft: '10%',
    paddingRight: '10%',
    paddingTop: '20%',
  },
  noDataText: {
    color: '#8292A6',
    textAlign: 'center',
  },
}));

interface ILinkProps {
  variantType: VariantType;
  genomeLink?: string;
  ucscData?: any;
  pecanLink?: any;
  varSomeLink?: string;
  civic?: { gene?: string; variant?: string };
  geneCard?: string | string[];
  genome?: string;
  oncokbLink?: string;
  cosmic?: string;
}

interface IUcscLinkProps {
  chromosome1: string;
  breakpoint1: number;
  breakpoint2: number;
}

interface IUcscLinkMultiProps {
  chromosome1: string;
  chromosome2: string;
  breakpoint1: number;
  breakpoint2: number;
  id: string;
}
function LinkResourceTab({
  variantType,
  genomeLink,
  ucscData = {},
  pecanLink,
  varSomeLink,
  civic,
  geneCard,
  oncokbLink,
  cosmic,
}: ILinkProps): ReactElement<any> {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [civicInfo, setCivicInfo] = useState({ geneId: null, variantId: null });

  const getGenomeUcscLink = ({
    chromosome1,
    breakpoint1,
    breakpoint2,
  }: IUcscLinkProps): string => `https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=${chromosome1}%3A${breakpoint1}%2D${breakpoint2}&hgsid=1099661393_dJR5nlmty67oW7dGEW0aUGrw3dQc`;

  const getGenomeUcscMultiRegion = async ({
    chromosome1,
    chromosome2,
    breakpoint1,
    breakpoint2,
    id,
  }: IUcscLinkMultiProps): Promise<string | undefined> => {
    try {
      const url = variantType === 'GERMLINE_SV'
        ? await zeroDashSdk.sv.germline.createAndGetBedFile(id, [
          { chr: chromosome1, pos1: breakpoint1 - 30, pos2: breakpoint1 + 30 },
          { chr: chromosome2, pos1: breakpoint2 - 30, pos2: breakpoint2 + 30 },
        ])
        : await zeroDashSdk.sv.somatic.createAndGetBedFile(id, [
          { chr: chromosome1, pos1: breakpoint1 - 30, pos2: breakpoint1 + 30 },
          { chr: chromosome2, pos1: breakpoint2 - 30, pos2: breakpoint2 + 30 },
        ]);

      if (url) {
        const link = `https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&virtModeType=customUrl&virtMode=1&nonVirtPosition=chr${chromosome1}%3A${breakpoint1}%2D${breakpoint2}&position=multi&multiRegionsBedUrl=${encodeURIComponent(
          url,
        )}`;
        return link;
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  function getPECANLink(hgvs = ''): string {
    const matches = hgvs.match(
      /(\w+(?=:)):(c\.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\s?(\((p\.(.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+))\))?/,
    );
    if (matches) {
      const gene = matches[1];
      return `/proteinpaint/${gene}`;
    }
    return hgvs;
  }

  useEffect(() => {
    if (civic?.gene) {
      axios.get(`https://civicdb.org/api/genes/${civic.gene}?identifier_type=entrez_symbol`)
        .then((res: any) => {
          let variantId = res.data.variants[0]?.id || null;
          if (civic?.variant) {
            for (const variant of res.data.variants) {
              const variantName = civic.variant.replace(/[a-z]/g, '');
              if (variantName.includes(variant.name.toUpperCase()) || variant.name.toUpperCase().includes(variantName)) {
                variantId = variant.id;
              }
            }
          }
          setCivicInfo({ geneId: res.data.id, variantId });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [civic]);

  return (
    <div className={classes.root}>
      <Grid size={12}>
        <div className={classes.demo}>
          <List style={{ width: '100%', paddingTop: '0px' }}>
            {genomeLink && (
            <>
              <ListItem className={classes.list}>
                <ListItemAvatar><LinkIcon /></ListItemAvatar>
                <Link
                  // Uncomment when proteinpaint is ready
                  // href={`http://proteinpaint.ccimr.cloud:3000/${genomeLink}`}
                  className={classes.link}
                  target="_blank"
                >
                  <CustomTypography variant="bodyRegular">
                    Genome Paint
                    <ArrowUpRightIcon
                      color={corePalette.blue100}
                      style={{ marginLeft: 10 }}
                    />
                  </CustomTypography>
                </Link>
              </ListItem>
              <Divider className={classes.divider} />
            </>
            )}

            {Object.keys(ucscData).length > 0 ? (
              <>
                <ListItem className={classes.list}>
                  <ListItemAvatar><LinkIcon /></ListItemAvatar>

                  {ucscData?.chrBkpt1 === ucscData?.chrBkpt2 ? (
                    <Link
                      href={getGenomeUcscLink({
                        chromosome1: ucscData?.chrBkpt1,
                        breakpoint1: ucscData?.posBkpt1,
                        breakpoint2: ucscData?.posBkpt2,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <CustomTypography variant="bodyRegular">
                        UCSC
                        <ArrowUpRightIcon
                          color={corePalette.blue100}
                          style={{ marginLeft: 10 }}
                        />
                      </CustomTypography>
                    </Link>
                  ) : (
                    <Link
                      onClick={() => {
                        if (ucscData.chrBkpt1 && ucscData.chrBkpt2 && ucscData.posBkpt1 && ucscData.posBkpt2) {
                          getGenomeUcscMultiRegion({
                            chromosome1: ucscData?.chrBkpt1,
                            chromosome2: ucscData?.chrBkpt2,
                            breakpoint1: ucscData?.posBkpt1,
                            breakpoint2: ucscData?.posBkpt2,
                            id: 'sampleId' in ucscData ? ucscData?.sampleId : ucscData?.matchedNormalId,
                          }).then((url) => window.open(url, '_blank'));
                        }
                      }}
                      className={classes.link}
                    >
                      <CustomTypography variant="bodyRegular">
                        Multi Region
                        <ArrowUpRightIcon
                          color={corePalette.blue100}
                          style={{ marginLeft: 10 }}
                        />
                      </CustomTypography>
                    </Link>
                  )}
                </ListItem>
                <Divider className={classes.divider} />
              </>
            ) : null}

            {pecanLink && (
            <>
              <ListItem className={classes.list}>
                <ListItemAvatar><LinkIcon /></ListItemAvatar>
                <Link
                  href={`http://pecan.stjude.cloud${getPECANLink(pecanLink)}`}
                  className={classes.link}
                  target="_blank"
                >
                  <CustomTypography variant="bodyRegular">
                    St Jude ProteinPaint
                    <ArrowUpRightIcon
                      color={corePalette.blue100}
                      style={{ marginLeft: 10 }}
                    />
                  </CustomTypography>
                </Link>
              </ListItem>
              <Divider className={classes.divider} />
            </>
            )}

            {varSomeLink && (
            <ListItem className={classes.list}>
              <ListItemAvatar><LinkIcon /></ListItemAvatar>

              <Link
                href={`https://varsome.com${varSomeLink}`}
                className={classes.link}
                target="_blank"
              >
                <CustomTypography variant="bodyRegular">
                  varsome
                  <ArrowUpRightIcon
                    color={corePalette.blue100}
                    style={{ marginLeft: 10 }}
                  />
                </CustomTypography>
              </Link>
            </ListItem>
            )}

            {civicInfo.geneId && (
            <>
              <Divider className={classes.divider} />
              <ListItem className={classes.list}>
                <ListItemAvatar><LinkIcon /></ListItemAvatar>
                <Link
                  href={`https://civicdb.org${civicInfo.variantId ? `/variants/${civicInfo.variantId}/summary` : `/genes/${civicInfo.geneId}/summary`}`}
                  className={classes.link}
                  target="_blank"
                >
                  <CustomTypography variant="bodyRegular">
                    CIViC
                    <ArrowUpRightIcon
                      color={corePalette.blue100}
                      style={{ marginLeft: 10 }}
                    />
                  </CustomTypography>
                </Link>
              </ListItem>
            </>
            )}

            {geneCard && (
              typeof geneCard === 'string' ? (
                <>
                  <Divider className={classes.divider} />
                  <ListItem className={classes.list}>
                    <ListItemAvatar><LinkIcon /></ListItemAvatar>
                    <Link
                      href={`https://genecards.org/cgi-bin/carddisp.pl?gene=${geneCard}`}
                      className={classes.link}
                      target="_blank"
                    >
                      <CustomTypography variant="bodyRegular">
                        GeneCards
                        <ArrowUpRightIcon
                          color={corePalette.blue100}
                          style={{ marginLeft: 10 }}
                        />
                      </CustomTypography>
                    </Link>
                  </ListItem>
                </>
              ) : (
                geneCard.map((gene) => (
                  <>
                    <Divider className={classes.divider} />
                    <ListItem className={classes.list}>
                      <ListItemAvatar><LinkIcon /></ListItemAvatar>
                      <Link
                        href={`https://genecards.org/cgi-bin/carddisp.pl?gene=${gene}`}
                        className={classes.link}
                        target="_blank"
                      >
                        <CustomTypography variant="bodyRegular">
                          GeneCards (
                          {gene}
                          )
                          <ArrowUpRightIcon
                            color={corePalette.blue100}
                            style={{ marginLeft: 10 }}
                          />
                        </CustomTypography>
                      </Link>
                    </ListItem>
                  </>
                ))
              )
            )}

            {oncokbLink && (
            <>
              <Divider className={classes.divider} />
              <ListItem className={classes.list}>
                <ListItemAvatar><LinkIcon /></ListItemAvatar>
                <Link
                  href={`https://www.oncokb.org${oncokbLink}`}
                  className={classes.link}
                  target="_blank"
                >
                  <CustomTypography variant="bodyRegular">
                    OncoKB
                    <ArrowUpRightIcon
                      color={corePalette.blue100}
                      style={{ marginLeft: 10 }}
                    />
                  </CustomTypography>
                </Link>
              </ListItem>
            </>
            )}

            {cosmic !== undefined && (
            <>
              <Divider className={classes.divider} />
              <ListItem className={classes.list}>
                <ListItemAvatar><LinkIcon /></ListItemAvatar>
                <Link
                  href={`https://cancer.sanger.ac.uk/cosmic${cosmic}`}
                  className={classes.link}
                  target="_blank"
                >
                  <CustomTypography variant="bodyRegular">
                    COSMIC
                    <ArrowUpRightIcon
                      color={corePalette.blue100}
                      style={{ marginLeft: 10 }}
                    />
                  </CustomTypography>
                </Link>
              </ListItem>
              <Divider className={classes.divider} />
            </>
            )}
          </List>
          {!genomeLink && !pecanLink && !varSomeLink && !civic && !oncokbLink && !cosmic && (
          <Box
            display="flex"
            flex={1}
            justifyContent="center"
            className={classes.noData}
          >
            <CustomTypography variant="bodySmall" className={classes.noDataText}>
              No relevant links for this item.
            </CustomTypography>
          </Box>
          )}
        </div>
      </Grid>
    </div>
  );
}
export default LinkResourceTab;
