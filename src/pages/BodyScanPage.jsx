import React from 'react';
import { Orbit } from 'lucide-react';
import AstronautBodyScanner3D from '../three/AstronautBodyScanner3D';
import { useMissionStore } from '../store/useMissionStore';

export default function BodyScanPage() {
  const { currentVitals } = useMissionStore();

  return (
    <div className="space-y-6 min-w-0 max-w-5xl mx-auto">
      <AstronautBodyScanner3D
        vitals={currentVitals}
        onHotspotClick={() => {}}
      />
    </div>
  );
}
