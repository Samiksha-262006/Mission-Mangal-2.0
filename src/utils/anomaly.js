/**
 * AstroMed Sentinel - Health Drift & Anomaly Detection Engine
 * Evaluates individual astronaut biometric drift against pre-flight baseline.
 */

// Baseline standard deviations derived from astronaut pre-flight test batteries
const BASELINE_SD = {
  heartRate: 4.5, // bpm
  systolic: 5.5,  // mmHg
  diastolic: 4.0, // mmHg
  spO2: 0.8,      // %
  bodyTemp: 0.2,  // °C
  sleepScore: 7.0,// %
  stressScore: 8.0// %
};

/**
 * Compute Z-score: (current - baseline) / stdDev
 */
export function calculateZScore(current, baseline, stdDev) {
  if (!stdDev || stdDev === 0) return 0;
  return Number(((current - baseline) / stdDev).toFixed(2));
}

/**
 * Analyze all current metrics against baseline and history to generate clinical drift alerts
 */
export function detectHealthDrifts(currentVitals, baseline, history = []) {
  const drifts = [];

  // 1. Resting Heart Rate Drift
  const hrZ = calculateZScore(currentVitals.heartRate, baseline.heartRate, BASELINE_SD.heartRate);
  const hrDeltaPct = (((currentVitals.heartRate - baseline.heartRate) / baseline.heartRate) * 100).toFixed(1);

  if (hrZ >= 2.0 || hrDeltaPct >= 15) {
    drifts.push({
      id: 'drift_hr_high',
      metric: 'Resting Heart Rate',
      severity: hrZ >= 3.0 ? 'critical' : 'warning',
      zScore: hrZ,
      delta: `+${hrDeltaPct}%`,
      current: `${currentVitals.heartRate} bpm`,
      baseline: `${baseline.heartRate} bpm`,
      finding: `Resting HR up ${hrDeltaPct}% over baseline (Z = +${hrZ}σ).`,
      clinicalInsight: 'Consistent with microgravity cardiovascular deconditioning, stroke volume reduction, and autonomic vagal withdrawal.',
      countermeasure: 'Prescribe 30 min interval ergometer sprint + 500 mL electrolyte intake before sleep.'
    });
  } else if (hrZ <= -2.0) {
    drifts.push({
      id: 'drift_hr_low',
      metric: 'Resting Heart Rate',
      severity: 'warning',
      zScore: hrZ,
      delta: `${hrDeltaPct}%`,
      current: `${currentVitals.heartRate} bpm`,
      baseline: `${baseline.heartRate} bpm`,
      finding: `Sinus Bradycardia detected (Z = ${hrZ}σ).`,
      clinicalInsight: 'Potential central baroreceptor resetting or autonomic conduction delay.',
      countermeasure: 'Verify 12-lead ECG telemetry and check electrolyte balance.'
    });
  }

  // 2. Blood Pressure / Vascular SANS Drift
  const sysZ = calculateZScore(currentVitals.systolic, baseline.systolic, BASELINE_SD.systolic);
  const diaZ = calculateZScore(currentVitals.diastolic, baseline.diastolic, BASELINE_SD.diastolic);
  if (sysZ >= 2.0 || diaZ >= 2.0) {
    drifts.push({
      id: 'drift_bp_high',
      metric: 'Arterial Pressure',
      severity: sysZ >= 3.0 ? 'critical' : 'warning',
      zScore: Math.max(sysZ, diaZ),
      delta: `+${currentVitals.systolic - baseline.systolic} mmHg`,
      current: `${currentVitals.systolic}/${currentVitals.diastolic} mmHg`,
      baseline: `${baseline.systolic}/${baseline.diastolic} mmHg`,
      finding: `Systemic hypertension drift (Sys Z = +${sysZ}σ, Dia Z = +${diaZ}σ).`,
      clinicalInsight: 'Sustained headward fluid redistribution elevating upper-body venous and central arterial load.',
      countermeasure: 'Apply Lower Body Negative Pressure (LBNP) Chibis session (-25 mmHg x 40 min).'
    });
  }

  // 3. Fluid Shift / SANS Risk
  if (currentVitals.fluidShiftIndex > 1.8) {
    drifts.push({
      id: 'drift_fluid_shift',
      metric: 'Cephalad Fluid Shift',
      severity: currentVitals.fluidShiftIndex > 2.2 ? 'critical' : 'warning',
      zScore: Number((currentVitals.fluidShiftIndex * 1.3).toFixed(2)),
      delta: `+${((currentVitals.fluidShiftIndex - 1.0) * 100).toFixed(0)}%`,
      current: `Index ${currentVitals.fluidShiftIndex}`,
      baseline: 'Index 1.0 (Earth 1G)',
      finding: `Severe Cephalic Fluid Displacement Index (${currentVitals.fluidShiftIndex}).`,
      clinicalInsight: 'Elevated risk of Spaceflight Associated Neuro-ocular Syndrome (SANS), choroidal folds, and optic disc edema.',
      countermeasure: 'Daily digital fundoscopy scan + fundus visual acuity check; schedule LBNP sleep cuff.'
    });
  }

  // 4. Bone Mineral Density Loss Drift
  if (currentVitals.boneLossPercent > 3.0) {
    drifts.push({
      id: 'drift_bone_density',
      metric: 'Bone Mineral Density (BMD)',
      severity: currentVitals.boneLossPercent > 5.0 ? 'critical' : 'warning',
      zScore: -Number((currentVitals.boneLossPercent / 1.5).toFixed(2)),
      delta: `-${currentVitals.boneLossPercent}%`,
      current: `${currentVitals.boneDensity}%`,
      baseline: '100% (Pre-flight baseline)',
      finding: `Cumulative bone mineral loss of ${currentVitals.boneLossPercent}%.`,
      clinicalInsight: 'Osteoclast resorption exceeding osteoblast formation due to skeletal mechanical unloading in 0G.',
      countermeasure: 'Increase ARED axial loading (squats/deadlifts) by +15% resistance; supplement Vitamin D3 + Calcium.'
    });
  }

  // 5. Radiation Cumulative Dose Drift
  if (currentVitals.cumulativeRadiation > 70) {
    drifts.push({
      id: 'drift_radiation',
      metric: 'Cumulative Ionizing Dose',
      severity: currentVitals.cumulativeRadiation > 120 ? 'critical' : 'warning',
      zScore: Number((currentVitals.cumulativeRadiation / 35).toFixed(2)),
      delta: `${currentVitals.cumulativeRadiation} mSv`,
      current: `${currentVitals.cumulativeRadiation} mSv`,
      baseline: '0.0 mSv (Launch)',
      finding: `Approaching deep space career exposure thresholds (${currentVitals.cumulativeRadiation} mSv).`,
      clinicalInsight: 'GCR heavy ion track exposure increases lifetime attributable risk of radiation-induced carcinogenesis.',
      countermeasure: 'Maximize time in shielded crew quarters; inspect passive polyethylene shield panels.'
    });
  }

  // 6. Sleep Fragmentation / Circadian Misalignment
  const sleepZ = calculateZScore(currentVitals.sleepScore, 85, BASELINE_SD.sleepScore);
  if (sleepZ <= -1.8) {
    drifts.push({
      id: 'drift_sleep_deficit',
      metric: 'Sleep Architecture',
      severity: sleepZ <= -2.5 ? 'warning' : 'info',
      zScore: sleepZ,
      delta: `${currentVitals.sleepScore - 85} pts`,
      current: `${currentVitals.sleepScore}/100`,
      baseline: '85/100',
      finding: `Circadian disruption and slow-wave sleep deficit (Z = ${sleepZ}σ).`,
      clinicalInsight: 'Elevates cognitive lapses, microsleep risk during safety-critical maneuvers, and cortisol baseline.',
      countermeasure: 'Switch crew quarters LED spectrum to 480nm-depleted red/warm mode 60m before sleep; 3mg Melatonin.'
    });
  }

  return drifts;
}
