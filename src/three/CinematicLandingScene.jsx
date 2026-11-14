import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CinematicLandingScene({ onEnter }) {
  const mountRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b1f, 0.0012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ----------------------------------------
    // 1. Procedural Mars Texture Canvas
    // ----------------------------------------
    const marsCanvas = document.createElement('canvas');
    marsCanvas.width = 1024;
    marsCanvas.height = 512;
    const marsCtx = marsCanvas.getContext('2d');

    // Base Mars rust/copper gradient
    const grad = marsCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#8c3516');
    grad.addColorStop(0.3, '#c8693a');
    grad.addColorStop(0.7, '#e8894f');
    grad.addColorStop(1, '#66220b');
    marsCtx.fillStyle = grad;
    marsCtx.fillRect(0, 0, 1024, 512);

    // Add craters and highland noise
    marsCtx.fillStyle = 'rgba(74, 25, 10, 0.28)';
    for (let i = 0; i < 200; i++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 512;
      const r = Math.random() * 45 + 5;
      marsCtx.beginPath();
      marsCtx.arc(cx, cy, r, 0, Math.PI * 2);
      marsCtx.fill();
    }

    // Polar ice caps (subtle white/cyan at poles)
    const northIce = marsCtx.createRadialGradient(512, 15, 0, 512, 15, 80);
    northIce.addColorStop(0, 'rgba(235, 245, 255, 0.85)');
    northIce.addColorStop(1, 'rgba(235, 245, 255, 0)');
    marsCtx.fillStyle = northIce;
    marsCtx.fillRect(0, 0, 1024, 90);

    const marsTexture = new THREE.CanvasTexture(marsCanvas);

    // Mars Sphere Mesh
    const marsGeo = new THREE.SphereGeometry(4.8, 64, 64);
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.85,
      metalness: 0.15
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.position.set(0, -0.6, 0);
    scene.add(marsMesh);

    // Mars Atmosphere Rim Glow (Custom Fresnel Shader)
    const atmoGeo = new THREE.SphereGeometry(5.05, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
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
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.9, 0.45, 0.25, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    atmoMesh.position.copy(marsMesh.position);
    scene.add(atmoMesh);

    // ----------------------------------------
    // 2. Distant Earth Sphere
    // ----------------------------------------
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 256;
    earthCanvas.height = 128;
    const earthCtx = earthCanvas.getContext('2d');
    earthCtx.fillStyle = '#1e40af';
    earthCtx.fillRect(0, 0, 256, 128);
    // Green continents
    earthCtx.fillStyle = '#10b981';
    for (let i = 0; i < 40; i++) {
      earthCtx.beginPath();
      earthCtx.arc(Math.random() * 256, Math.random() * 128, Math.random() * 25 + 8, 0, Math.PI * 2);
      earthCtx.fill();
    }
    // White clouds
    earthCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      earthCtx.beginPath();
      earthCtx.arc(Math.random() * 256, Math.random() * 128, Math.random() * 20 + 5, 0, Math.PI * 2);
      earthCtx.fill();
    }
    const earthTexture = new THREE.CanvasTexture(earthCanvas);

    const earthGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(12, 5, -20);
    scene.add(earthMesh);

    // Earth blue atmosphere glow
    const earthGlowGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const earthGlowMat = new THREE.ShaderMaterial({
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
          gl_FragColor = vec4(0.18, 0.55, 1.0, 1.0) * intensity * 2.0;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const earthGlow = new THREE.Mesh(earthGlowGeo, earthGlowMat);
    earthGlow.position.copy(earthMesh.position);
    scene.add(earthGlow);

    // ----------------------------------------
    // 3. Parallax Starfield
    // ----------------------------------------
    const starsCount = 1200;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = -Math.random() * 80 - 10;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.28,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ----------------------------------------
    // 4. Procedural Rocket with Particle Trail
    // ----------------------------------------
    const rocketGroup = new THREE.Group();
    // Body cylinder
    const rBodyGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.1, 16);
    const rBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const rBody = new THREE.Mesh(rBodyGeo, rBodyMat);
    rocketGroup.add(rBody);
    // Nose cone
    const rNoseGeo = new THREE.ConeGeometry(0.12, 0.45, 16);
    const rNoseMat = new THREE.MeshStandardMaterial({ color: 0xc8693a, roughness: 0.2 });
    const rNose = new THREE.Mesh(rNoseGeo, rNoseMat);
    rNose.position.y = 0.77;
    rocketGroup.add(rNose);
    // Fins
    const rFinGeo = new THREE.BoxGeometry(0.04, 0.35, 0.45);
    const rFinMat = new THREE.MeshStandardMaterial({ color: 0x2e8bff });
    const rFin1 = new THREE.Mesh(rFinGeo, rFinMat);
    rFin1.position.y = -0.4;
    rocketGroup.add(rFin1);
    const rFin2 = new THREE.Mesh(rFinGeo, rFinMat);
    rFin2.rotation.y = Math.PI / 2;
    rFin2.position.y = -0.4;
    rocketGroup.add(rFin2);

    rocketGroup.position.set(-14, 2, 2);
    rocketGroup.rotation.z = -Math.PI / 3;
    rocketGroup.rotation.x = Math.PI / 6;
    scene.add(rocketGroup);

    // Flame light
    const flameLight = new THREE.PointLight(0xff7a30, 2.5, 6);
    flameLight.position.set(0, -0.7, 0);
    rocketGroup.add(flameLight);

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    sunLight.position.set(15, 8, 12);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0e1738, 0.85);
    scene.add(ambientLight);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Parallax listener
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 1.5;
      targetY = (e.clientY / window.innerHeight - 0.5) * 1.2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate Mars
      marsMesh.rotation.y += 0.08 * delta;
      atmoMesh.rotation.y += 0.08 * delta;

      // Orbit Earth slowly
      earthMesh.rotation.y += 0.12 * delta;

      // Fly Rocket in arc across sky
      rocketGroup.position.x += 1.8 * delta;
      rocketGroup.position.y += 0.6 * delta;
      if (rocketGroup.position.x > 18) {
        rocketGroup.position.x = -16;
        rocketGroup.position.y = Math.random() * 4 - 1;
      }

      // Parallax smooth camera motion
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (-targetY + 2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* Floating Center Mission Mangal Overlay */}
      <div className="relative z-10 max-w-xl mx-auto p-6 text-center flex flex-col items-center">
        {/* Animated Mission Logo */}
        <div className="relative mb-4 group cursor-pointer">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-mangal-blue via-mangal-copper to-mangal-gold opacity-40 blur-xl group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
          <img
            src="/assets/mission-mangal-logo.png"
            alt="Mission Mangal 2.0 Emblem"
            className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_0_35px_rgba(46,139,255,0.6)] transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Title & Indian Flag / Nagpur Badge */}
        <div className="space-y-1 mb-5">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider drop-shadow-md">
            MANGAL HEALTH <span className="text-transparent bg-clip-text bg-gradient-to-r from-mangal-orange to-mangal-gold">SENTINEL</span>
          </h1>
          <p className="text-xs sm:text-sm font-display text-mangal-blue tracking-widest uppercase font-semibold">
            TEAM MISSION MANGAL 2.0 • NAGPUR, INDIA
          </p>
          <p className="text-[11px] font-mono text-slate-300 max-w-md mx-auto pt-1 leading-relaxed">
            NASA Space Apps Challenge — Autonomous Offline-First Physiological Monitoring & AI Decision Support for Long-Duration Mars Missions.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onEnter}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-mangal-copper via-mangal-orange to-mangal-gold hover:from-mangal-orange hover:to-mangal-gold text-white font-display font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(200,105,58,0.5)] transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5"
        >
          <span>Initialize Sentinel HUD</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        </button>

        <span className="text-[10px] font-mono text-slate-400 mt-4 tracking-wider">
          OFFLINE STORAGE: INDEXEDDB • WEB CRYPTO PBKDF2 • PWA OPERATIONAL
        </span>
      </div>
    </div>
  );
}
