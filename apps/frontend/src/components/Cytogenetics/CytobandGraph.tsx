import { Box, styled } from '@mui/material';
import Ideogram from 'ideogram';
import { useEffect, useRef, useState, type JSX } from 'react';

interface IStyleProps {
  view: string;
}

const Wrapper = styled(Box)<IStyleProps>(({ view }) => ({
  width: '100%',
  height: '100%',
  marginTop: view === 'modal' ? '-60px' : '-6%',
}));

interface ICytobandGraphProps {
  chr: string,
  width: number,
  view: string,
  annotations: (string|number)[][];
}

export default function CytobandGraph({
  chr,
  width,
  view,
  annotations,
}: ICytobandGraphProps): JSX.Element {
  const [ideogram, setIdeogram] = useState<Ideogram | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const annotationTracksH = [
      { id: 'cnTrack', displayName: 'Copy Number', shape: 'span' },
      /*
      {
        id: 'rnaexpressionLevelTrack',
        displayName: 'RNA-Seq Expression level',
        shape: 'rectangle',
      }, // WITH OUTLIERS
      */
      { id: 'lohTrack', displayName: 'LOH', shape: 'span' },
      { id: 'reportableSnvs', displayName: 'Reportable SNVs', shape: 'triangle' },
    ];

    const heatmaps = [
      {
        key: 'cn',
        thresholds: [
          ['0.5', '#0EC971'],
          ['1', '#5DFCA8'],
          ['1.7', '#C9FFE2'],
          ['2.5', '#ECF0F3'],
          ['4', '#FEE0E9'],
          ['6', '#FF85A9'],
          ['+', '#FF2969'],
        ],
      },
      // {
      //   key: 'rna',
      //   thresholds: [
      //     ['-3', '#5DFCA8'],
      //     ['-2', '#84FFBE'],
      //     ['-1', '#C9FFE2'],
      //     ['0', '#ECF0F3'],
      //     ['1', '#FEE0E9'],
      //     ['2', '#FF84A9'],
      //     ['3', '#FF5E8E']
      //   ]
      // },
      {
        key: 'loh',
        thresholds: [
          ['0', 'rgba(0,0,0,0)'],
          ['1', '#d19cff'],
        ],
      },
      {
        key: 'pathclass',
        thresholds: [
          ['-1', 'rgba(0,0,0,0)'],
          ['0', '#FF2969'],
          ['1', '#FF85A9'],
          ['2', '#5DFCA8'],
          ['3', '#5DFCA8'],
          ['4', '#D0D9E2'],
          ['5', '#D0D9E2'],
          ['6', '#D0D9E2'],
          ['7', '#D0D9E2'],
        ],
      },
    ];

    const makeChromosome = (ref: HTMLDivElement): Ideogram => new Ideogram({
      organism: 'human',
      assembly: 'GRCh38',
      orientation: 'horizontal',
      chromosome: chr,
      showChromosomeLabels: false,
      chrHeight: ref.clientWidth * 0.9,
      chrWidth: width,
      chrMargin: 0,
      container: `#${ref.id}`,
      showBandLabels: true,
      barWidth: 3,
      heatmaps,
      annotationHeight: view === 'modal' ? 6 : 10,
      annotationTracks: annotationTracksH,

      annotations: {
        keys: ['name', 'start', 'length', 'cn', 'loh', 'pathclass'], // add rnaexp
        annots: [{ chr, annots: annotations || [] }],
      },
    });

    if (containerRef.current && !ideogram) {
      setIdeogram(makeChromosome(containerRef.current));
    }
  }, [
    chr,
    width,
    annotations,
    containerRef,
    ideogram,
    view,
  ]);

  return (
    <Wrapper ref={containerRef} id={`ideo-container-cn-${view}-${chr}`} view={view} />
  );
}
