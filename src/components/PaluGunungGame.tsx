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

      // 1. Sky Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.55, '#1e293b');
      skyGrad.addColorStop(1, '#334155');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient Volcanic Glow behind crater
      const glowRadius = 95 + Math.sin(time * 2) * 12 + st.burstIntensity * 45;
      const craterGlow = ctx.createRadialGradient(360, 110, 10, 360, 110, glowRadius);
      craterGlow.addColorStop(0, 'rgba(249, 115, 22, 0.75)');
      craterGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.25)');
      craterGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = craterGlow;
      ctx.beginPath();
      ctx.arc(360, 110, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ambient continuous gentle crater smoke
      if (Math.random() < 0.22) {
        st.smokeParticles.push({
          x: 360 + (Math.random() - 0.5) * 26,
          y: 108,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(0.6 + Math.random() * 0.8),
          radius: 10 + Math.random() * 14,
          alpha: 0.45,
          maxAlpha: 0.45,
          isSpark: false,
          color: '#cbd5e1'
        });
      }

      // 2. Update & Draw Volcanic Smoke & Sparks Particle System
      for (let i = st.smokeParticles.length - 1; i >= 0; i--) {
        const p = st.smokeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (!p.isSpark) {
          p.radius += 0.22;
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

      // Distant Pegunungan Silhouette
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.lineTo(110, 210);
      ctx.lineTo(230, 310);
      ctx.lineTo(540, 180);
      ctx.lineTo(720, 420);
      ctx.closePath();
      ctx.fill();

      // 3. Main Volcanic Mountain Body
      const mtGrad = ctx.createLinearGradient(360, 100, 360, 420);
      mtGrad.addColorStop(0, '#44403c');
      mtGrad.addColorStop(0.45, '#3f6212');
      mtGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = mtGrad;
      ctx.beginPath();
      ctx.moveTo(65, 420);
      ctx.lineTo(315, 110);
      ctx.lineTo(405, 110);
      ctx.lineTo(645, 420);
      ctx.closePath();
      ctx.fill();

      // Crater Rim & Glowing Lava Mouth
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(360, 110, 45, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lava veins down upper cone
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(345, 118);
      ctx.quadraticCurveTo(335, 155, 350, 185);
      ctx.moveTo(375, 118);
      ctx.quadraticCurveTo(390, 150, 378, 175);
      ctx.stroke();

      // 4. Winding Climbing Trail & 10 Pos Nodes
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
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

      // Summit Flag at Pos 10
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
