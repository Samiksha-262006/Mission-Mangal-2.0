import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MissionTrajectory3D({ missionDay = 42 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 11);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed for trajectory', e);
      return;
    }

    // 1. Sun at Center
    const sunGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Sun Glow
    const sunGlowGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const sunGlowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(1.0, 0.7, 0.2, 1.0) * intensity * 2.0;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    scene.add(sunGlow);

    // 2. Earth Orbit Ring (Radius ~3.6)
    const earthOrbitRadius = 3.6;
    const earthRingGeo = new THREE.RingGeometry(earthOrbitRadius - 0.02, earthOrbitRadius + 0.02, 64);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x2e8bff, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const earthRing = new THREE.Mesh(earthRingGeo, orbitMat);
    earthRing.rotation.x = Math.PI / 2;
    scene.add(earthRing);

    // 3. Mars Orbit Ring (Radius ~5.8)
    const marsOrbitRadius = 5.8;
    const marsRingGeo = new THREE.RingGeometry(marsOrbitRadius - 0.02, marsOrbitRadius + 0.02, 64);
    const marsOrbitMat = new THREE.MeshBasicMaterial({ color: 0xc8693a, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const marsRing = new THREE.Mesh(marsRingGeo, marsOrbitMat);
    marsRing.rotation.x = Math.PI / 2;
    scene.add(marsRing);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(earthOrbitRadius, 0, 0);
    scene.add(earth);

    // Mars Sphere (Intercept point approx 140 deg around orbit)
    const marsAngle = Math.PI * 0.75;
    const marsGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const marsMat = new THREE.MeshBasicMaterial({ color: 0xe8894f });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.position.set(Math.cos(marsAngle) * marsOrbitRadius, 0, Math.sin(marsAngle) * marsOrbitRadius);
    scene.add(mars);

    // 4. Hohmann Transfer Ellipse Arc
    const curvePoints = [];
    const numPoints = 60;
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Interpolate radius from 3.6 to 5.8 and angle from 0 to marsAngle
      const r = earthOrbitRadius + (marsOrbitRadius - earthOrbitRadius) * Math.sin(t * Math.PI * 0.5);
      const theta = t * marsAngle;
      curvePoints.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    const transferGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const transferMat = new THREE.LineDashedMaterial({
      color: 0xf2b44c,
      dashSize: 0.3,
      gapSize: 0.15,
      linewidth: 2
    });
    const transferLine = new THREE.Line(transferGeo, transferMat);
    transferLine.computeLineDistances();
    scene.add(transferLine);

    // 5. Spacecraft Marker
    const progress = Math.min(Math.max((missionDay - 1) / 179, 0), 1);
    const shipR = earthOrbitRadius + (marsOrbitRadius - earthOrbitRadius) * Math.sin(progress * Math.PI * 0.5);
    const shipTheta = progress * marsAngle;

    const shipGeo = new THREE.ConeGeometry(0.15, 0.45, 12);
    const shipMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const ship = new THREE.Mesh(shipGeo, shipMat);
    ship.rotation.x = Math.PI / 2;
    ship.rotation.z = -shipTheta - Math.PI / 2;
    ship.position.set(Math.cos(shipTheta) * shipR, 0, Math.sin(shipTheta) * shipR);
    scene.add(ship);

    // Ship Beacon Pulse
    const beaconGeo = new THREE.RingGeometry(0.18, 0.28, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.rotation.x = Math.PI / 2;
    beacon.position.copy(ship.position);
    scene.add(beacon);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 200;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Pulse beacon
      const s = 1 + Math.sin(time * 6) * 0.35;
      beacon.scale.set(s, s, s);

      // Slow orbital drift
      sun.rotation.y += 0.01;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [missionDay]);

  const progressPct = Math.round(((missionDay - 1) / 179) * 100);

  return (
    <div className="relative w-full h-44 rounded-xl bg-space-950/80 border border-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* 3D Telemetry Overlay */}
      <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-mangal-blue animate-ping"></span>
        <span className="text-white font-bold">3D Heliocentric Hohmann Transfer Orbit</span>
        <span className="text-mangal-gold hidden sm:inline">Earth ➔ Mars Intercept</span>
      </div>

      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-cyan-300 bg-space-900/90 px-2.5 py-1 rounded border border-cyan-500/30">
        Trajectory Progress: <strong>{progressPct}%</strong> • Sol {missionDay} / 180
      </div>
    </div>
  );
}
