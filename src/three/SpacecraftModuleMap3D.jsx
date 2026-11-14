import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, AlertTriangle, ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function SpacecraftModuleMap3D({ isSolarFlare, isEvacuated, onSelectModule }) {
  const mountRef = useRef(null);
  const [activeModId, setActiveModId] = useState('mod_04');

  const moduleData = {
    mod_01: { name: 'Module 01: Flight Deck & Avionics', dose: '14,250 μSv/h', shield: 'Al-2219 Minimal', safe: false },
    mod_02: { name: 'Module 02: Crew Berths', dose: '6,400 μSv/h', shield: 'Polyethylene Moderate', safe: false },
    mod_03: { name: 'Module 03: Bio-Lab & Hydroponics', dose: '4,800 μSv/h', shield: 'Composite Moderate', safe: false },
    mod_04: { name: 'Module 04: STORM SHELTER VAULT', dose: '180 μSv/h', shield: 'Water Ballast Tanks (45g/cm² H2O)', safe: true },
    mod_05: { name: 'Module 05: Ion Propulsion & Reactor', dose: '18,900 μSv/h', shield: 'Unpressurized / Radiation Hazard', safe: false }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed for spacecraft map', e);
      return;
    }

    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Module Materials
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.9 });
    const shelterMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x064e3b,
      emissiveIntensity: isSolarFlare ? 0.8 : 0.2
    });
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, emissive: 0x7f1d1d });

    // 1. Mod 01: Cockpit Nose
    const noseGeo = new THREE.ConeGeometry(0.7, 1.4, 16);
    const noseMesh = new THREE.Mesh(noseGeo, metalMat);
    noseMesh.rotation.z = -Math.PI / 2;
    noseMesh.position.set(3.4, 0, 0);
    noseMesh.userData = { id: 'mod_01' };
    shipGroup.add(noseMesh);

    // 2. Mod 02: Crew Berths Cylinder
    const mod2Geo = new THREE.CylinderGeometry(0.7, 0.7, 1.3, 16);
    const mod2Mesh = new THREE.Mesh(mod2Geo, metalMat);
    mod2Mesh.rotation.z = -Math.PI / 2;
    mod2Mesh.position.set(2.0, 0, 0);
    mod2Mesh.userData = { id: 'mod_02' };
    shipGroup.add(mod2Mesh);

    // 3. Mod 03: Science Lab
    const mod3Geo = new THREE.CylinderGeometry(0.75, 0.75, 1.3, 16);
    const mod3Mesh = new THREE.Mesh(mod3Geo, metalMat);
    mod3Mesh.rotation.z = -Math.PI / 2;
    mod3Mesh.position.set(0.65, 0, 0);
    mod3Mesh.userData = { id: 'mod_03' };
    shipGroup.add(mod3Mesh);

    // 4. Mod 04: Central Water-Shielded Storm Shelter Vault
    const vaultGeo = new THREE.SphereGeometry(1.05, 24, 24);
    const vaultMesh = new THREE.Mesh(vaultGeo, shelterMat);
    vaultMesh.position.set(-0.85, 0, 0);
    vaultMesh.userData = { id: 'mod_04' };
    shipGroup.add(vaultMesh);

    // Water Shielding Torus Ring around Vault
    const torusGeo = new THREE.TorusGeometry(1.25, 0.22, 16, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65
    });
    const torus = new THREE.Mesh(torusGeo, waterMat);
    torus.rotation.x = Math.PI / 2;
    torus.position.copy(vaultMesh.position);
    shipGroup.add(torus);

    // Floating Green Arrow / Guide directly above Vault
    const arrowConeGeo = new THREE.ConeGeometry(0.25, 0.6, 16);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const arrowMesh = new THREE.Mesh(arrowConeGeo, arrowMat);
    arrowMesh.rotation.x = Math.PI; // point down
    arrowMesh.position.set(-0.85, 2.0, 0);
    shipGroup.add(arrowMesh);

    // 5. Mod 05: Propulsion Service & Ion Engine
    const mod5Geo = new THREE.CylinderGeometry(0.85, 0.6, 1.6, 16);
    const mod5Mesh = new THREE.Mesh(mod5Geo, isSolarFlare ? hazardMat : metalMat);
    mod5Mesh.rotation.z = -Math.PI / 2;
    mod5Mesh.position.set(-2.4, 0, 0);
    mod5Mesh.userData = { id: 'mod_05' };
    shipGroup.add(mod5Mesh);

    // Engine Nozzles
    const nozzleGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.5, 12);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    [-0.3, 0.3].forEach((offsetY) => {
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.rotation.z = -Math.PI / 2;
      nozzle.position.set(-3.4, offsetY, 0);
      shipGroup.add(nozzle);
    });

    // Solar Wing Arrays (Top & Bottom)
    const wingGeo = new THREE.BoxGeometry(0.04, 3.2, 1.1);
    const topWing = new THREE.Mesh(wingGeo, solarMat);
    topWing.position.set(-0.85, 2.3, 0);
    shipGroup.add(topWing);

    const botWing = new THREE.Mesh(wingGeo, solarMat);
    botWing.position.set(-0.85, -2.3, 0);
    shipGroup.add(botWing);

    // Lights
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const alertRedLight = new THREE.PointLight(0xff2222, isSolarFlare ? 4.0 : 0.2, 15);
    alertRedLight.position.set(0, 3, 2);
    scene.add(alertRedLight);

    const ambLight = new THREE.AmbientLight(0x0e1738, 1.2);
    scene.add(ambLight);

    // Interaction / Raycast
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(shipGroup.children, true);
      if (hits.length > 0) {
        let hitObj = hits[0].object;
        while (hitObj && !hitObj.userData?.id && hitObj.parent) {
          hitObj = hitObj.parent;
        }
        if (hitObj?.userData?.id) {
          soundEngine.playClick();
          setActiveModId(hitObj.userData.id);
          if (onSelectModule) onSelectModule(hitObj.userData.id);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // Mouse drag rotation
    let isDragging = false;
    let prevX = 0;
    const onMouseDown = (e) => { isDragging = true; prevX = e.clientX; };
    const onMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        shipGroup.rotation.y += dx * 0.01;
        prevX = e.clientX;
      }
    };
    const onMouseUp = () => { isDragging = false; };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle auto-rotation
      if (!isDragging) {
        shipGroup.rotation.y += 0.25 * delta;
      }

      // Torus water circulation rotation
      torus.rotation.z += 0.5 * delta;

      // Pulse floating green guide arrow above Vault
      arrowMesh.position.y = 1.9 + Math.sin(time * 6) * 0.25;

      // Screen shake simulation if active solar flare and not evacuated
      if (isSolarFlare && !isEvacuated) {
        camera.position.x = (Math.random() - 0.5) * 0.06;
        camera.position.y = 3.5 + (Math.random() - 0.5) * 0.06;
      } else {
        camera.position.x = 0;
        camera.position.y = 3.5;
      }

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [isSolarFlare, isEvacuated]);

  const activeModInfo = moduleData[activeModId] || moduleData.mod_04;

  return (
    <div className={`p-4 rounded-xl border relative transition-all duration-300 ${
      isSolarFlare ? 'border-red-500/70 bg-red-950/20' : 'border-slate-800 bg-space-950'
    }`}>
      {/* 3D Model Mount */}
      <div className="relative w-full h-64 sm:h-72">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* 3D Compass & Guidance Pill */}
        <div className="absolute top-2 left-2 text-[10px] font-mono flex items-center gap-1.5 bg-space-900/90 px-2.5 py-1 rounded border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-300 font-bold">MODULE 04: WATER STORM SHELTER</span>
        </div>

        {isSolarFlare && (
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-red-300 bg-red-950/90 px-2.5 py-1 rounded border border-red-500 animate-pulse">
            HIGH PROTON FLUX INBOUND • EVACUATE TO MODULE 04
          </div>
        )}
      </div>

      {/* Selected Module Detail */}
      <div className="pt-2.5 mt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
        <div>
          <span className="text-slate-400">Inspecting: </span>
          <strong className="text-white">{activeModInfo.name}</strong>
          <span className="text-slate-500 mx-2">|</span>
          <span className="text-cyan-300">{activeModInfo.shield}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Ambient Flux:</span>
          <span className={`font-bold ${activeModInfo.safe ? 'text-emerald-400' : 'text-red-400'}`}>
            {activeModInfo.dose}
          </span>
        </div>
      </div>
    </div>
  );
}
