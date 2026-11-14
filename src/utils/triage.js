import protocolsData from '../data/protocols.json';

/**
 * AstroMed Sentinel - Offline AI Flight Surgeon Engine
 * Evaluates symptoms, correlates with real-time biometric vitals,
 * and matches against clinical spaceflight protocols and available inventory.
 */

export function runMedicalTriage(queryText, currentVitals, inventory = []) {
  const query = queryText.toLowerCase().trim();

  // Search protocols by matching keywords and tokens
  let bestMatch = null;
  let highestScore = 0;

  protocolsData.forEach((protocol) => {
    let score = 0;

    // Check direct protocol name match
    if (query.includes(protocol.name.toLowerCase())) {
      score += 15;
    }

    // Check keyword matches
    protocol.keywords.forEach((kw) => {
      if (query.includes(kw.toLowerCase())) {
        score += 8;
      } else {
        // Substring / word matching
        const words = kw.toLowerCase().split(' ');
        words.forEach(w => {
          if (w.length > 3 && query.includes(w)) {
            score += 3;
          }
        });
      }
    });

    // Check vital signs correlation bonuses
    if (protocol.id === 'chest_pain' && currentVitals.heartRate > 105) score += 6;
    if (protocol.id === 'radiation_exposure' && currentVitals.radiationDoseRate > 100) score += 10;
    if (protocol.id === 'headache' && currentVitals.fluidShiftIndex > 1.6) score += 5;
    if (protocol.id === 'anxiety' && currentVitals.stressScore > 70) score += 5;
    if (protocol.id === 'dehydration' && currentVitals.hydration < 60) score += 5;
    if (protocol.id === 'insomnia' && currentVitals.sleepScore < 50) score += 5;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = protocol;
    }
  });

  // If score is too low, return a generalized differential triage
  if (!bestMatch || highestScore < 3) {
    return {
      protocolFound: false,
      title: 'General Symptom Assessment & Telemetry Review',
      severity: currentVitals.heartRate > 110 || currentVitals.spO2 < 94 ? 'High' : 'Low',
      summary: `I've analyzed your reported symptoms: "${queryText}". No singular protocol reached high confidence match. Current vitals are: HR ${currentVitals.heartRate} bpm, BP ${currentVitals.systolic}/${currentVitals.diastolic} mmHg, SpO2 ${currentVitals.spO2}%, Core Temp ${currentVitals.bodyTemp}°C.`,
      likelyCauses: [
        'Atypical microgravity neuro-vestibular adjustment',
        'Subclinical electrolyte / hydration shift',
        'Circadian fatigue or cabin air particulate exposure'
      ],
      stepByStepActions: [
        '1. Rest in personal crew berth in neutral body posture for 20 minutes.',
        '2. Hydrate with 400 mL oral rehydration solution.',
        '3. Log specific symptom onset time, radiation dosimeter reading, and cabin CO2 ppm.',
        '4. If symptoms worsen, initiate direct voice uplink to Ground Flight Surgeon or select a specific protocol.'
      ],
      medicationRecommendations: [
        {
          name: 'Oral Rehydration Salts (ORS)',
          dosage: '1 pouch in 500 mL water',
          inStock: true,
          status: 'In Stock (Galley & Med Kit Bravo)',
          alternatives: []
        }
      ],
      telemetryPriority: 'ROUTINE',
      disclaimer: 'Decision support only, not a replacement for medical professionals.'
    };
  }

  // Cross-reference recommended medications with real-time inventory
  const evaluatedMeds = bestMatch.recommendedMeds.map((medReq) => {
    const invItem = inventory.find((i) => i.id === medReq.id);
    if (!invItem) {
      return {
        name: medReq.name,
        dosage: medReq.dose,
        inStock: false,
        status: 'Unlisted in Inventory',
        alternatives: []
      };
    }

    const isExpired = new Date(invItem.expiryDate) < new Date('2026-11-14');
    const inStock = invItem.stock > 0 && !isExpired;

    // Find in-stock alternatives if out of stock
    const alternativeNames = [];
    if (!inStock && invItem.alternatives) {
      invItem.alternatives.forEach((altId) => {
        const altItem = inventory.find((i) => i.id === altId);
        if (altItem && altItem.stock > 0) {
          alternativeNames.push(`${altItem.name} (${altItem.stock} ${altItem.unit} available in ${altItem.location})`);
        }
      });
    }

    return {
      id: invItem.id,
      name: invItem.name,
      dosage: medReq.dose,
      inStock,
      stockCount: invItem.stock,
      unit: invItem.unit,
      location: invItem.location,
      status: !inStock ? (isExpired ? 'EXPIRED' : 'OUT OF STOCK') : `In Stock (${invItem.stock} ${invItem.unit})`,
      alternatives: alternativeNames
    };
  });

  return {
    protocolFound: true,
    id: bestMatch.id,
    title: bestMatch.name,
    severity: bestMatch.severity,
    likelyCauses: bestMatch.likelyCauses,
    vitalSignsCorrelation: bestMatch.vitalSignsCorrelation,
    stepByStepActions: bestMatch.stepByStepActions,
    medicationRecommendations: evaluatedMeds,
    telemetryPriority: bestMatch.telemetryPriority,
    groundNotification: bestMatch.groundNotification,
    disclaimer: 'Decision support only, not a replacement for medical professionals.'
  };
}

/**
 * Web Speech API - Speech-to-Text helper
 */
export function initSpeechRecognition(onResult, onError, onEnd) {
  if (typeof window === 'undefined') return null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    return null;
  }
  try {
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (err) => {
      if (onError) onError(err);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return recognition;
  } catch (e) {
    return null;
  }
}

/**
 * Web Speech API - Text-to-Speech helper
 */
export function speakText(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Calm, professional flight surgeon voice
    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Samantha')));
    if (synthVoice) utterance.voice = synthVoice;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis unavailable
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
