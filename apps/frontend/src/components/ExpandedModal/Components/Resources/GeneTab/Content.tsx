import {
  Box,
  Divider,
  Grid,
  Link,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ArrowUpRightIcon } from 'lucide-react';
import { ReactElement, useState, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import GeneModalIcon from '@/components/CustomIcons/GeneModalIcon';
import { IExtendedGene } from '../../../../../types/Common.types';
import CustomTypography from '../../../../Common/Typography';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
  dashedDivider: {
    border: '1px dashed #263238',
    opacity: '0.24',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  spacing: {
    marginTop: 24,
  },
  header: {
    marginBottom: 8,
  },
  aliasPadding: {
    paddingTop: '4px !important',
    paddingBottom: '4px !important',
  },
  link: {
    color: '#1E86FC',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});

interface IProps {
  gene: IExtendedGene;
  isTabExpanded?: boolean;
}

export function ResourcesGeneTabContent({
  gene,
  isTabExpanded = false,
}: IProps): ReactElement<any> {
  const classes = useStyles();

  const [isAliasExpanded, setIsAliasExpanded] = useState<boolean>(false);

  function getAliasContent(): ReactElement<any> | JSX.Element[] | null {
    if (gene.alias) {
      const aliases = gene.alias.split(/\s*,\s*/);
      if (isAliasExpanded) {
        return aliases.map((val) => (
          <Grid key={val} className={classes.aliasPadding}>
            <CustomTypography variant="bodyRegular">{val}</CustomTypography>
          </Grid>
        ));
      }
      return (
        <>
          {aliases.slice(0, 3).map((val) => (
            <Grid key={val} className={classes.aliasPadding}>
              <CustomTypography variant="bodyRegular">{val}</CustomTypography>
            </Grid>
          ))}
          {aliases.length > 3 && (
            <Grid>
              <CustomTypography
                variant="bodySmall"
                style={{ color: '#273957' }}
                onClick={(): void => setIsAliasExpanded(true)}
              >
                +
                {aliases.length - 3}
                {' '}
                more
              </CustomTypography>
            </Grid>
          )}
        </>
      );
    }
    return null;
  }

  return (
    <ScrollableSection className={classes.root}>
      <Grid padding="0px 16px 16px 16px">
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="h5">Gene nomenclature</CustomTypography>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: isTabExpanded ? 3 : 6 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              GENE SYMBOL
            </CustomTypography>
            <CustomTypography variant="bodyRegular">{gene.gene}</CustomTypography>
          </Grid>
          <Grid size={{ md: isTabExpanded ? 3 : 6 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              GENE IMPORTANCE
            </CustomTypography>
            <Box
              style={{
                display: 'flex',
                width: 82,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <GeneModalIcon
                pathClass=""
                prismClass={gene.prismclass || ''}
                height={30}
                width={30}
              />
              <CustomTypography variant="bodyRegular">
                {gene.importance && gene.importance <= 2 && 'HIGH'}
                {gene.importance
                  && gene.importance > 2
                  && gene.importance <= 5
                  && 'MEDIUM HIGH'}
                {gene.importance
                  && gene.importance > 5
                  && gene.importance <= 9
                  && 'MEDIUM LOW'}
                {gene.importance && gene.importance > 9 && 'LOW'}
              </CustomTypography>
            </Box>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              Official Full Name
            </CustomTypography>
            <CustomTypography variant="bodyRegular">{gene.fullname ?? 'N/A'}</CustomTypography>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              Aliases
            </CustomTypography>
            <Grid
              container
              direction="column"
              spacing={2}
              style={{ marginLeft: 2 }}
            >
              {getAliasContent() ?? 'N/A'}
            </Grid>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="h5">Gene description and summary</CustomTypography>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              Chromosomal Location
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              {gene.chromosome}
              :
              {gene.geneStart}
              -
              {gene.geneEnd}
            </CustomTypography>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              Summary
            </CustomTypography>
            <CustomTypography variant="bodyRegular">{gene.summary ?? 'N/A'}</CustomTypography>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              Expression
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              {gene.expression ?? 'N/A'}
            </CustomTypography>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              GeneCards
            </CustomTypography>
            <Link
              href={`https://genecards.org/cgi-bin/carddisp.pl?gene=${gene.gene}`}
              className={classes.link}
              target="_blank"
            >
              <CustomTypography variant="bodyRegular">
                {gene.gene}
                <ArrowUpRightIcon color={corePalette.blue100} style={{ marginLeft: 10 }} />
              </CustomTypography>
            </Link>
          </Grid>
        </Grid>
        <Divider className={clsx(classes.dashedDivider, classes.spacing)} />
        <Grid container alignItems="flex-start" className={classes.spacing}>
          <Grid size={{ md: 12 }} className={classes.panel}>
            <CustomTypography variant="label" className={classes.header}>
              CKB
            </CustomTypography>
            <Link
              href={`https://ckb.jax.org/gene/show?geneId=${gene.entrezUID}`}
              className={classes.link}
              target="_blank"
            >
              <CustomTypography variant="bodyRegular">
                {gene.gene}
                <ArrowUpRightIcon color={corePalette.blue100} style={{ marginLeft: 10 }} />
              </CustomTypography>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </ScrollableSection>
  );
}
