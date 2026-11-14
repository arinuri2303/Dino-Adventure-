import React, { useEffect, useRef, useState } from 'react';
import {
  Hammer,
  Flag,
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { PALU_GUNUNG_QUESTIONS } from '../data/mpiData';
import { soundFX } from '../utils/audio';

interface PaluGunungGameProps {
  score: number;
  onUpdateScore: (newScore: number) => void;
  onNavigateTab: (tab: string) => void;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  isSpark: boolean;
  color: string;
}

export const TREX_ASSET_SHEET_PATH =
  '/assets/aistudio/T._Rex_Explorer_Character_Asset_Sheet_23089300.png';

// Normalized crop regions [x, y, w, h] (0..1) from T._Rex_Explorer_Character_Asset_Sheet_23089300.png
const SPRITE_REGIONS = {
  // Large T-Rex Explorer Pawn on the mountain pedestal (left side of sheet)
  pawn: { x: 0.015, y: 0.01, w: 0.388, h: 0.965 },
  // Smiling / Laughing T-Rex icon (middle row, 1st bust)
  smileLaugh: { x: 0.382, y: 0.432, w: 0.165, h: 0.262 },
  // Smiling Thumbs-Up T-Rex icon (middle row, 4th bust)
  smileThumbsUp: { x: 0.845, y: 0.432, w: 0.152, h: 0.262 },
  // Angry T-Rex icon with clenched fists (middle row, 3rd bust)
  angry: { x: 0.696, y: 0.432, w: 0.15, h: 0.262 },
  // Jumping celebratory T-Rex (top row, rightmost)
  jumping: { x: 0.8, y: 0.015, w: 0.19, h: 0.39 }
};

/**
 * Crops a normalized region from the loaded image and removes the pure white studio background
 * via flood/threshold alpha feathering so the character sprite renders cleanly over any background.
 */
function extractTransparentSprite(
  img: HTMLImageElement,
  region: { x: number; y: number; w: number; h: number }
): HTMLCanvasElement {
  const sx = Math.floor(img.naturalWidth * region.x);
  const sy = Math.floor(img.naturalHeight * region.y);
  const sw = Math.floor(img.naturalWidth * region.w);
  const sh = Math.floor(img.naturalHeight * region.h);

  const offCanvas = document.createElement('canvas');
  offCanvas.width = sw;
  offCanvas.height = sh;
  const ctx = offCanvas.getContext('2d');
  if (!ctx) return offCanvas;

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  try {
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;
    const width = sw;
    const height = sh;

    // Flood-fill from outer border pixels to remove only exterior white/light-gray backdrop
    // while preserving the white eyes, teeth, and compass dial inside the T-Rex!
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    const isBackdropPixel = (idx4: number) => {
      const r = data[idx4];
      const g = data[idx4 + 1];
      const b = data[idx4 + 2];
      // Near-white or very light neutral shadow on sheet exterior
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const saturation = maxC - minC;
      return r > 236 && g > 236 && b > 236 && saturation < 18;
    };

    // Seed border pixels
    for (let x = 0; x < width; x++) {
      const topIdx = x;
      const botIdx = (height - 1) * width + x;
      if (isBackdropPixel(topIdx * 4)) {
        visited[topIdx] = 1;
        queue.push(topIdx);
      }
      if (isBackdropPixel(botIdx * 4)) {
        visited[botIdx] = 1;
        queue.push(botIdx);
      }
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = y * width;
      const rightIdx = y * width + (width - 1);
      if (!visited[leftIdx] && isBackdropPixel(leftIdx * 4)) {
        visited[leftIdx] = 1;
        queue.push(leftIdx);
      }
      if (!visited[rightIdx] && isBackdropPixel(rightIdx * 4)) {
        visited[rightIdx] = 1;
        queue.push(rightIdx);
      }
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % width;
      const cy = (curr - cx) / width;

      // Make exterior white pixel transparent
      data[curr * 4 + 3] = 0;

      const neighbors = [
        cy > 0 ? curr - width : -1,
        cy < height - 1 ? curr + width : -1,
        cx > 0 ? curr - 1 : -1,
        cx < width - 1 ? curr + 1 : -1
      ];

      for (let n = 0; n < 4; n++) {
        const nb = neighbors[n];
        if (nb >= 0 && !visited[nb]) {
          if (isBackdropPixel(nb * 4)) {
            visited[nb] = 1;
            queue.push(nb);
          } else {
            // Soften anti-aliased edge pixel adjacent to background
            const nr = data[nb * 4];
            const ng = data[nb * 4 + 1];
            const nbBlue = data[nb * 4 + 2];
            if (nr > 220 && ng > 220 && nbBlue > 220) {
              data[nb * 4 + 3] = 110;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Fallback if canvas tainting ever occurs
  }

  return offCanvas;
}

// 10 Climbing Posts coordinates along the mountain trail
const POST_COORDS = [
  { x: 155, y: 382 }, // Pos 1
  { x: 235, y: 356 }, // Pos 2
  { x: 315, y: 330 }, // Pos 3
  { x: 240, y: 296 }, // Pos 4
  { x: 330, y: 268 }, // Pos 5
  { x: 415, y: 238 }, // Pos 6
  { x: 315, y: 206 }, // Pos 7
  { x: 385, y: 176 }, // Pos 8
  { x: 332, y: 145 }, // Pos 9
  { x: 360, y: 112 }  // Pos 10 (Puncak)
];

export const PaluGunungGame: React.FC<PaluGunungGameProps> = ({
  score,
  onUpdateScore,
  onNavigateTab
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentPosIndex, setCurrentPosIndex] = useState<number>(0);
  const [energyPoints, setEnergyPoints] = useState<number>(score);
  const [mountainStruck, setMountainStruck] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredPositions, setAnsweredPositions] = useState<Record<number, boolean>>({});
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Extracted data URLs for React UI cards (Pawn, Smile, Angry, ThumbsUp)
  const [spriteUrls, setSpriteUrls] = useState<{
    pawn: string;
    smile: string;
    smileThumbs: string;
    angry: string;
  } | null>(null);

  // Animation state ref for the 60fps canvas loop
  const animRef = useRef({
    pointerX: 480,
    pointerY: 220,
    hammerAngle: 0,
    hammerSwingTimer: 0,
    climberTargetIdx: 0,
    climberVisualIdx: 0, // Smoothly interpolates toward climberTargetIdx
    mood: 'neutral' as 'neutral' | 'happy' | 'angry',
    smokeParticles: [] as SmokeParticle[],
    burstIntensity: 0,
    sprites: {
      pawn: null as HTMLCanvasElement | null,
      smile: null as HTMLCanvasElement | null,
      smileThumbs: null as HTMLCanvasElement | null,
      angry: null as HTMLCanvasElement | null
    }
  });

  // Load T. Rex Explorer Character Asset Sheet once & extract transparent sprites
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = TREX_ASSET_SHEET_PATH;
    img.onload = () => {
      const pawnCanvas = extractTransparentSprite(img, SPRITE_REGIONS.pawn);
      const smileCanvas = extractTransparentSprite(img, SPRITE_REGIONS.smileLaugh);
      const smileThumbsCanvas = extractTransparentSprite(img, SPRITE_REGIONS.smileThumbsUp);
      const angryCanvas = extractTransparentSprite(img, SPRITE_REGIONS.angry);

      animRef.current.sprites = {
        pawn: pawnCanvas,
        smile: smileCanvas,
        smileThumbs: smileThumbsCanvas,
        angry: angryCanvas
      };

      setSpriteUrls({
        pawn: pawnCanvas.toDataURL('image/png'),
        smile: smileCanvas.toDataURL('image/png'),
        smileThumbs: smileThumbsCanvas.toDataURL('image/png'),
        angry: angryCanvas.toDataURL('image/png')
      });
    };
  }, []);

  const autoAdvanceTimerRef = useRef<number | null>(null);

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, []);

  const advanceToPos = (nextIdx: number) => {
    clearAutoAdvanceTimer();
    animRef.current.mood = 'neutral';
    if (nextIdx >= PALU_GUNUNG_QUESTIONS.length) {
      soundFX.playVictory();
      setGameFinished(true);
      animRef.current.climberTargetIdx = 9;
      animRef.current.mood = 'happy';
    } else {
      setCurrentPosIndex(nextIdx);
      animRef.current.climberTargetIdx = nextIdx;
      setSelectedAnswer(null);
      setMountainStruck(false);
    }
  };

  const triggerHammerStrike = () => {
    if (gameFinished) return;
    soundFX.playHammerBoom();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 380);

    animRef.current.hammerSwingTimer = 1.0;
    animRef.current.burstIntensity = 1.0;

    // Spawn thick billowing volcanic smoke and orange sparks from the crater
    const craterX = 360;
    const craterY = 108;
    for (let i = 0; i < 42; i++) {
      const isSpark = i % 4 === 0;
      animRef.current.smokeParticles.push({
        x: craterX + (Math.random() - 0.5) * 44,
        y: craterY + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * (isSpark ? 3.8 : 2.1),
        vy: -(1.4 + Math.random() * (isSpark ? 3.5 : 2.4)),
        radius: isSpark ? 3 + Math.random() * 4 : 18 + Math.random() * 26,
        alpha: 0.9,
        maxAlpha: 0.9,
        isSpark,
        color: isSpark
          ? Math.random() > 0.5
            ? '#f97316'
            : '#facc15'
          : Math.random() > 0.4
          ? '#e2e8f0'
          : '#cbd5e1'
      });
    }

    setMountainStruck(true);
  };

  const handleSelectOption = (optIdx: number) => {
    if (selectedAnswer !== null) return;
    const currentQ = PALU_GUNUNG_QUESTIONS[currentPosIndex];
    setSelectedAnswer(optIdx);

    const isCorrect = optIdx === currentQ.correctIndex;
    if (isCorrect) {
      soundFX.playCorrect();
      animRef.current.mood = 'happy';
      const updatedMap = { ...answeredPositions, [currentPosIndex]: true };
      setAnsweredPositions(updatedMap);
      const newPoints = Object.values(updatedMap).filter(Boolean).length * 10;
      setEnergyPoints(newPoints);
      onUpdateScore(newPoints);
    } else {
      soundFX.playWrong();
      animRef.current.mood = 'angry';
      const updatedMap = { ...answeredPositions, [currentPosIndex]: false };
      setAnsweredPositions(updatedMap);
    }

    // Langsung gerakkan pion T-Rex secara otomatis menuju pos berikutnya di kanvas gunung!
    const nextPosIdx = currentPosIndex + 1;
    animRef.current.climberTargetIdx = Math.min(POST_COORDS.length - 1, nextPosIdx);

    // Otomatis lanjut ke pos berikutnya setelah 2,2 detik (siswa sempat melihat ikon T-Rex tersenyum/marah & pembahasan)
    clearAutoAdvanceTimer();
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      advanceToPos(nextPosIdx);
    }, 2200);
  };

  const handleNextPos = () => {
    soundFX.playClick();
    advanceToPos(currentPosIndex + 1);
  };

  const handleRestartGame = () => {
    clearAutoAdvanceTimer();
    soundFX.playClick();
    setCurrentPosIndex(0);
    setEnergyPoints(0);
    onUpdateScore(0);
    setMountainStruck(false);
    setSelectedAnswer(null);
    setAnsweredPositions({});
    setGameFinished(false);
    animRef.current.climberTargetIdx = 0;
    animRef.current.climberVisualIdx = 0;
    animRef.current.mood = 'neutral';
  };

  // Interactive Volcanic Mountain, T-Rex Pawn & Hammer Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let time = 0;

    const render = () => {
      time += 0.035;
      const st = animRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Golden Sunrise Sky over Kaldera Tengger (Penanjakan Bromo Sunrise)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0c4a6e');
      skyGrad.addColorStop(0.32, '#0284c7');
      skyGrad.addColorStop(0.62, '#fb923c');
      skyGrad.addColorStop(0.82, '#fde68a');
      skyGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Morning Sunrise Sun Disk behind Gunung Semeru & Bromo
      const sunGrad = ctx.createRadialGradient(540, 145, 8, 540, 145, 95);
      sunGrad.addColorStop(0, 'rgba(254, 249, 195, 0.95)');
      sunGrad.addColorStop(0.35, 'rgba(251, 146, 60, 0.45)');
      sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(540, 145, 95, 0, Math.PI * 2);
      ctx.fill();

      // 2. Distant Gunung Semeru (Mahameru 3.676 mdpl) on Right Horizon
      const semeruGrad = ctx.createLinearGradient(595, 68, 595, 290);
      semeruGrad.addColorStop(0, '#475569');
      semeruGrad.addColorStop(0.55, '#64748b');
      semeruGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = semeruGrad;
      ctx.beginPath();
      ctx.moveTo(455, 290);
      ctx.lineTo(582, 72);
      ctx.lineTo(608, 72);
      ctx.lineTo(715, 290);
      ctx.closePath();
      ctx.fill();

      // Subtle Semeru distant steam puff
      ctx.fillStyle = 'rgba(248, 250, 252, 0.45)';
      ctx.beginPath();
      ctx.arc(595, 56 + Math.sin(time * 1.5) * 3, 14, 0, Math.PI * 2);
      ctx.arc(606, 46 + Math.cos(time * 1.2) * 3, 18, 0, Math.PI * 2);
      ctx.fill();

      // Distant Kaldera Tengger Wall & Pegunungan Widodaren
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.moveTo(0, 320);
      ctx.lineTo(0, 215);
      ctx.lineTo(85, 200);
      ctx.lineTo(220, 250);
      ctx.lineTo(510, 235);
      ctx.lineTo(665, 205);
      ctx.lineTo(720, 220);
      ctx.lineTo(720, 320);
      ctx.closePath();
      ctx.fill();

      // Ambient Volcanic Glow behind Kawah Gunung Bromo
      const glowRadius = 105 + Math.sin(time * 2) * 12 + st.burstIntensity * 50;
      const craterGlow = ctx.createRadialGradient(360, 112, 12, 360, 112, glowRadius);
      craterGlow.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
      craterGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.3)');
      craterGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = craterGlow;
      ctx.beginPath();
      ctx.arc(360, 112, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ambient continuous white-grey sulfur smoke from Kawah Bromo
      if (Math.random() < 0.28) {
        st.smokeParticles.push({
          x: 360 + (Math.random() - 0.5) * 38,
          y: 108,
          vx: (Math.random() - 0.35) * 0.7,
          vy: -(0.75 + Math.random() * 0.9),
          radius: 12 + Math.random() * 16,
          alpha: 0.55,
          maxAlpha: 0.55,
          isSpark: false,
          color: '#f1f5f9'
        });
      }

      // 3. Update & Draw Kawah Bromo Smoke & Sparks Particle System
      for (let i = st.smokeParticles.length - 1; i >= 0; i--) {
        const p = st.smokeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (!p.isSpark) {
          p.radius += 0.24;
          p.alpha -= 0.008;
        } else {
          p.vy += 0.05;
          p.alpha -= 0.02;
        }

        if (p.alpha <= 0.01) {
          st.smokeParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Gunung Batok (Iconic Green-Brown Grooved Cone next to Bromo on the Left)
      const batokGrad = ctx.createLinearGradient(135, 165, 135, 345);
      batokGrad.addColorStop(0, '#4d7c0f');
      batokGrad.addColorStop(0.5, '#3f6212');
      batokGrad.addColorStop(1, '#365314');
      ctx.fillStyle = batokGrad;
      ctx.beginPath();
      ctx.moveTo(-15, 345);
      ctx.lineTo(102, 172);
      ctx.lineTo(162, 172);
      ctx.lineTo(275, 345);
      ctx.closePath();
      ctx.fill();

      // Gunung Batok characteristic radial erosion ribs
      ctx.strokeStyle = 'rgba(20, 83, 45, 0.55)';
      ctx.lineWidth = 2.5;
      for (let r = -3; r <= 3; r++) {
        ctx.beginPath();
        ctx.moveTo(132 + r * 7, 174);
        ctx.lineTo(132 + r * 32, 342);
        ctx.stroke();
      }

      // 5. Main Interactive Kawah Gunung Bromo (2.329 mdpl) with Eroded Ash Gullies
      const bromoGrad = ctx.createLinearGradient(360, 105, 360, 390);
      bromoGrad.addColorStop(0, '#78716c');
      bromoGrad.addColorStop(0.35, '#a8a29e');
      bromoGrad.addColorStop(0.7, '#78350f');
      bromoGrad.addColorStop(1, '#44403c');
      ctx.fillStyle = bromoGrad;
      ctx.beginPath();
      ctx.moveTo(85, 390);
      ctx.lineTo(288, 112);
      ctx.lineTo(432, 112);
      ctx.lineTo(635, 390);
      ctx.closePath();
      ctx.fill();

      // Iconic radial volcanic ash gullies (Alur Erosi Kawah Bromo)
      ctx.strokeStyle = 'rgba(68, 64, 60, 0.65)';
      ctx.lineWidth = 3;
      const gullyOffsets = [-55, -35, -18, 0, 18, 35, 55];
      gullyOffsets.forEach((go) => {
        ctx.beginPath();
        ctx.moveTo(360 + go, 120);
        ctx.quadraticCurveTo(360 + go * 1.9, 240, 360 + go * 3.6, 382);
        ctx.stroke();
      });

      // Wide Kawah Bromo Caldera Rim & Glowing Sulfur-Lava Crater Mouth
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.ellipse(360, 112, 72, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(360, 112, 54, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(360, 112, 28, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iconic Tangga Kawah Bromo (Staircase on the upper slope from Pos 7 to Pos 10)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(315, 206);
      ctx.lineTo(385, 176);
      ctx.lineTo(332, 145);
      ctx.lineTo(360, 115);
      ctx.stroke();

      // 6. Lautan Pasir Berbisik (Tengger Sea of Sand) & Morning Mist at Base
      const sandGrad = ctx.createLinearGradient(0, 338, 0, 420);
      sandGrad.addColorStop(0, '#57534e');
      sandGrad.addColorStop(0.4, '#44403c');
      sandGrad.addColorStop(1, '#292524');
      ctx.fillStyle = sandGrad;
      ctx.fillRect(0, 342, canvas.width, 78);

      // Golden Morning Mist drifting across Lautan Pasir
      const mistGrad = ctx.createLinearGradient(0, 322, 0, 368);
      mistGrad.addColorStop(0, 'rgba(254, 243, 199, 0)');
      mistGrad.addColorStop(0.5, 'rgba(254, 243, 199, 0.38)');
      mistGrad.addColorStop(1, 'rgba(254, 243, 199, 0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, 322, canvas.width, 46);

      // Pura Luhur Poten Silhouette in Lautan Pasir (Right foreground)
      ctx.save();
      ctx.translate(565, 348);
      ctx.fillStyle = '#292524';
      // Candi Bentar split gate
      ctx.beginPath();
      ctx.moveTo(-28, 12);
      ctx.lineTo(-28, -16);
      ctx.lineTo(-14, -6);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14, 12);
      ctx.lineTo(14, -6);
      ctx.lineTo(28, -16);
      ctx.lineTo(28, 12);
      ctx.closePath();
      ctx.fill();
      // Main Padmasana / Meru roof
      ctx.fillRect(-8, -8, 16, 20);
      ctx.beginPath();
      ctx.moveTo(-13, -8);
      ctx.lineTo(0, -20);
      ctx.lineTo(13, -8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Iconic Red Jeep Hardtop Bromo parked near Pos 1 in Lautan Pasir
      ctx.save();
      ctx.translate(78, 382);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-22, -12, 44, 12);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-14, -22, 26, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-11, -20, 10, 7);
      ctx.fillRect(2, -20, 8, 7);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-13, 2, 6, 0, Math.PI * 2);
      ctx.arc(13, 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Landmark Labels on the Bromo Panorama
      const drawLandmarkTag = (lx: number, ly: number, text: string) => {
        ctx.save();
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        const tw = ctx.measureText(text).width + 14;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(lx - tw / 2, ly - 10, tw, 19, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText(text, lx, ly + 3);
        ctx.restore();
      };

      drawLandmarkTag(132, 154, 'Gunung Batok');
      drawLandmarkTag(595, 88, 'Gunung Semeru');
      drawLandmarkTag(565, 376, 'Pura Luhur Poten · Lautan Pasir');

      // 7. Winding Bromo Climbing Trail & 10 Pos Nodes
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      POST_COORDS.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      POST_COORDS.forEach((pt, idx) => {
        const isCurrent = idx === Math.round(st.climberTargetIdx);
        const isPassed = idx < st.climberTargetIdx;
        ctx.fillStyle = isPassed ? '#10b981' : isCurrent ? '#f59e0b' : '#475569';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isCurrent ? 12 : 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(idx + 1), pt.x, pt.y + 3.5);
      });

      // Summit Flag at Bibir Kawah Gunung Bromo (Pos 10)
      ctx.save();
      ctx.translate(360, 68);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, 28, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 10, 28, 10);
      ctx.restore();

      // 5. Smoothly Interpolated T-Rex Explorer Pawn on the Mountain Trail
      st.climberVisualIdx += (st.climberTargetIdx - st.climberVisualIdx) * 0.1;
      const lowerIdx = Math.max(0, Math.min(9, Math.floor(st.climberVisualIdx)));
      const upperIdx = Math.max(0, Math.min(9, Math.ceil(st.climberVisualIdx)));
      const frac = st.climberVisualIdx - lowerIdx;

      const pA = POST_COORDS[lowerIdx];
      const pB = POST_COORDS[upperIdx];
      const pawnX = pA.x + (pB.x - pA.x) * frac;
      // Add an excited hop arc while moving between posts or gentle breathing bob when idle
      const hopArc = Math.sin(frac * Math.PI) * 18;
      const idleBob = Math.abs(Math.sin(time * 2.2)) * 3.5;
      const pawnY = pA.y + (pB.y - pA.y) * frac - hopArc - idleBob;

      if (st.sprites.pawn) {
        const pawnW = 68;
        const pawnH = 82;
        ctx.save();
        // Soft shadow under pawn base
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.beginPath();
        ctx.ellipse(pawnX, pA.y + (pB.y - pA.y) * frac + 2, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw T-Rex Explorer Pawn centered with pedestal resting on the post coordinate
        ctx.drawImage(
          st.sprites.pawn,
          pawnX - pawnW / 2,
          pawnY - pawnH + 10,
          pawnW,
          pawnH
        );

        // Draw Floating Reaction Badge above the T-Rex Pawn when answered (Smile or Angry!)
        if (st.mood === 'happy' && st.sprites.smile) {
          ctx.fillStyle = '#ecfdf5';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(pawnX + 34, pawnY - pawnH + 16, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.drawImage(st.sprites.smile, pawnX + 14, pawnY - pawnH - 4, 40, 40);
        } else if (st.mood === 'angry' && st.sprites.angry) {
          ctx.fillStyle = '#fef2f2';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(pawnX + 34, pawnY - pawnH + 16, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.drawImage(st.sprites.angry, pawnX + 14, pawnY - pawnH - 4, 40, 40);
        }
        ctx.restore();
      }

      // 6. Interactive Giant Mountain Hammer (Palu Gunung) following pointer
      if (st.hammerSwingTimer > 0) {
        st.hammerSwingTimer = Math.max(0, st.hammerSwingTimer - 0.08);
        st.hammerAngle = -Math.sin(st.hammerSwingTimer * Math.PI) * 1.15;
      } else {
        st.hammerAngle = Math.sin(time * 2.5) * 0.08;
      }
      st.burstIntensity = Math.max(0, st.burstIntensity - 0.04);

      ctx.save();
      ctx.translate(st.pointerX, st.pointerY);
      ctx.rotate(st.hammerAngle);

      // Wooden Hammer Handle
      ctx.fillStyle = '#92400e';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.fillRect(-6, -10, 12, 68);
      ctx.strokeRect(-6, -10, 12, 68);

      // Heavy Forged Iron Hammer Head
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#334155';
      ctx.fillRect(-34, -32, 68, 28);
      ctx.strokeRect(-34, -32, 68, 28);

      // Golden Energy Band on Hammer
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-10, -32, 20, 28);

      ctx.restore();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const currentQuestion = PALU_GUNUNG_QUESTIONS[currentPosIndex];
  const isCurrentCorrect =
    selectedAnswer !== null && selectedAnswer === currentQuestion.correctIndex;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Progress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          {spriteUrls?.pawn && (
            <div className="w-14 h-16 rounded-2xl bg-amber-50 border border-amber-200 p-1 flex items-center justify-center shrink-0">
              <img
                src={spriteUrls.pawn}
                alt="Pion T-Rex Penjelajah Gunung"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-amber-700">
              Komponen 4 · Mini-Game Interaktif 10 Pos Pendakian bersama Pion T-Rex
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5">
              Petualangan Palu Gunung — Bantu Pion T-Rex Mencapai Puncak!
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Pukul gunung dengan palu untuk membuka soal tantangan. Jawaban benar membuat T-Rex tersenyum & naik 1 pos menuju puncak!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold">Energi T-Rex:</span>
            <span className="text-base font-bold font-mono tabular-nums">{energyPoints} / 100</span>
          </div>

          <button
            onClick={handleRestartGame}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Pendakian</span>
          </button>
        </div>
      </div>

      {/* Main 2-Zone Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 7 Cols: Interactive Volcanic Mountain Canvas with T-Rex Pawn */}
        <div
          className={`lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          <div className="relative w-full">
            <canvas
              ref={canvasRef}
              width={720}
              height={420}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                animRef.current.pointerX = ((e.clientX - rect.left) / rect.width) * 720;
                animRef.current.pointerY = ((e.clientY - rect.top) / rect.height) * 420;
              }}
              onClick={triggerHammerStrike}
              className="w-full h-auto block cursor-pointer"
            />

            {/* Top Overlay Status inside Canvas */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-700 text-xs font-semibold text-white">
                {gameFinished
                  ? 'Puncak Berhasil Ditaklukkan oleh Pion T-Rex!'
                  : `${currentQuestion.posName} (${currentQuestion.elevationLabel})`}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-700 text-xs font-mono text-amber-300 tabular-nums">
                Pos {Math.min(10, currentPosIndex + 1)} dari 10
              </div>
            </div>
          </div>

          {/* Action Bar & T-Rex Reaction Legend below Canvas */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              {spriteUrls && (
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <img
                      src={spriteUrls.smile}
                      alt="T-Rex Tersenyum"
                      className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500 object-contain"
                    />
                    <span>Benar: T-Rex Tersenyum</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <img
                      src={spriteUrls.angry}
                      alt="T-Rex Marah"
                      className="w-7 h-7 rounded-full bg-red-950 border border-red-500 object-contain"
                    />
                    <span>Salah: T-Rex Marah</span>
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={triggerHammerStrike}
              disabled={gameFinished}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Hammer className="w-4 h-4" />
              <span>Pukul Gunung dengan Palu!</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Smoke Challenge Question Card & T-Rex Expression Feedback */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 md:p-7 flex flex-col justify-between shadow-sm">
          {gameFinished ? (
            <div className="my-auto text-center space-y-5 py-4">
              {spriteUrls?.smileThumbs ? (
                <div className="w-28 h-28 rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-2 flex items-center justify-center mx-auto shadow-sm">
                  <img
                    src={spriteUrls.smileThumbs}
                    alt="T-Rex Tersenyum Menang di Puncak"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Trophy className="w-9 h-9" />
                </div>
              )}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-700">
                  Pion T-Rex Tiba di Puncak Kawah Kejayaan!
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Selamat! Kamu & Pion T-Rex Menaklukkan 10 Pos Gunung
                </h2>
                <p className="text-sm text-slate-600">
                  Total Skor Energi Pendakianmu:{' '}
                  <strong className="font-mono text-amber-600">{energyPoints} / 100 Poin</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartGame}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                >
                  Main Lagi
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateTab('asesmen');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer"
                >
                  <span>Lanjut ke Asesmen Evaluasi C1–C6</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !mountainStruck ? (
            <div className="my-auto text-center space-y-4 py-6">
              {spriteUrls?.pawn ? (
                <div className="w-28 h-32 mx-auto flex items-center justify-center">
                  <img
                    src={spriteUrls.pawn}
                    alt="Pion T-Rex Siap Mendaki"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                  <Hammer className="w-7 h-7" />
                </div>
              )}
              <div className="text-xs font-mono font-semibold text-slate-500">
                {currentQuestion.posName} · {currentQuestion.elevationLabel}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Pion T-Rex Siap di Pos {currentPosIndex + 1}!
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Pukul badan gunung menggunakan <strong>Palu Gunung</strong> agar kawah menyemburkan kepulan asap berisi soal tantangan untuk memajukan Pion T-Rex!
              </p>
              <button
                onClick={triggerHammerStrike}
                className="mt-2 px-6 py-3 text-sm font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Hammer className="w-4 h-4" />
                <span>Ayunkan Palu Gunung Sekarang!</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-orange-700">
                    Tantangan Kawah · Soal {currentPosIndex + 1}/10
                  </span>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    +10 Energi T-Rex
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-2.5 pt-1">
                  {currentQuestion.options.map((opt, idx) => {
                    const isAnswered = selectedAnswer !== null;
                    const isThisSelected = selectedAnswer === idx;
                    const isThisCorrect = currentQuestion.correctIndex === idx;

                    let optStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';
                    if (isAnswered) {
                      if (isThisCorrect) {
                        optStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold';
                      } else if (isThisSelected) {
                        optStyle = 'border-red-500 bg-red-50 text-red-900';
                      } else {
                        optStyle = 'border-slate-200 bg-white text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        className={`w-full px-4 py-2.5 text-left text-sm rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isThisCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isThisSelected && !isThisCorrect && (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedAnswer !== null && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed border flex items-center gap-3.5 ${
                      isCurrentCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-red-50 border-red-300 text-red-950'
                    }`}
                  >
                    {/* T-Rex Smiling Icon on Correct vs T-Rex Angry Icon on Wrong */}
                    {spriteUrls && (
                      <div
                        className={`w-16 h-16 rounded-xl border p-1 shrink-0 flex items-center justify-center bg-white ${
                          isCurrentCorrect ? 'border-emerald-300' : 'border-red-300'
                        }`}
                      >
                        <img
                          src={isCurrentCorrect ? spriteUrls.smile : spriteUrls.angry}
                          alt={isCurrentCorrect ? 'Icon T-Rex Tersenyum' : 'Icon T-Rex Marah'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <strong className="block text-sm font-bold mb-0.5">
                        {isCurrentCorrect
                          ? 'Jawaban Benar! T-Rex Tersenyum Gembira (+10 Energi)'
                          : 'Jawaban Kurang Tepat! T-Rex Marah & Geram'}
                      </strong>
                      <span>{currentQuestion.explanation}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNextPos}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>
                      {currentPosIndex + 1 >= PALU_GUNUNG_QUESTIONS.length
                        ? 'Pion T-Rex Melaju Otomatis ke Puncak Gunung...'
                        : `Pion Bergerak Otomatis ke Pos ${currentPosIndex + 2} (Klik untuk Lanjut Cepat)`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
