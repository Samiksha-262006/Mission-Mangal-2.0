import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Heart, Eye, Brain, Bone, Zap, Sun, 
  RotateCw, AlertTriangle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function AstronautBodyScanner3D({ vitals, onHotspotClick }) {
  const mountRef = useRef(null);
  const [selectedHotspot, setSelectedHotspot] = useState('heart');
  const [isRotating, setIsRotating] = useState(true);

  // Compute hotspot status colors from live biometrics
  const getHotspotColor = (type) => {
    switch (type) {
      case 'heart':
        return vitals.heartRate > 95 ? 0xef4444 : vitals.heartRate > 78 ? 0xf59e0b : 0x10b981;
      case 'eyes':
        return vitals.fluidShiftIndex > 2.0 ? 0xef4444 : vitals.fluidShiftIndex > 1.6 ? 0xf59e0b : 0x10b981;
      case 'bones':
        return vitals.boneLossPercent > 4.5 ? 0xef4444 : vitals.boneLossPercent > 3.0 ? 0xf59e0b : 0x10b981;
      case 'brain':
        return vitals.stressScore > 75 || vitals.sleepScore < 50 ? 0xef4444 : vitals.stressScore > 60 ? 0xf59e0b : 0x10b981;
      case 'immune':
        return vitals.bodyTemp > 37.8 ? 0xef4444 : vitals.bodyTemp > 37.2 ? 0xf59e0b : 0x10b981;
      case 'radiation':
        return vitals.cumulativeRadiation > 120 ? 0xef4444 : vitals.cumulativeRadiation > 70 ? 0xf59e0b : 0x10b981;
      default:
        return 0x2e8bff;
    }
  };

  const hotspotDetails = {
    heart: {
      title: 'Cardiovascular System',
      metric: `${vitals.heartRate} BPM`,
      status: vitals.heartRate > 90 ? 'Critical Drift' : vitals.heartRate > 78 ? 'Adapting' : 'Nominal',
      desc: 'Microgravity stroke volume reduction and upward resting heart rate drift due to autonomic vagal withdrawal.',
      action: 'Prescribe 35 min CEVIS cycle ergometer interval session.'
    },
    eyes: {
      title: 'Neuro-Ocular / SANS',
      metric: `+${vitals.fluidShiftIndex}σ Shift`,
      status: vitals.fluidShiftIndex > 1.8 ? 'Elevated SANS Risk' : 'Nominal',
      desc: 'Cephalic venous hypertension causing optic disc edema, posterior globe flattening, and hyperopic refractive shift.',
      action: 'Schedule daily Chibis Lower Body Negative Pressure (LBNP) suit session.'
    },
    bones: {
      title: 'Skeletal Density (BMD)',
      metric: `-${vitals.boneLossPercent}% Loss`,
      status: vitals.boneLossPercent > 3.5 ? 'Moderate Osteopenia' : 'Nominal',
      desc: 'Unloaded trabecular bone loss in lumbar vertebrae and femoral neck. Calcium excreted via renal pathways.',
      action: 'Increase ARED axial deadlift load to 140 kg eq.'
    },
    brain: {
      title: 'Central Nervous / Cognition',
      metric: `Stress ${vitals.stressScore}/100`,
      status: vitals.stressScore > 70 ? 'High Fatigue' : 'Focused',
      desc: 'Circadian desynchronization and sensory monotony in 85 m³ volume.',
      action: '60s PVT reaction battery recommended.'
    },
    immune: {
      title: 'Immune Dysregulation',
      metric: `Core ${vitals.bodyTemp}°C`,
      status: vitals.bodyTemp > 37.5 ? 'Spaceflight Pyrexia' : 'Nominal',
      desc: 'Elevated core circadian temperature and T-cell suppression.',
      action: 'Review cabin LiOH filter airflow exchange.'
    },
    radiation: {
      title: 'Radiation Dosimetry',
      metric: `${vitals.cumulativeRadiation} mSv`,
      status: vitals.cumulativeRadiation > 80 ? 'Elevated Dose' : 'Nominal',
      desc: 'Galactic cosmic rays heavy ion flux vs 250 mSv Mars transit benchmark.',
      action: 'Monitor active dosimeter in crew quarters.'
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed for body scanner', e);
      return;
    }

    // Humanoid Body Group
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Suit holographic wireframe material
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x0a1636,
      roughness: 0.5,
      metalness: 0.8,
      wireframe: false
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2e8bff,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });

    const createSuitPart = (geo, x, y, z, parent = bodyGroup) => {
      const mesh = new THREE.Mesh(geo, suitMat);
      mesh.position.set(x, y, z);
      const wire = new THREE.Mesh(geo, wireMat);
      mesh.add(wire);
      parent.add(mesh);
      return mesh;
    };

    // 1. Head / Helmet
    const headGeo = new THREE.SphereGeometry(0.38, 24, 24);
    createSuitPart(headGeo, 0, 2.25, 0);

    // Gold Visor
    const visorGeo = new THREE.SphereGeometry(0.36, 24, 24, 0, Math.PI, 0, Math.PI * 0.5);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xf2b44c,
      roughness: 0.1,
      metalness: 0.95
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = -Math.PI / 2;
    visor.position.set(0, 2.25, 0.05);
    bodyGroup.add(visor);

    // 2. Torso / Life Support Pack
    const chestGeo = new THREE.BoxGeometry(0.85, 0.95, 0.55);
    createSuitPart(chestGeo, 0, 1.45, 0);

    // PLSS Backpack
    const plssGeo = new THREE.BoxGeometry(0.75, 0.85, 0.35);
    const plssMat = new THREE.MeshStandardMaterial({ color: 0x14204a, roughness: 0.4 });
    const plss = new THREE.Mesh(plssGeo, plssMat);
    plss.position.set(0, 1.5, -0.42);
    bodyGroup.add(plss);

    // 3. Pelvis & Waist
    const waistGeo = new THREE.CylinderGeometry(0.38, 0.35, 0.4, 16);
    createSuitPart(waistGeo, 0, 0.8, 0);

    // 4. Arms & Hands
    // Left Arm
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 12);
    const leftArm = createSuitPart(armGeo, -0.58, 1.35, 0);
    leftArm.rotation.z = Math.PI / 12;

    const leftForearm = createSuitPart(armGeo, -0.72, 0.65, 0.1);
    leftForearm.rotation.z = Math.PI / 10;
    leftForearm.rotation.x = -Math.PI / 10;

    // Right Arm
    const rightArm = createSuitPart(armGeo, 0.58, 1.35, 0);
    rightArm.rotation.z = -Math.PI / 12;

    const rightForearm = createSuitPart(armGeo, 0.72, 0.65, 0.1);
    rightForearm.rotation.z = -Math.PI / 10;
    rightForearm.rotation.x = -Math.PI / 10;

    // 5. Legs & Boots
    const legGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.95, 12);
    createSuitPart(legGeo, -0.25, 0.15, 0);
    createSuitPart(legGeo, 0.25, 0.15, 0);

    const lowerLegGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.95, 12);
    createSuitPart(lowerLegGeo, -0.25, -0.75, 0);
    createSuitPart(lowerLegGeo, 0.25, -0.75, 0);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.22, 0.2, 0.38);
    const leftBoot = new THREE.Mesh(bootGeo, plssMat);
    leftBoot.position.set(-0.25, -1.28, 0.08);
    bodyGroup.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, plssMat);
    rightBoot.position.set(0.25, -1.28, 0.08);
    bodyGroup.add(rightBoot);

    // Center bodyGroup vertically
    bodyGroup.position.y = -0.4;

    // ----------------------------------------
    // Interactive Hotspots Setup
    // ----------------------------------------
    const hotspots = [
      { id: 'brain', pos: [0, 2.35, 0.38], label: 'Brain / Cognition' },
      { id: 'eyes', pos: [0, 2.25, 0.44], label: 'Eyes / SANS' },
      { id: 'heart', pos: [-0.22, 1.55, 0.32], label: 'Cardiovascular' },
      { id: 'radiation', pos: [0, 1.45, 0.32], label: 'Radiation Dosimeter' },
      { id: 'immune', pos: [0.22, 1.35, 0.32], label: 'Immune System' },
      { id: 'bones', pos: [0, 0.85, 0.28], label: 'Lumbar Spine / BMD' }
    ];

    const hotspotMeshes = [];
    hotspots.forEach((h) => {
      const color = getHotspotColor(h.id);

      // Core pulsating sphere
      const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...h.pos);
      mesh.userData = { id: h.id, label: h.label };

      // Outer glow ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.17, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.02;
      mesh.add(ring);

      bodyGroup.add(mesh);
      hotspotMeshes.push(mesh);
    });

    // Lights
    const frontLight = new THREE.DirectionalLight(0xffffff, 2.2);
    frontLight.position.set(0, 3, 6);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0x2e8bff, 2.0);
    backLight.position.set(0, -2, -5);
    scene.add(backLight);

    const ambLight = new THREE.AmbientLight(0x0e1738, 1.2);
    scene.add(ambLight);

    // Raycaster for hotspot clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotMeshes, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.id && hit.parent) {
          hit = hit.parent;
        }
        if (hit && hit.userData?.id) {
          soundEngine.playClick();
          setSelectedHotspot(hit.userData.id);
          if (onHotspotClick) onHotspotClick(hit.userData.id);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e) => {
      if (isDragging) {
        const delta = e.clientX - prevMouseX;
        bodyGroup.rotation.y += delta * 0.01;
        prevMouseX = e.clientX;
      }
    };
    const onMouseUp = () => { isDragging = false; };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle auto-rotation unless dragging
      if (isRotating && !isDragging) {
        bodyGroup.rotation.y += 0.35 * delta;
      }

      // Hotspot pulsating animation
      hotspotMeshes.forEach((mesh, idx) => {
        const scale = 1 + Math.sin(time * 4 + idx * 1.2) * 0.22;
        mesh.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [vitals]);

  const activeHotspotInfo = hotspotDetails[selectedHotspot] || hotspotDetails.heart;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 relative overflow-hidden flex flex-col justify-between">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-mangal-blue animate-ping"></div>
          <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wider uppercase">
            3D Autonomous Body Scanner
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title="Toggle Body Auto-Rotation"
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
              isRotating ? 'bg-mangal-blue/20 text-mangal-blue border-mangal-blue/40' : 'bg-space-900 text-slate-400 border-slate-700'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Drag to Rotate 360°</span>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div className="relative w-full h-72 sm:h-80 my-2">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Quick Hotspot Buttons overlay for direct touch */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-auto">
          {Object.keys(hotspotDetails).map((key) => {
            const isSel = selectedHotspot === key;
            return (
              <button
                key={key}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedHotspot(key);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono capitalize transition-all text-left flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-mangal-copper text-white font-bold shadow-[0_0_10px_rgba(200,105,58,0.6)]'
                    : 'bg-space-950/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  key === 'heart' ? 'bg-rose-400' :
                  key === 'eyes' ? 'bg-cyan-400' :
                  key === 'bones' ? 'bg-amber-400' :
                  key === 'brain' ? 'bg-purple-400' :
                  key === 'immune' ? 'bg-emerald-400' : 'bg-orange-400'
                }`}></span>
                <span>{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Hotspot Clinical Detail Card */}
      <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-sm flex items-center gap-1.5">
            <span className="text-mangal-orange">●</span>
            {activeHotspotInfo.title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-extrabold text-sm">{activeHotspotInfo.metric}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-space-900 border border-slate-700 text-amber-300">
              {activeHotspotInfo.status}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 font-sans leading-snug">
          {activeHotspotInfo.desc}
        </p>

        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-cyan-400 flex items-center justify-between">
          <span>Countermeasure: <strong>{activeHotspotInfo.action}</strong></span>
          <span className="text-slate-500">Autonomous Sentinel Lock</span>
        </div>
      </div>
    </div>
  );
}
