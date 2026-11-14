/**
 * AstroMed Sentinel - Mission Simulation Engine
 * Simulates microgravity physiological adaptation across 180 days of Mars transit.
 */

// Generate realistic synthetic vitals for a given mission day
export function generateVitalsForDay(day, baseline, activeEvents = {}) {
  // Day progress ratio 0 -> 1
  const progress = Math.min(Math.max((day - 1) / 179, 0), 1);

  // Microgravity adaptation curves (polynomial + exponential fits from NASA spaceflight data)
  // 1. Resting Heart Rate drifts upwards due to cardiac deconditioning and stroke volume decline
  const hrDrift = progress * 14; // +14 bpm over 180 days
  const hrNoise = (Math.sin(day * 1.7) * 2.5) + ((Math.random() - 0.5) * 3);
  let heartRate = Math.round(baseline.heartRate + hrDrift + hrNoise);

  // 2. Blood Pressure (cephalad shift causes initial diastolic rise, then vascular remodeling)
  const sysDrift = progress * 8 + Math.cos(day * 0.9) * 3;
  const diaDrift = progress * 6 + Math.sin(day * 0.8) * 2;
  let systolic = Math.round(baseline.systolic + sysDrift + (Math.random() - 0.5) * 3);
  let diastolic = Math.round(baseline.diastolic + diaDrift + (Math.random() - 0.5) * 2);

  // 3. SpO2 (stable, small diurnal wobble ~97-99%)
  let spO2 = Math.min(100, Math.max(94, Math.round(baseline.spO2 - (progress * 0.8) + (Math.sin(day) * 0.6))));

  // 4. Body Temperature (circadian core temperature elevated by ~0.3-0.5°C in space: 'space fever')
  const tempDrift = progress * 0.35 + (Math.sin(day * 2.3) * 0.1);
  let bodyTemp = Number((baseline.bodyTemp + tempDrift + (Math.random() - 0.5) * 0.1).toFixed(1));

  // 5. Sleep Score (circadian disruption, acoustic cabin noise)
  const sleepDegrade = progress * 24; // drops from ~88 to ~64
  const sleepNoise = Math.sin(day * 0.6) * 8 + (Math.random() - 0.5) * 5;
  let sleepScore = Math.max(35, Math.min(96, Math.round(88 - sleepDegrade + sleepNoise)));

  // 6. Stress Index (rises as isolation deepens, Earth out-of-view phenomenon)
  const stressRise = progress * 32;
  const stressNoise = Math.cos(day * 0.5) * 9 + (Math.random() - 0.5) * 6;
  let stressScore = Math.max(15, Math.min(95, Math.round(24 + stressRise + stressNoise)));

  // 7. Hydration & Cephalad Fluid Shift
  // Fluid shift index: 0 = 1G baseline, 1.0 - 2.5 = spaceflight cephalic fluid redistribution
  const fluidShiftIndex = Number((1.2 + Math.sin(day * 0.2) * 0.3 + progress * 0.5).toFixed(2));
  let hydration = Math.max(45, Math.min(90, Math.round(baseline.hydration - (progress * 8) + Math.sin(day * 1.2) * 4)));

  // 8. Cumulative Radiation (GCR ~0.46 mSv/day nominal)
  let cumulativeRadiation = Number((day * 0.465).toFixed(2));
  let radiationDoseRate = 19.4 + Math.sin(day * 0.8) * 3.2; // microSieverts per hour

  // 9. Bone Mineral Density loss (approx 1.0% per 30 days in cancellous bone like hip/spine)
  const boneLossPercent = Number((progress * 6.2).toFixed(2)); // up to ~6.2% loss at Day 180
  const boneDensity = Number((baseline.boneDensity - boneLossPercent).toFixed(1));

  // 10. Muscle Mass Atrophy (approx 1.2% per 30 days in postural soleus/gastrocnemius)
  const muscleLossPercent = Number((progress * 7.5).toFixed(2));

  // Apply Active Trigger Events if active
  if (activeEvents.solarFlare) {
    // SPE event: sudden massive surge in flux
    radiationDoseRate = 14250; // 14.25 mSv/hr !
    cumulativeRadiation = Number((cumulativeRadiation + 48.5).toFixed(2));
    stressScore = Math.min(98, stressScore + 35);
    heartRate = Math.min(130, heartRate + 22);
  }

  if (activeEvents.chestPain) {
    heartRate = Math.min(145, Math.max(118, heartRate + 45));
    systolic = Math.min(185, systolic + 38);
    diastolic = Math.min(110, diastolic + 22);
    spO2 = Math.max(91, spO2 - 6);
    stressScore = Math.min(99, stressScore + 48);
  }

  if (activeEvents.crewConflict) {
    stressScore = Math.min(95, stressScore + 32);
    sleepScore = Math.max(25, sleepScore - 28);
    heartRate = Math.min(115, heartRate + 15);
  }

  // Calculate Overall Mission Health Score (0-100)
  const healthScore = calculateMissionHealthScore({
    heartRate,
    spO2,
    systolic,
    diastolic,
    bodyTemp,
    sleepScore,
    stressScore,
    hydration,
    cumulativeRadiation,
    boneLossPercent,
    activeEvents
  });

  return {
    day,
    heartRate,
    systolic,
    diastolic,
    spO2,
    bodyTemp,
    sleepScore,
    stressScore,
    hydration,
    fluidShiftIndex,
    cumulativeRadiation,
    radiationDoseRate: Number(radiationDoseRate.toFixed(1)),
    boneDensity,
    boneLossPercent,
    muscleLossPercent,
    healthScore,
    timestamp: new Date().toISOString()
  };
}

// Calculate composite Mission Health Score (0-100)
export function calculateMissionHealthScore(data) {
  let score = 100;

  // Cardiovascular penalty
  if (data.heartRate > 100) score -= (data.heartRate - 100) * 1.2;
  else if (data.heartRate > 80) score -= (data.heartRate - 80) * 0.4;
  else if (data.heartRate < 48) score -= (48 - data.heartRate) * 1.0;

  // Blood Pressure penalty
  if (data.systolic > 140) score -= (data.systolic - 140) * 0.8;
  if (data.diastolic > 90) score -= (data.diastolic - 90) * 0.8;

  // SpO2 penalty
  if (data.spO2 < 95) score -= (95 - data.spO2) * 4;

  // Temperature penalty
  if (data.bodyTemp > 37.8) score -= (data.bodyTemp - 37.8) * 15;

  // Sleep & Stress penalties
  if (data.sleepScore < 60) score -= (60 - data.sleepScore) * 0.3;
  if (data.stressScore > 70) score -= (data.stressScore - 70) * 0.35;

  // Hydration penalty
  if (data.hydration < 65) score -= (65 - data.hydration) * 0.4;

  // Radiation penalty (mission limit 600 mSv)
  if (data.cumulativeRadiation > 100) score -= (data.cumulativeRadiation - 100) * 0.08;

  // Bone loss penalty
  if (data.boneLossPercent > 4.0) score -= (data.boneLossPercent - 4.0) * 2;

  // Event acute penalties
  if (data.activeEvents?.chestPain) score -= 35;
  if (data.activeEvents?.solarFlare) score -= 22;
  if (data.activeEvents?.crewConflict) score -= 12;

  return Math.max(10, Math.min(100, Math.round(score)));
}

// Multi-Hazard Risk breakdown computation (for Radar Chart and Hazard Panel)
export function calculateHazardRisks(vitals) {
  // 1. Radiation Risk (0 - 100)
  // 250 mSv is nominal 6-month Mars transit limit; 600-1000 mSv is career limit
  const radRatio = (vitals.cumulativeRadiation / 250) * 100;
  const radiationRisk = Math.min(100, Math.max(10, Math.round(radRatio)));

  // 2. Bone and Muscle Loss Risk (0 - 100)
  const boneMuscleRisk = Math.min(100, Math.round((vitals.boneLossPercent / 8.0) * 85 + (vitals.muscleLossPercent / 9.0) * 15));

  // 3. Cardiovascular & Fluid Shift Risk (SANS) (0 - 100)
  let cvRisk = 20;
  if (vitals.heartRate > 85) cvRisk += (vitals.heartRate - 85) * 1.8;
  if (vitals.fluidShiftIndex > 1.5) cvRisk += (vitals.fluidShiftIndex - 1.5) * 25;
  cvRisk = Math.min(100, Math.max(15, Math.round(cvRisk)));

  // 4. Immune Stress (0 - 100)
  // Driven by radiation, sleep deficit, and mission duration
  const immuneRisk = Math.min(100, Math.max(12, Math.round(
    (vitals.day / 180) * 45 + ((100 - vitals.sleepScore) * 0.35) + (vitals.cumulativeRadiation > 50 ? 20 : 5)
  )));

  // 5. Mental Health & Isolation Risk (0 - 100)
  const mentalRisk = Math.min(100, Math.max(15, Math.round(
    (vitals.stressScore * 0.6) + ((100 - vitals.sleepScore) * 0.4)
  )));

  return [
    { hazard: 'Radiation Dose', value: radiationRisk, fullMark: 100, metric: `${vitals.cumulativeRadiation} mSv` },
    { hazard: 'Bone & Muscle', value: boneMuscleRisk, fullMark: 100, metric: `-${vitals.boneLossPercent}% BMD` },
    { hazard: 'Cardio / SANS', value: cvRisk, fullMark: 100, metric: `Shift ${vitals.fluidShiftIndex}σ` },
    { hazard: 'Immune Stress', value: immuneRisk, fullMark: 100, metric: `T-cell index` },
    { hazard: 'Isolation / Mental', value: mentalRisk, fullMark: 100, metric: `Stress ${vitals.stressScore}` },
  ];
}
