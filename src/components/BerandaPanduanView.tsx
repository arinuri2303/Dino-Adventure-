import React, { useState } from 'react';
import {
  Compass,
  BookOpen,
  Hammer,
  UserCheck,
  Award,
  CheckSquare
} from 'lucide-react';
import { HERO_IMAGE_PRIMARY, HERO_IMAGE_FALLBACK } from '../data/mpiData';
import { soundFX } from '../utils/audio';

interface BerandaPanduanViewProps {
  studentName: string;
  studentClass: string;
  onUpdateIdentity: (name: string, kelas: string) => void;
  onNavigateTab: (tab: string) => void;
  subBabScore: number;
  paluGunungScore: number;
  asesmenTotalScore: number;
}

export const BerandaPanduanView: React.FC<BerandaPanduanViewProps> = ({
  studentName,
  studentClass,
  onUpdateIdentity,
  onNavigateTab,
  subBabScore,
  paluGunungScore,
  asesmenTotalScore
}) => {
  const [nameInput, setNameInput] = useState(studentName);
  const [classInput, setClassInput] = useState(studentClass);
  const [heroSrc, setHeroSrc] = useState<string>(HERO_IMAGE_PRIMARY);
  const [heroLoadFailed, setHeroLoadFailed] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleHeroError = () => {
    if (heroSrc === HERO_IMAGE_PRIMARY) {
      setHeroSrc(HERO_IMAGE_FALLBACK);
    } else {
      setHeroLoadFailed(true);
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playCorrect();
    const cleanName = nameInput.trim() || 'Penjelajah Nusantara';
    const cleanClass = classInput.trim() || 'Kelas 4 SD';
    onUpdateIdentity(cleanName, cleanClass);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 min-h-[calc(100vh-64px)] flex flex-col justify-center">
      {/* Single-Page Unified Landing Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Dino Adventure Landing Page Image + Quick Navigation Bar */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
            {!heroLoadFailed ? (
              <img
                src={heroSrc}
                alt="D-Bromo — Dino Bentang Alam Rute Pasuruan dari Pesisir hingga Bromo"
                referrerPolicy="no-referrer"
                onError={handleHeroError}
                className="w-full h-full object-cover block"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-sky-900 to-slate-900 flex items-center justify-center p-8">
                <svg viewBox="0 0 800 450" className="w-full h-full opacity-40" fill="none">
                  <path d="M0 350 L180 120 L340 350 Z" fill="#10B981" />
                  <path d="M150 350 L360 80 L560 350 Z" fill="#059669" />
                  <path d="M320 130 L360 80 L400 130 Z" fill="#F97316" />
                  <rect x="0" y="350" width="800" height="100" fill="#0EA5E9" />
                </svg>
              </div>
            )}
          </div>

          {/* Direct Action Bar under the D-Bromo Banner */}
          <div className="p-4 md:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateTab('materi');
                }}
                className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>Materi Belajar</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateTab('kuis');
                }}
                className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Kuis Sub-Bab</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateTab('virtual-lab');
                }}
                className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Compass className="w-4 h-4" />
                <span>Virtual Lab 3D</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateTab('palu-gunung');
                }}
                className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Hammer className="w-4 h-4" />
                <span>Game Palu Gunung</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateTab('asesmen');
                }}
                className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Award className="w-4 h-4" />
                <span>Asesmen & Skor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Student Identity Form & Progress Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-emerald-700">
              D-Bromo · Dino Bentang Alam Rute Pasuruan
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Data Siswa & Progres Belajar
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Isi nama lengkap dan kelasmu sebelum memulai petualangan D-Bromo dari Pesisir hingga Gunung Bromo agar seluruh skormu tercatat otomatis.
            </p>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label htmlFor="student-class" className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas / Rombel
                </label>
                <input
                  id="student-class"
                  type="text"
                  required
                  placeholder="Contoh: Kelas 4A - Nusantara"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none text-slate-900 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Simpan Identitas Siswa</span>
              </button>

              {savedNotice && (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Identitas berhasil disimpan untuk <strong>{studentName}</strong> ({studentClass}).
                </div>
              )}
            </form>
          </div>

          {/* Current Student Score Strip */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Rekap Nilai Sementara</span>
              <span className="font-mono tabular-nums">Skala 0–100</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Kuis Sub-Bab</div>
                <div className="text-base font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
                  {subBabScore}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Palu Gunung</div>
                <div className="text-base font-bold font-mono text-amber-600 tabular-nums mt-0.5">
                  {paluGunungScore}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Asesmen C1-C6</div>
                <div className="text-base font-bold font-mono text-sky-700 tabular-nums mt-0.5">
                  {asesmenTotalScore}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
