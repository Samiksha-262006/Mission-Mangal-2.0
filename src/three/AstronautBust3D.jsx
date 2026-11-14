import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { isWebGLAvailable } from '../utils/webgl';

export default function AstronautBust3D({ 
  avatarText = 'SC', 
  statusColor = '#10b981', 
  healthScore = 92, 
  fatigueLevel = 28,
  isSelected = false 
}) {
  const mountRef = useRef(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglError(true);
      return;
    }
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 100;
    const height = container.clientHeight || 100;

    let scene, camera, renderer, animId;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0.2, 3.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed for bust:', e);
      setWebglError(true);
      return;
    }

    const helmetGroup = new THREE.Group();
    scene.add(helmetGroup);

    // 1. Helmet Outer Shell (Glossy White / Space Navy)
    const shellGeo = new THREE.SphereGeometry(0.72, 24, 24);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.7
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    helmetGroup.add(shellMesh);

    // 2. Visor (Reflective Gold / Sun shield)
    const visorGeo = new THREE.SphereGeometry(0.68, 24, 24, 0, Math.PI, 0, Math.PI * 0.55);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xf2b44c,
      roughness: 0.05,
      metalness: 0.95
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.x = -Math.PI / 2;
    visorMesh.position.set(0, 0.05, 0.1);
    helmetGroup.add(visorMesh);

    // 3. Neck Ring Collar
    const collarGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.18, 20);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.y = -0.65;
    helmetGroup.add(collarMesh);

    // 4. Biometric Status Light Ring (Colored based on health/fatigue)
    const ringColorHex = parseInt((statusColor || '#10b981').replace('#', '0x'), 16) || 0x10b981;
    const ringGeo = new THREE.TorusGeometry(0.78, 0.04, 16, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColorHex,
      transparent: true,
      opacity: isSelected ? 0.95 : 0.65
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.68;
    helmetGroup.add(ringMesh);

    // 5. Communications Earpiece Side Pods
    const podGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 14);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
    [-0.72, 0.72].forEach((xPos) => {
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.rotation.z = Math.PI / 2;
      pod.position.set(xPos, 0, 0);
      helmetGroup.add(pod);
    });

    // Lights
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(2, 3, 4);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(ringColorHex, isSelected ? 3.0 : 1.5);
    rimLight.position.set(-2, -2, -2);
    scene.add(rimLight);

    const ambLight = new THREE.AmbientLight(0x0a1636, 1.0);
    scene.add(ambLight);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow floating rotation
      helmetGroup.rotation.y += (isSelected ? 0.8 : 0.35) * delta;
      helmetGroup.position.y = Math.sin(elapsed * 2) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [statusColor, isSelected]);

  if (webglError || !isWebGLAvailable()) {
    return (
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
        <div 
          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-white text-base shadow-lg border relative overflow-hidden group"
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
            borderColor: statusColor,
            boxShadow: `0 0 15px ${statusColor}33`
          }}
        >
          {/* Simulated 3D Helmet Visor */}
          <div className="w-8 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-inner mb-0.5"></div>
          <span className="text-[11px] font-black tracking-wider text-slate-200">{avatarText}</span>
        </div>
        <span 
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-space-950 animate-ping"
          style={{ backgroundColor: statusColor }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full pointer-events-none" />
      <span className="absolute bottom-0 right-0 text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-space-950/90 text-white border border-slate-700">
        {avatarText}
      </span>
    </div>
  );
}
