import { useCuration } from '../../contexts/CurationContext';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import CorrectionCard from './CorrectionCard';

import type { JSX } from "react";

export default function CorrectionsList(): JSX.Element {
  const { correctionFlags } = useCuration();
  return (
    <ScrollableSection style={{ width: '100%', height: '100%', maxHeight: '550px' }}>
      {correctionFlags.map((correction) => (
        <CorrectionCard
          key={correction.flagId}
          correction={correction}
        />
      ))}
    </ScrollableSection>
  );
}
