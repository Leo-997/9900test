import { describe, expect, it } from 'vitest';
import { ISomaticSnv } from '@/types/SNV.types';
import {
  buildSnvComparisonRows,
  getSnvComparisonCounts,
} from './snvComparisonUtils';

function createSnv(overrides: Partial<ISomaticSnv>): ISomaticSnv {
  return {
    internalId: 1,
    variantId: 'variant-1',
    biosampleId: 'biosample-1',
    geneId: 1,
    gene: 'TP53',
    chr: '17',
    pos: 7579472,
    snvRef: 'C',
    alt: 'T',
    hgvs: 'NM_000546(TP53):c.743G>A (p.R248Q)',
    altad: 40,
    depth: 100,
    rnaVafNo: 0.25,
    zygosity: 'Heterozygous',
    loh: 'No',
    pathclass: 'Tier 1: Pathogenic',
    heliumScore: 0,
    heliumBreakdown: '',
    platforms: undefined,
    importance: 1,
    cosmicId: null,
    researchCandidate: null,
    ...overrides,
  } as ISomaticSnv;
}

describe('buildSnvComparisonRows', () => {
  it('matches truly shared SNVs by genomic coordinates even if hgvs differs', () => {
    const primary = createSnv({
      hgvs: 'NM_000546(TP53):c.743G>A (p.R248Q)',
    });
    const comparison = createSnv({
      internalId: 2,
      variantId: 'variant-2',
      biosampleId: 'biosample-2',
      hgvs: 'ENST00000269305(TP53):c.743G>A (p.Arg248Gln)',
    });

    const rows = buildSnvComparisonRows([primary], [comparison]);

    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('Shared');
    expect(rows[0].uniqueTo).toBeNull();
    expect(rows[0].differences).toEqual([]);
  });

  it('classifies primary-only and comparison-only SNVs correctly', () => {
    const sharedPrimary = createSnv({
      gene: 'TP53',
      variantId: 'shared-primary',
      internalId: 11,
    });
    const sharedComparison = createSnv({
      gene: 'TP53',
      variantId: 'shared-comparison',
      internalId: 12,
      biosampleId: 'biosample-2',
    });
    const primaryOnly = createSnv({
      gene: 'ATRX',
      chr: 'X',
      pos: 77682959,
      snvRef: 'G',
      alt: 'A',
      hgvs: 'NM_000489(ATRX):c.6520C>T (p.R2174C)',
      variantId: 'primary-only',
      internalId: 21,
    });
    const comparisonOnly = createSnv({
      gene: 'IDH1',
      chr: '2',
      pos: 208248388,
      snvRef: 'C',
      alt: 'T',
      hgvs: 'NM_005896(IDH1):c.395G>A (p.R132H)',
      variantId: 'comparison-only',
      internalId: 31,
      biosampleId: 'biosample-2',
    });

    const rows = buildSnvComparisonRows(
      [sharedPrimary, primaryOnly],
      [sharedComparison, comparisonOnly],
    );
    const counts = getSnvComparisonCounts(rows);

    expect(counts.shared).toBe(1);
    expect(counts.unique).toBe(2);
    expect(counts.changed).toBe(0);

    const primaryOnlyRow = rows.find((row) => row.id.includes('x:77682959:G:A'));
    const comparisonOnlyRow = rows.find((row) => row.id.includes('2:208248388:C:T'));

    expect(primaryOnlyRow?.status).toBe('Unique');
    expect(primaryOnlyRow?.uniqueTo).toBe('primary');
    expect(comparisonOnlyRow?.status).toBe('Unique');
    expect(comparisonOnlyRow?.uniqueTo).toBe('comparison');
  });

  it('classifies changed SNVs and lists the exact differing displayed fields', () => {
    const primary = createSnv({
      variantId: 'changed-primary',
      internalId: 41,
      altad: 40,
      depth: 100,
      rnaVafNo: 0.25,
      loh: 'No',
      pathclass: 'Tier 1: Pathogenic',
    });
    const comparison = createSnv({
      variantId: 'changed-comparison',
      internalId: 42,
      biosampleId: 'biosample-2',
      altad: 18,
      depth: 100,
      rnaVafNo: 0.11,
      loh: 'Yes',
      pathclass: 'Tier 2: Likely pathogenic',
    });

    const rows = buildSnvComparisonRows([primary], [comparison]);

    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('Changed');
    expect(rows[0].uniqueTo).toBeNull();
    expect(rows[0].differences).toEqual([
      {
        label: 'DNA VAF',
        primary: '40.00%',
        comparison: '18.00%',
      },
      {
        label: 'RNA VAF',
        primary: '25.00%',
        comparison: '11.00%',
      },
      {
        label: 'LOH',
        primary: '-',
        comparison: 'Yes',
      },
      {
        label: 'Pathclass',
        primary: 'Pathogenic',
        comparison: 'Likely pathogenic',
      },
    ]);
  });
});
