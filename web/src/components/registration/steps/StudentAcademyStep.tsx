'use client';

import TypeformHeading from '../TypeformHeading';
import AcademySelect from '@/components/AcademySelect';

interface StudentAcademyStepProps {
  academyId: string;
  onAcademyChange: (id: string) => void;
}

export default function StudentAcademyStep({ academyId, onAcademyChange }: StudentAcademyStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Which academy are you enrolled at?"
        subtitle="Pick the partner school you're currently training with"
      />
      <AcademySelect value={academyId} onChange={onAcademyChange} />
    </div>
  );
}
