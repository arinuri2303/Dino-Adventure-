import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Mountain,
  Trees,
  Waves,
  Home,
  Anchor,
  Compass,
  Sun,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { LANDFORM_ZONES_3D, LandformZone3D } from '../data/mpiData';
import { soundFX, speakIndonesian, stopSpeech } from '../utils/audio';

interface VirtualLab3DProps {
  onNavigateTab: (tab: string) => void;
}

// Pre-allocated math helpers at module scope (Zero GC in render loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export const VirtualLab3D: React.FC<VirtualLab3DProps> = ({ onNavigateTab }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Interactive Lab UI State
  const [selectedZone, setSelectedZone] = useState<LandformZone3D | null>(LANDFORM_ZONES_3D[0]);
  const [activeCameraPreset, setActiveCameraPreset] = useState<string>('overview');
  const [elevationMdpl, setElevationMdpl] = useState<number>(350);
  const [showElevationPlane, setShowElevationPlane] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [isForestDeforested, setIsForestDeforested] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Mutable refs for the WebGL animation loop so React state updates never recreate the scene
  const labStateRef = useRef({
    elevationMdpl: 350,
    showElevationPlane: true,
    isNightMode: false,
    isRaining: false,
    isForestDeforested: false,
    selectedZoneId: 'gunung',
    cameraFlyActive: false,
    targetCamPos: new THREE.Vector3(0, 19, 31),
    targetControlsLook: new THREE.Vector3(0, 3.2, -1)
  });

  useEffect(() => {
    labStateRef.current.elevationMdpl = elevationMdpl;
    labStateRef.current.showElevationPlane = showElevationPlane;
    labStateRef.current.isNightMode = isNightMode;
    labStateRef.current.isRaining = isRaining;
    labStateRef.current.isForestDeforested = isForestDeforested;
    labStateRef.current.selectedZoneId = selectedZone?.id || '';
  }, [elevationMdpl, showElevationPlane, isNightMode, isRaining, isForestDeforested, selectedZone]);

  // Keyboard shortcut 'H' to collapse/expand bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'h') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const flyToPreset = useCallback((presetId: string) => {
    soundFX.playClick();
    setActiveCameraPreset(presetId);
    if (presetId === 'overview') {
      labStateRef.current.targetCamPos.set(0, 19, 31);
      labStateRef.current.targetControlsLook.set(0, 3.2, -1);
      labStateRef.current.cameraFlyActive = true;
      return;
    }
    const zone = LANDFORM_ZONES_3D.find((z) => z.id === presetId);
    if (zone) {
      soundFX.playPinSelect();
      setSelectedZone(zone);
      labStateRef.current.targetCamPos.set(...zone.cameraPos);
      labStateRef.current.targetControlsLook.set(...zone.cameraTarget);
      labStateRef.current.cameraFlyActive = true;
    }
  }, []);

  const handleToggleSpeech = useCallback((zone: LandformZone3D) => {
    soundFX.playClick();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const text = `${zone.name}. Kategori ${zone.category}, ketinggian ${zone.elevationRange}, suhu rata-rata ${zone.avgTemp}. ${zone.description} Contoh di Indonesia: ${zone.indonesianExamples}. Mata pencaharian warga: ${zone.livelihoods}. Pesan pelestarian: ${zone.conservationTip}`;
      speakIndonesian(text, () => setIsSpeaking(false));
    }
  }, [isSpeaking]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL Detection (Strict Three.js skill standard)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const daySkyColor = new THREE.Color(0xdbeafe);
    const nightSkyColor = new THREE.Color(0x0b132b);
    const rainSkyColor = new THREE.Color(0x94a3b8);
    scene.background = daySkyColor.clone();
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.012);

    // 2. Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 180);
    camera.position.set(0, 19, 31);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minPolarAngle = 0.15;
    controls.minDistance = 8;
    controls.maxDistance = 58;
    controls.target.set(0, 3.2, -1);
    controls.update();

    // Cancel scripted camera fly-to if user manually drags/zooms OrbitControls
    const onControlsStart = () => {
      labStateRef.current.cameraFlyActive = false;
    };
    controls.addEventListener('start', onControlsStart);

    // 3. Balanced 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x3f6212, 0.85);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    keyLight.position.set(22, 32, 18);
    keyLight.castShadow = !isSoftwareGl;
    const d = 28;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 85;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.55);
    rimLight.position.set(-24, 18, -20);
    scene.add(rimLight);

    // 4. Procedural CanvasTextures (100% zero-404 procedural)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const createContactShadowTexture = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
      grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.22)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    const contactShadowTex = createContactShadowTexture();
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5
    });

    const createRockBumpTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) {
        const v = 90 + Math.floor(Math.random() * 110);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 8, 2 + Math.random() * 6);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };
    const rockBumpTex = createRockBumpTexture();

    const createSawahTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#3f6212';
      ctx.lineWidth = 6;
      for (let x = 0; x <= 256; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      for (let y = 0; y <= 256; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#84cc16';
      for (let py = 12; py < 256; py += 16) {
        for (let px = 12; px < 256; px += 16) {
          if (px % 64 !== 0 && py % 64 !== 0) {
            ctx.fillRect(px - 3, py - 3, 6, 6);
          }
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 2);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };
    const sawahTex = createSawahTexture();

    // ====================================================================
    // DIORAMA BASE & GEOLOGICAL CROSS-SECTION PLINTH
    // ====================================================================
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Geological Earth Crust Layer Base (3 layers: Mantle/Bedrock, Subsoil, Topographic Base)
    const crustGroup = new THREE.Group();
    const bedrockGeo = new THREE.BoxGeometry(50, 2.2, 28);
    const bedrockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.05 });
    const bedrockMesh = new THREE.Mesh(bedrockGeo, bedrockMat);
    bedrockMesh.position.y = -2.3;
    bedrockMesh.receiveShadow = true;
    crustGroup.add(bedrockMesh);

    const subsoilGeo = new THREE.BoxGeometry(50.2, 1.2, 28.2);
    const subsoilMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, metalness: 0.05 });
    const subsoilMesh = new THREE.Mesh(subsoilGeo, subsoilMat);
    subsoilMesh.position.y = -0.6;
    subsoilMesh.receiveShadow = true;
    crustGroup.add(subsoilMesh);
    worldGroup.add(crustGroup);

    // Clickable proxy array for Raycasting
    const clickableProxies: THREE.Object3D[] = [];
    const registerClickableZone = (zoneId: string, pos: [number, number, number], size: [number, number, number]) => {
      const proxyGeo = new THREE.BoxGeometry(...size);
      const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
      const proxy = new THREE.Mesh(proxyGeo, proxyMat);
      proxy.position.set(...pos);
      proxy.userData.zoneId = zoneId;
      worldGroup.add(proxy);
      clickableProxies.push(proxy);
    };

    // ====================================================================
    // ZONE 1: GUNUNG BERAPI & PEGUNUNGAN (>600 mdpl) — Left/Back (-17, y, -6)
    // Composite 9-part THREE.Group
    // ====================================================================
    const volcanoGroup = new THREE.Group();
    volcanoGroup.position.set(-16.5, 0, -6.5);

    // Part 1: Basal volcanic shield
    const shieldGeo = new THREE.CylinderGeometry(7.2, 9.8, 3.2, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x3f6212,
      roughness: 0.88,
      metalness: 0.05,
      bumpMap: rockBumpTex,
      bumpScale: 0.15
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.y = 1.6;
    shieldMesh.castShadow = true;
    shieldMesh.receiveShadow = true;
    volcanoGroup.add(shieldMesh);

    // Part 2: Main Volcanic Cone (LatheGeometry with natural slope curve)
    const volcanoLathePoints = [
      new THREE.Vector2(7.3, 3.0),
      new THREE.Vector2(5.6, 6.2),
      new THREE.Vector2(3.8, 9.8),
      new THREE.Vector2(2.3, 13.0),
      new THREE.Vector2(1.4, 12.2),
      new THREE.Vector2(0.0, 12.0)
    ];
    const volcanoConeGeo = new THREE.LatheGeometry(volcanoLathePoints, 28);
    // Add subtle organic ridge variation to vertices
    const posAttr = volcanoConeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const angle = Math.atan2(vz, vx);
      const r = Math.sqrt(vx * vx + vz * vz);
      if (r > 1.8 && vy < 12.6) {
        const ridge = Math.sin(angle * 7) * 0.35 + Math.cos(angle * 4 + vy * 0.5) * 0.22;
        posAttr.setX(i, vx + Math.cos(angle) * ridge);
        posAttr.setZ(i, vz + Math.sin(angle) * ridge);
      }
    }
    volcanoConeGeo.computeVertexNormals();

    const volcanoRockMat = new THREE.MeshStandardMaterial({
      color: 0x57534e,
      roughness: 0.92,
      metalness: 0.08,
      bumpMap: rockBumpTex,
      bumpScale: 0.28
    });
    const volcanoConeMesh = new THREE.Mesh(volcanoConeGeo, volcanoRockMat);
    volcanoConeMesh.castShadow = true;
    volcanoConeMesh.receiveShadow = true;
    volcanoGroup.add(volcanoConeMesh);

    // Part 3: Jagged Caldera Crater Rim
    const calderaRimGeo = new THREE.TorusGeometry(2.15, 0.38, 10, 24);
    const calderaRimMat = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.95,
      metalness: 0.12
    });
    const calderaRim = new THREE.Mesh(calderaRimGeo, calderaRimMat);
    calderaRim.rotation.x = Math.PI / 2;
    calderaRim.position.y = 12.85;
    volcanoGroup.add(calderaRim);

    // Part 4: Glowing Magma Pool inside Crater
    const magmaGeo = new THREE.CircleGeometry(1.9, 24);
    const magmaMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xf97316,
      emissiveIntensity: 2.2,
      roughness: 0.3,
      metalness: 0.1
    });
    const magmaMesh = new THREE.Mesh(magmaGeo, magmaMat);
    magmaMesh.rotation.x = -Math.PI / 2;
    magmaMesh.position.y = 12.45;
    volcanoGroup.add(magmaMesh);

    // Part 5: Central Lava Dome Mound
    const lavaDomeGeo = new THREE.SphereGeometry(0.75, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const lavaDomeMat = new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      emissive: 0xea580c,
      emissiveIntensity: 1.4,
      roughness: 0.6,
      metalness: 0.2
    });
    const lavaDome = new THREE.Mesh(lavaDomeGeo, lavaDomeMat);
    lavaDome.position.y = 12.45;
    volcanoGroup.add(lavaDome);

    // Part 6: Lava Flow Channel down the front-east flank
    const lavaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.6, 12.5, 0.9),
      new THREE.Vector3(2.8, 9.8, 1.8),
      new THREE.Vector3(4.2, 6.8, 2.7),
      new THREE.Vector3(5.4, 4.2, 3.2)
    ]);
    const lavaStreamGeo = new THREE.TubeGeometry(lavaCurve, 20, 0.24, 8, false);
    const lavaStream = new THREE.Mesh(lavaStreamGeo, magmaMat);
    volcanoGroup.add(lavaStream);

    // Part 7 & 8: Pegunungan Ridge (Mountain Chain + Snow-capped Jayawijaya Peak)
    const ridgePeak1Geo = new THREE.ConeGeometry(5.5, 11.2, 16);
    const ridgePeak1Mat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.85,
      metalness: 0.04,
      bumpMap: rockBumpTex,
      bumpScale: 0.18
    });
    const ridgePeak1 = new THREE.Mesh(ridgePeak1Geo, ridgePeak1Mat);
    ridgePeak1.position.set(8.2, 5.6, -2.5);
    ridgePeak1.castShadow = true;
    ridgePeak1.receiveShadow = true;
    volcanoGroup.add(ridgePeak1);

    // Snow Cap on Pegunungan Peak (Pegunungan Jayawijaya representation)
    const snowCapGeo = new THREE.ConeGeometry(2.35, 3.8, 16);
    const snowCapMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1
    });
    const snowCap = new THREE.Mesh(snowCapGeo, snowCapMat);
    snowCap.position.set(8.2, 9.45, -2.5);
    volcanoGroup.add(snowCap);

    // Crater Point Light for warm volcanic glow
    const craterLight = new THREE.PointLight(0xf97316, 3.5, 18, 1.8);
    craterLight.position.set(0, 13.8, 0);
    volcanoGroup.add(craterLight);

    worldGroup.add(volcanoGroup);
    registerClickableZone('gunung', [-14.5, 6.5, -6.5], [16, 13, 12]);

    // Volcanic Smoke & Ember Particles (24 puff spheres in a Group)
    const smokeGroup = new THREE.Group();
    smokeGroup.position.set(-16.5, 13.0, -6.5);
    const smokeGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const smokePuffs: { mesh: THREE.Mesh; phase: number; speed: number; radialAngle: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: i % 4 === 0 ? 0xfdba74 : 0xe2e8f0,
        emissive: i % 4 === 0 ? 0xea580c : 0x000000,
        emissiveIntensity: i % 4 === 0 ? 0.6 : 0,
        roughness: 0.9,
        transparent: true,
        opacity: 0.65
      });
      const puff = new THREE.Mesh(smokeGeo, mat);
      smokeGroup.add(puff);
      smokePuffs.push({
        mesh: puff,
        phase: (i / 18) * Math.PI * 2,
        speed: 0.55 + (i % 5) * 0.12,
        radialAngle: i * 1.1
      });
    }
    worldGroup.add(smokeGroup);

    // ====================================================================
    // ZONE 2: DATARAN TINGGI, BUKIT & TERASERING (200–600 mdpl)
    // Composite multi-part plateau + 6-step tea terraces + highland pendopo
    // ====================================================================
    const highlandGroup = new THREE.Group();
    highlandGroup.position.set(-5.5, 0, -3.5);

    // Plateau Main Massif
    const plateauBaseGeo = new THREE.BoxGeometry(13.5, 4.4, 14.5);
    const plateauBaseMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.82,
      metalness: 0.04
    });
    const plateauBase = new THREE.Mesh(plateauBaseGeo, plateauBaseMat);
    plateauBase.position.y = 2.2;
    plateauBase.castShadow = true;
    plateauBase.receiveShadow = true;
    highlandGroup.add(plateauBase);

    // 6-Tiered Tea Plantation Terasering (Sengkedan)
    const terraceColors = [0x15803d, 0x16a34a, 0x22c55e, 0x15803d, 0x16a34a, 0x4ade80];
    for (let t = 0; t < 6; t++) {
      const stepW = 9.5 - t * 1.1;
      const stepD = 8.5 - t * 0.9;
      const stepGeo = new THREE.BoxGeometry(stepW, 0.38, stepD);
      const stepMat = new THREE.MeshStandardMaterial({
        color: terraceColors[t],
        roughness: 0.65 + (t % 2) * 0.2,
        metalness: 0.05
      });
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(-0.8, 4.4 + t * 0.36, 1.2 - t * 0.35);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      highlandGroup.add(stepMesh);
    }

    // Rounded Bukit (Hill with smooth dome)
    const bukitGeo = new THREE.SphereGeometry(3.4, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const bukitMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d,
      roughness: 0.78,
      metalness: 0.04
    });
    const bukitMesh = new THREE.Mesh(bukitGeo, bukitMat);
    bukitMesh.position.set(3.8, 4.3, -3.2);
    bukitMesh.scale.set(1.2, 0.85, 1.1);
    bukitMesh.castShadow = true;
    bukitMesh.receiveShadow = true;
    highlandGroup.add(bukitMesh);

    // Composite 7-Part Highland Agrotourism Pendopo / Villa
    const pendopoGroup = new THREE.Group();
    pendopoGroup.position.set(-2.2, 6.55, 0.2);

    const pendopoShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), contactShadowMat);
    pendopoShadow.rotation.x = -Math.PI / 2;
    pendopoShadow.position.y = 0.02;
    pendopoGroup.add(pendopoShadow);

    const plinthMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.28, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85, metalness: 0.1 })
    );
    plinthMesh.position.y = 0.14;
    pendopoGroup.add(plinthMesh);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.55, metalness: 0.15 });
    const pillarOffsets = [
      [-0.95, 0.75, -0.75],
      [0.95, 0.75, -0.75],
      [-0.95, 0.75, 0.75],
      [0.95, 0.75, 0.75]
    ];
    pillarOffsets.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.0, 8), pillarMat);
      p.position.set(px, py, pz);
      p.castShadow = true;
      pendopoGroup.add(p);
    });

    const roofLower = new THREE.Mesh(
      new THREE.ConeGeometry(1.9, 0.75, 4),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45, metalness: 0.25 })
    );
    roofLower.position.y = 1.55;
    roofLower.rotation.y = Math.PI / 4;
    roofLower.castShadow = true;
    pendopoGroup.add(roofLower);

    const roofUpper = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 0.65, 4),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.35 })
    );
    roofUpper.position.y = 2.0;
    roofUpper.rotation.y = Math.PI / 4;
    pendopoGroup.add(roofUpper);

    highlandGroup.add(pendopoGroup);
    worldGroup.add(highlandGroup);
    registerClickableZone('dataran-tinggi', [-5.5, 4.5, -3.5], [12, 6, 12]);

    // ====================================================================
    // ZONE 3: LEMBAH, DANAU VULKANIK & SUNGAI MENGALIR
    // ====================================================================
    const riverLakeGroup = new THREE.Group();

    // Upland Volcanic/Tectonic Lake (Danau Toba representation)
    const lakeRimGeo = new THREE.RingGeometry(2.6, 3.5, 24);
    const lakeRimMat = new THREE.MeshStandardMaterial({
      color: 0x3f6212,
      roughness: 0.85,
      side: THREE.DoubleSide
    });
    const lakeRim = new THREE.Mesh(lakeRimGeo, lakeRimMat);
    lakeRim.rotation.x = -Math.PI / 2;
    lakeRim.position.set(-0.5, 4.42, -6.2);
    riverLakeGroup.add(lakeRim);

    const lakeWaterGeo = new THREE.CircleGeometry(2.75, 28);
    const lakeWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.65
    });
    const lakeWater = new THREE.Mesh(lakeWaterGeo, lakeWaterMat);
    lakeWater.rotation.x = -Math.PI / 2;
    lakeWater.position.set(-0.5, 4.44, -6.2);
    riverLakeGroup.add(lakeWater);

    // Small Volcanic Island in center of Danau (Pulau Samosir miniature!)
    const samosirIsland = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.75 })
    );
    samosirIsland.position.set(-0.5, 4.65, -6.2);
    riverLakeGroup.add(samosirIsland);

    // Winding River from Hulu (Mountain/Lake) through Lembah & Dataran Rendah to Muara (Sea)
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-11.5, 7.8, -5.0), // Hulu at mountain slope
      new THREE.Vector3(-6.5, 5.2, -5.2),
      new THREE.Vector3(-0.5, 4.35, -5.5), // Connects with Lake
      new THREE.Vector3(0.8, 2.3, -1.5), // Cascade into Lembah
      new THREE.Vector3(2.4, 1.38, 2.5), // Meander through Dataran Rendah
      new THREE.Vector3(5.8, 1.32, 5.8),
      new THREE.Vector3(10.8, 0.95, 6.2) // Muara at Sea
    ]);
    const riverTubeGeo = new THREE.TubeGeometry(riverCurve, 64, 0.65, 10, false);
    riverTubeGeo.scale(1.5, 0.22, 1.5);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
      roughness: 0.15,
      metalness: 0.55
    });
    const riverMesh = new THREE.Mesh(riverTubeGeo, riverMat);
    riverLakeGroup.add(riverMesh);

    // Animated River Flow Droplets (28 droplets traveling along riverCurve)
    const flowDropsGroup = new THREE.Group();
    const dropGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const dropMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 });
    const riverDrops: { mesh: THREE.Mesh; t: number; speed: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const m = new THREE.Mesh(dropGeo, dropMat);
      flowDropsGroup.add(m);
      riverDrops.push({
        mesh: m,
        t: i / 28,
        speed: 0.08 + (i % 4) * 0.015
      });
    }
    riverLakeGroup.add(flowDropsGroup);

    // 5-Part Stone Arch Bridge over River in the Valley
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(1.6, 1.35, 0.8);
    bridgeGroup.rotation.y = -0.45;
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8, metalness: 0.1 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.35 });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 1.2), stoneMat);
    deck.position.y = 0.65;
    deck.castShadow = true;
    bridgeGroup.add(deck);

    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, 0.12), railMat);
    railLeft.position.set(0, 0.9, 0.52);
    bridgeGroup.add(railLeft);

    const railRight = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, 0.12), railMat);
    railRight.position.set(0, 0.9, -0.52);
    bridgeGroup.add(railRight);

    const pierL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 1.2), stoneMat);
    pierL.position.set(-1.3, 0.35, 0);
    bridgeGroup.add(pierL);

    const pierR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 1.2), stoneMat);
    pierR.position.set(1.3, 0.35, 0);
    bridgeGroup.add(pierR);

    riverLakeGroup.add(bridgeGroup);
    worldGroup.add(riverLakeGroup);
    registerClickableZone('sungai-danau', [-0.2, 3.8, -3.5], [8, 5, 11]);

    // ====================================================================
    // ZONE 4: DATARAN RENDAH, SAWAH & PEMUKIMAN (0–200 mdpl)
    // ====================================================================
    const lowlandGroup = new THREE.Group();
    lowlandGroup.position.set(5.5, 0, 2.0);

    // Lowland Fertile Alluvial Plain
    const lowlandPlainGeo = new THREE.BoxGeometry(13.5, 1.3, 19.5);
    const lowlandPlainMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      roughness: 0.85,
      metalness: 0.02
    });
    const lowlandPlain = new THREE.Mesh(lowlandPlainGeo, lowlandPlainMat);
    lowlandPlain.position.set(0, 0.65, 0);
    lowlandPlain.receiveShadow = true;
    lowlandGroup.add(lowlandPlain);

    // Irrigated Rice Paddies (Sawah Plot with bund border & procedural texture)
    const sawahPlotGeo = new THREE.BoxGeometry(5.6, 0.08, 6.2);
    const sawahPlotMat = new THREE.MeshStandardMaterial({
      map: sawahTex,
      roughness: 0.35,
      metalness: 0.25
    });
    const sawahPlot = new THREE.Mesh(sawahPlotGeo, sawahPlotMat);
    sawahPlot.position.set(-2.2, 1.34, -3.2);
    sawahPlot.receiveShadow = true;
    lowlandGroup.add(sawahPlot);

    // Helper to build a 6-part Indonesian Village House (Rumah Penduduk)
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.15,
      roughness: 0.2
    });

    const createVillageHouse = (hx: number, hz: number, rotY: number, roofHex: number) => {
      const hGroup = new THREE.Group();
      hGroup.position.set(hx, 1.3, hz);
      hGroup.rotation.y = rotY;

      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3), contactShadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      hGroup.add(shadow);

      // 1. Stone foundation plinth
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.22, 1.35),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 })
      );
      base.position.y = 0.11;
      hGroup.add(base);

      // 2. Main house body
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.85, 1.15),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 })
      );
      walls.position.y = 0.64;
      walls.castShadow = true;
      walls.receiveShadow = true;
      hGroup.add(walls);

      // 3. Pitched terracotta roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.32, 0.75, 4),
        new THREE.MeshStandardMaterial({ color: roofHex, roughness: 0.5, metalness: 0.15 })
      );
      roof.position.y = 1.42;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      hGroup.add(roof);

      // 4. Timber door
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.52, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
      );
      door.position.set(0, 0.48, 0.58);
      hGroup.add(door);

      // 5 & 6. Illuminated windows
      const winL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.06), windowMat);
      winL.position.set(-0.42, 0.66, 0.58);
      hGroup.add(winL);

      const winR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.06), windowMat);
      winR.position.set(0.42, 0.66, 0.58);
      hGroup.add(winR);

      return hGroup;
    };

    lowlandGroup.add(createVillageHouse(2.2, -2.5, 0.2, 0xdc2626));
    lowlandGroup.add(createVillageHouse(3.8, -0.2, -0.35, 0xea580c));
    lowlandGroup.add(createVillageHouse(1.5, 1.8, 0.1, 0xb45309));
    lowlandGroup.add(createVillageHouse(-1.5, 5.2, 0.4, 0xd97706));

    worldGroup.add(lowlandGroup);
    registerClickableZone('dataran-rendah', [6.0, 2.2, 1.5], [11, 4, 14]);

    // ====================================================================
    // ZONE 5: PANTAI, RAWA BAKAU, TELUK, SELAT & LAUT (0 mdpl)
    // ====================================================================
    const oceanGroup = new THREE.Group();

    // Sandy Beach Shoreline (Pantai)
    const beachGeo = new THREE.BoxGeometry(3.2, 1.05, 19.5);
    const beachMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.85, metalness: 0.02 });
    const beachMesh = new THREE.Mesh(beachGeo, beachMat);
    beachMesh.position.set(12.2, 0.52, 2.0);
    beachMesh.receiveShadow = true;
    oceanGroup.add(beachMesh);

    // Sheltered Bay Headland (Teluk & Dermaga Pelabuhan)
    const bayHeadland = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.2, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.8 })
    );
    bayHeadland.position.set(14.5, 0.6, -5.2);
    oceanGroup.add(bayHeadland);

    // Wooden Harbor Pier in the calm Teluk (Bay)
    const pierGroup = new THREE.Group();
    pierGroup.position.set(13.8, 1.15, -1.5);
    const pierDeck = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.14, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
    );
    pierGroup.add(pierDeck);
    for (let p = -1.2; p <= 1.2; p += 0.8) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
      );
      post.position.set(p, -0.5, 0.35);
      pierGroup.add(post);
    }
    oceanGroup.add(pierGroup);

    // 6-Part Coastal Lighthouse (Mercusuar) on Headland
    const lighthouseGroup = new THREE.Group();
    lighthouseGroup.position.set(15.6, 1.2, -5.2);
    const lhBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.8, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
    );
    lhBase.position.y = 0.25;
    lighthouseGroup.add(lhBase);

    const lhTower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.58, 2.6, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    lhTower.position.y = 1.8;
    lhTower.castShadow = true;
    lighthouseGroup.add(lhTower);

    const lhStripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.51, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 })
    );
    lhStripe.position.y = 1.8;
    lighthouseGroup.add(lhStripe);

    const lhLantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.45, 12),
      windowMat
    );
    lhLantern.position.y = 3.3;
    lighthouseGroup.add(lhLantern);

    const lhCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.3 })
    );
    lhCap.position.y = 3.75;
    lighthouseGroup.add(lhCap);
    oceanGroup.add(lighthouseGroup);

    // Offshore Island creating a Selat (Strait between Main Island & Outer Island)
    const outerIslandGroup = new THREE.Group();
    outerIslandGroup.position.set(21.2, 0.4, -2.5);
    const outerIsleBase = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 2.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    outerIsleBase.position.y = 1.0;
    outerIsleBase.castShadow = true;
    outerIslandGroup.add(outerIsleBase);

    const outerIsleBeach = new THREE.Mesh(
      new THREE.CylinderGeometry(3.3, 3.6, 0.5, 16),
      beachMat
    );
    outerIsleBeach.position.y = 0.25;
    outerIslandGroup.add(outerIsleBeach);
    oceanGroup.add(outerIslandGroup);

    // Coastal Rawa Bakau (Mangrove Cluster on Southern Coast)
    const mangroveGroup = new THREE.Group();
    mangroveGroup.position.set(12.6, 0.9, 8.2);
    const rootMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 });
    const mangroveLeafMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.7 });
    for (let m = 0; m < 5; m++) {
      const mx = (m - 2) * 0.9;
      const mz = (m % 2) * 0.7;
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), mangroveLeafMat);
      canopy.position.set(mx, 0.95, mz);
      canopy.castShadow = true;
      mangroveGroup.add(canopy);
      for (let r = 0; r < 3; r++) {
        const root = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.85, 6), rootMat);
        root.position.set(mx + (r - 1) * 0.18, 0.35, mz + (r % 2) * 0.15);
        root.rotation.z = (r - 1) * 0.25;
        mangroveGroup.add(root);
      }
    }
    oceanGroup.add(mangroveGroup);

    // Animated Ocean Water Surface (with onBeforeCompile PBR wave displacement)
    const seaGeo = new THREE.PlaneGeometry(16, 26, 36, 36);
    seaGeo.rotateX(-Math.PI / 2);
    const seaUniforms = { uTime: { value: 0 } };
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.14,
      metalness: 0.65,
      transparent: true,
      opacity: 0.9
    });
    seaMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = seaUniforms.uTime;
      shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float wave1 = sin(transformed.x * 0.9 + uTime * 2.1) * 0.09;
        float wave2 = cos(transformed.z * 0.75 + uTime * 1.7) * 0.07;
        transformed.y += wave1 + wave2;
        `
      );
    };
    const seaMesh = new THREE.Mesh(seaGeo, seaMat);
    seaMesh.position.set(17.5, 0.78, 0.5);
    seaMesh.receiveShadow = true;
    oceanGroup.add(seaMesh);

    // 6-Part Traditional Outrigger Sailboat (Perahu Cadik Nusantara)
    const boatGroup = new THREE.Group();
    boatGroup.position.set(17.2, 0.88, 3.8);

    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.32, 0.58),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6, metalness: 0.1 })
    );
    hull.castShadow = true;
    boatGroup.add(hull);

    const outriggerBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    outriggerBeam.position.set(0, 0.1, 0);
    boatGroup.add(outriggerBeam);

    const floatL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    floatL.rotation.z = Math.PI / 2;
    floatL.position.set(0, 0.02, 0.82);
    boatGroup.add(floatL);

    const floatR = floatL.clone();
    floatR.position.set(0, 0.02, -0.82);
    boatGroup.add(floatR);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 1.65, 8),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
    );
    mast.position.set(0.1, 0.9, 0);
    boatGroup.add(mast);

    const sail = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.15, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    sail.position.set(0.05, 1.05, 0);
    sail.rotation.y = 0.25;
    sail.castShadow = true;
    boatGroup.add(sail);

    oceanGroup.add(boatGroup);
    worldGroup.add(oceanGroup);
    registerClickableZone('pantai-laut', [17.0, 2.0, 1.5], [12, 4.5, 16]);

    // ====================================================================
    // INSTANCED MESH TREES (65 Highland & Mountain Trees — InstancedMesh rule)
    // ====================================================================
    const treeCount = 65;
    const trunkGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.7, 7);
    trunkGeo.translate(0, 0.35, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);

    const foliageGeo = new THREE.ConeGeometry(0.52, 1.35, 8);
    foliageGeo.translate(0, 1.15, 0);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const foliageInstanced = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
    foliageInstanced.castShadow = !isSoftwareGl;

    const treePositions: { x: number; y: number; z: number; scale: number; isMountainTree: boolean }[] = [];
    for (let i = 0; i < treeCount; i++) {
      let tx = 0;
      let ty = 1.3;
      let tz = 0;
      let isMountainTree = false;
      if (i < 28) {
        // Mountain slope forest (affected by deforestation toggle!)
        const angle = (i / 28) * Math.PI * 1.4 - 0.8;
        const radius = 5.4 + (i % 4) * 0.9;
        tx = -16.5 + Math.cos(angle) * radius;
        tz = -6.5 + Math.sin(angle) * radius;
        ty = 3.2 + (9.5 - radius) * 0.65;
        isMountainTree = true;
      } else if (i < 50) {
        // Highland plateau & bukit trees
        tx = -10.5 + ((i * 3.7) % 9.5);
        tz = -8.5 + ((i * 2.3) % 10.5);
        ty = 4.4;
      } else {
        // Lowland & river bank trees
        tx = 1.5 + ((i * 2.9) % 8.5);
        tz = -6.0 + ((i * 4.1) % 13.0);
        ty = 1.3;
      }
      const sc = 0.85 + (i % 5) * 0.1;
      treePositions.push({ x: tx, y: ty, z: tz, scale: sc, isMountainTree });

      _dummy.position.set(tx, ty, tz);
      _dummy.scale.setScalar(sc);
      _dummy.rotation.y = i * 0.9;
      _dummy.updateMatrix();
      trunkInstanced.setMatrixAt(i, _dummy.matrix);
      foliageInstanced.setMatrixAt(i, _dummy.matrix);

      _color.setHex(i % 3 === 0 ? 0x15803d : i % 3 === 1 ? 0x166534 : 0x059669);
      foliageInstanced.setColorAt(i, _color);
    }
    trunkInstanced.instanceMatrix.needsUpdate = true;
    foliageInstanced.instanceMatrix.needsUpdate = true;
    if (foliageInstanced.instanceColor) foliageInstanced.instanceColor.needsUpdate = true;
    trunkInstanced.computeBoundingSphere();
    foliageInstanced.computeBoundingSphere();
    worldGroup.add(trunkInstanced);
    worldGroup.add(foliageInstanced);

    // ====================================================================
    // 3D INTERACTIVE PIN MARKERS (Composite Beacon + Ring)
    // ====================================================================
    const pinMarkers: { id: string; group: THREE.Group; baseY: number }[] = [];
    LANDFORM_ZONES_3D.forEach((zone) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(...zone.pinPosition);

      const pinSphere = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 1),
        new THREE.MeshStandardMaterial({
          color: zone.colorHex,
          emissive: zone.colorHex,
          emissiveIntensity: 0.45,
          roughness: 0.25,
          metalness: 0.3
        })
      );
      pinSphere.userData.zoneId = zone.id;
      pGroup.add(pinSphere);
      clickableProxies.push(pinSphere);

      const pinStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
      );
      pinStem.position.y = -0.65;
      pGroup.add(pinStem);

      worldGroup.add(pGroup);
      pinMarkers.push({ id: zone.id, group: pGroup, baseY: zone.pinPosition[1] });
    });

    // ====================================================================
    // 3D ELEVATION SLICER PLANE (0 – 1500 mdpl Interactive Measurement)
    // ====================================================================
    const elevationGroup = new THREE.Group();
    const slicerPlaneGeo = new THREE.PlaneGeometry(50, 28);
    slicerPlaneGeo.rotateX(-Math.PI / 2);
    const slicerPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const slicerPlane = new THREE.Mesh(slicerPlaneGeo, slicerPlaneMat);
    elevationGroup.add(slicerPlane);

    const slicerBorderGeo = new THREE.EdgesGeometry(slicerPlaneGeo);
    const slicerBorderMat = new THREE.LineBasicMaterial({ color: 0x10b981 });
    const slicerBorder = new THREE.LineSegments(slicerBorderGeo, slicerBorderMat);
    elevationGroup.add(slicerBorder);
    worldGroup.add(elevationGroup);

    // ====================================================================
    // RAIN CLOUD & RAINFALL PARTICLE SYSTEM (Hydrological Simulation)
    // ====================================================================
    const rainGroup = new THREE.Group();
    rainGroup.visible = false;

    // Fluffy procedural clouds over mountain & plateau
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
    for (let c = 0; c < 12; c++) {
      const cloudPuff = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + (c % 3) * 0.5, 1), cloudMat);
      cloudPuff.position.set(-16 + (c % 6) * 3.8, 15.8 + (c % 2) * 0.6, -6 + Math.floor(c / 6) * 4.5);
      rainGroup.add(cloudPuff);
    }

    // Raindrop lines
    const rainCount = 160;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = -20 + Math.random() * 34;
      rainPositions[i * 3 + 1] = 2 + Math.random() * 14;
      rainPositions[i * 3 + 2] = -10 + Math.random() * 18;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.22,
      transparent: true,
      opacity: 0.85
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainGroup.add(rainPoints);
    worldGroup.add(rainGroup);

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ====================================================================
    // RAYCASTING (Click on 3D Landforms or Pins)
    // ====================================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore drag gestures

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(clickableProxies, false);
      if (intersects.length > 0) {
        const hitZoneId = intersects[0].object.userData.zoneId;
        const foundZone = LANDFORM_ZONES_3D.find((z) => z.id === hitZoneId);
        if (foundZone) {
          soundFX.playPinSelect();
          setSelectedZone(foundZone);
          setActiveCameraPreset(foundZone.id);
          labStateRef.current.targetCamPos.set(...foundZone.cameraPos);
          labStateRef.current.targetControlsLook.set(...foundZone.cameraTarget);
          labStateRef.current.cameraFlyActive = true;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // ====================================================================
    // ANIMATION LOOP (With strict software WebGL fenceSync pacing)
    // ====================================================================
    const clock = new THREE.Clock();
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const st = labStateRef.current;

      // 1. Smoothly damp Camera Fly-To transitions
      if (st.cameraFlyActive) {
        const dampFactor = 1 - Math.exp(-4.5 * dt);
        camera.position.lerp(st.targetCamPos, dampFactor);
        controls.target.lerp(st.targetControlsLook, dampFactor);
        if (
          camera.position.distanceToSquared(st.targetCamPos) < 0.04 &&
          controls.target.distanceToSquared(st.targetControlsLook) < 0.04
        ) {
          st.cameraFlyActive = false;
        }
      }
      controls.update();

      // 2. Update Ocean Wave Shader Uniform & Outrigger Boat Bobbing
      seaUniforms.uTime.value = elapsed;
      boatGroup.position.y = 0.88 + Math.sin(elapsed * 2.2) * 0.06;
      boatGroup.rotation.z = Math.sin(elapsed * 1.7) * 0.05;
      boatGroup.rotation.x = Math.cos(elapsed * 1.4) * 0.03;

      // 3. Animate Volcanic Smoke Puffs
      smokePuffs.forEach((p) => {
        const progress = ((elapsed * p.speed + p.phase) % 3.2) / 3.2;
        const y = progress * 4.2;
        const spread = 0.35 + progress * 1.5;
        p.mesh.position.set(
          Math.cos(p.radialAngle + elapsed * 0.4) * spread,
          y,
          Math.sin(p.radialAngle + elapsed * 0.4) * spread
        );
        const s = 0.45 + Math.sin(progress * Math.PI) * 0.85;
        p.mesh.scale.setScalar(s);
      });

      // 4. Animate River Flow Particles (Faster when raining)
      const flowSpeedMult = st.isRaining ? 2.4 : 1.0;
      riverDrops.forEach((d) => {
        d.t = (d.t + dt * d.speed * flowSpeedMult) % 1;
        riverCurve.getPointAt(d.t, _vec3A);
        d.mesh.position.copy(_vec3A);
        d.mesh.position.y += 0.14;
      });

      // 5. Update River Color based on Deforestation + Rain (Erosion/Flood simulation!)
      if (st.isForestDeforested && st.isRaining) {
        riverMat.color.lerp(_color.setHex(0x92400e), dt * 3); // Murky brown floodwater
      } else {
        riverMat.color.lerp(_color.setHex(0x0ea5e9), dt * 3); // Clear blue river
      }

      // 6. Update Mountain Forest Trees visibility when Deforested vs Reforested
      treePositions.forEach((tp, idx) => {
        _dummy.position.set(tp.x, tp.y, tp.z);
        const targetScale = tp.isMountainTree && st.isForestDeforested ? 0.001 : tp.scale;
        _dummy.scale.setScalar(targetScale);
        _dummy.rotation.y = idx * 0.9;
        _dummy.updateMatrix();
        trunkInstanced.setMatrixAt(idx, _dummy.matrix);
        foliageInstanced.setMatrixAt(idx, _dummy.matrix);
      });
      trunkInstanced.instanceMatrix.needsUpdate = true;
      foliageInstanced.instanceMatrix.needsUpdate = true;

      // 7. Animate Rain Particles
      rainGroup.visible = st.isRaining;
      if (st.isRaining) {
        const rAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < rainCount; i++) {
          let ry = rAttr.getY(i) - dt * 16;
          if (ry < 1.0) ry = 15.5;
          rAttr.setY(i, ry);
        }
        rAttr.needsUpdate = true;
      }

      // 8. Update 3D Elevation Slicer Plane (0 - 1500 mdpl mapped to Y: 0.85 to 12.85)
      elevationGroup.visible = st.showElevationPlane;
      if (st.showElevationPlane) {
        const targetY = 0.85 + (st.elevationMdpl / 1500) * 12.0;
        elevationGroup.position.y = THREE.MathUtils.damp(elevationGroup.position.y, targetY, 8, dt);
        if (st.elevationMdpl <= 200) {
          slicerPlaneMat.color.setHex(0x84cc16);
          slicerBorderMat.color.setHex(0x84cc16);
        } else if (st.elevationMdpl <= 600) {
          slicerPlaneMat.color.setHex(0x10b981);
          slicerBorderMat.color.setHex(0x10b981);
        } else {
          slicerPlaneMat.color.setHex(0xf97316);
          slicerBorderMat.color.setHex(0xf97316);
        }
      }

      // 9. Animate 3D Pin Markers gentle hover bob
      pinMarkers.forEach((pm) => {
        const isSelected = pm.id === st.selectedZoneId;
        pm.group.position.y = pm.baseY + Math.sin(elapsed * 2.6 + pm.baseY) * 0.18;
        pm.group.scale.setScalar(isSelected ? 1.28 : 1.0);
      });

      // 10. Day / Night / Rain Atmosphere Interpolation
      const targetSky = st.isNightMode ? nightSkyColor : st.isRaining ? rainSkyColor : daySkyColor;
      (scene.background as THREE.Color).lerp(targetSky, dt * 3);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(targetSky, dt * 3);
      }
      keyLight.intensity = THREE.MathUtils.damp(
        keyLight.intensity,
        st.isNightMode ? 0.35 : st.isRaining ? 0.95 : 1.85,
        4,
        dt
      );
      hemiLight.intensity = THREE.MathUtils.damp(
        hemiLight.intensity,
        st.isNightMode ? 0.25 : 0.85,
        4,
        dt
      );
      windowMat.emissiveIntensity = st.isNightMode ? 2.2 : 0.15;
      craterLight.intensity = st.isNightMode ? 5.5 : 3.2;

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlsStart);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Compute elevation zone classification & lapse rate temperature
  const elevationZoneLabel =
    elevationMdpl <= 200
      ? 'Dataran Rendah (0 – 200 mdpl)'
      : elevationMdpl <= 600
      ? 'Dataran Tinggi & Bukit (200 – 600 mdpl)'
      : 'Gunung & Pegunungan (> 600 mdpl)';

  const estimatedTempC = Math.max(9, Math.round((29 - (elevationMdpl / 100) * 0.6) * 10) / 10);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-900 select-none">
      {/* Isolated Full-Bleed WebGL Canvas Container */}
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Compact Landform Inspector Card (Solid/RGBA surface — zero backdrop-filter over WebGL) */}
      {selectedZone && (
        <div className="absolute top-4 left-4 z-10 w-[min(410px,92vw)] bg-slate-900/95 text-slate-100 rounded-xl border border-slate-700/80 p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-emerald-400">
                Zona Bentang Alam · {selectedZone.category} · {selectedZone.elevationRange}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{selectedZone.name}</h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggleSpeech(selectedZone)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Dengarkan Penjelasan Suara Bahasa Indonesia"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Hentikan' : 'Suara'}</span>
              </button>
              <button
                onClick={() => setSelectedZone(null)}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Tutup Kartu Informasi"
              >
                Tutup
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            {selectedZone.description}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Suhu & Ketinggian</span>
              <span className="font-mono font-semibold text-amber-300 tabular-nums">{selectedZone.avgTemp}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tanaman & Biota Khas</span>
              <span className="font-medium text-slate-200">{selectedZone.floraFauna}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">Mata Pencaharian Penduduk</span>
              <span className="font-medium text-emerald-300">{selectedZone.livelihoods}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">Contoh Nyata di Indonesia</span>
              <span className="font-medium text-sky-300">{selectedZone.indonesianExamples}</span>
            </div>
          </div>

          {isRaining && isForestDeforested && (
            <div className="mt-2.5 p-2 rounded-lg bg-red-950/90 border border-red-700/80 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>Peringatan Erosi & Banjir:</strong> Hutan hulu gundul menyebabkan air hujan tidak terserap akar dan membuat sungai keruh berlumpur!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Re-open Inspector Button if closed */}
      {!selectedZone && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => setSelectedZone(LANDFORM_ZONES_3D[0])}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900/95 text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Tampilkan Kartu Info 3D (Klik Objek 3D)</span>
          </button>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Flank Occlusion, <= 15% footprint) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-20 w-[min(940px,95vw)] transition-transform duration-200 ${
          isDockCollapsed ? 'bottom-0 translate-y-[calc(100%-36px)]' : 'bottom-4 translate-y-0'
        }`}
      >
        {/* Collapse / Expand Handle Bar */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900/95 text-slate-200 hover:text-white rounded-t-xl border border-b-0 border-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tampilkan Kontrol Lab 3D (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sembunyikan Kontrol (Mode Layar Penuh · H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Body (Solid rgba surface, no backdrop-filter) */}
        <div className="bg-slate-900/95 text-slate-100 rounded-xl border border-slate-700 px-4 py-3 shadow-2xl">
          {/* Row 1: Camera Fly-To Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => flyToPreset('overview')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCameraPreset === 'overview'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Semua Diorama</span>
              </button>

              <button
                onClick={() => flyToPreset('gunung')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCameraPreset === 'gunung'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Fokus Gunung</span>
              </button>

              <button
                onClick={() => flyToPreset('dataran-tinggi')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCameraPreset === 'dataran-tinggi'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Trees className="w-3.5 h-3.5" />
                <span>Fokus Dataran Tinggi</span>
              </button>

              <button
                onClick={() => flyToPreset('sungai-danau')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCameraPreset === 'sungai-danau'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Fokus Sungai & Danau</span>
              </button>

              <button
                onClick={() => flyToPreset('dataran-rendah')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCameraPreset === 'dataran-rendah'
                    ? 'bg-lime-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Fokus Dataran Rendah</span>
              </button>

              <button
                onClick={() => flyToPreset('pantai-laut')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCameraPreset === 'pantai-laut'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>Fokus Pantai & Laut</span>
              </button>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateTab('palu-gunung');
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Main Palu Gunung</span>
            </button>
          </div>

          {/* Row 2: Elevation Slider (0-1500 mdpl) + Weather & Forest Conservation Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5">
            {/* Elevation Slider Control */}
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <label htmlFor="elevation-slider" className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Indikator Ketinggian: <strong className="font-mono text-emerald-400 tabular-nums">{elevationMdpl} mdpl</strong></span>
                </label>
                <span className="text-slate-300 font-mono tabular-nums">
                  {elevationZoneLabel} · ~{estimatedTempC}°C
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="elevation-slider"
                  type="range"
                  min={0}
                  max={1500}
                  step={25}
                  value={elevationMdpl}
                  onChange={(e) => setElevationMdpl(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setShowElevationPlane((prev) => !prev);
                  }}
                  className={`px-2 py-1 text-xs font-medium rounded border cursor-pointer whitespace-nowrap shrink-0 ${
                    showElevationPlane
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {showElevationPlane ? 'Garis Aktif' : 'Garis Nonaktif'}
                </button>
              </div>
            </div>

            {/* Environment & Erosion Simulation Controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsNightMode((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isNightMode
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                    : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                }`}
              >
                {isNightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{isNightMode ? 'Mode Malam' : 'Mode Siang'}</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsRaining((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isRaining
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>{isRaining ? 'Hujan & Aliran Aktif' : 'Simulasi Hujan'}</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsForestDeforested((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isForestDeforested
                    ? 'bg-red-900/90 border-red-500 text-red-100'
                    : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                }`}
                title="Uji dampak penebangan hutan di lereng gunung terhadap kejernihan sungai"
              >
                {isForestDeforested ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
                    <span>Hutan Gundul (Rawan Longsor)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hutan Reboisasi (Lestari)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
