import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Star,
  Mountain,
  Waves,
  Users,
  Compass
} from 'lucide-react';
import { SUB_BAB_MATERI, SubBabMateri } from '../data/mpiData';
import { soundFX, speakIndonesian, stopSpeech } from '../utils/audio';

interface MateriViewProps {
  quizAnswers: Record<string, Record<number, number>>;
  onSelectQuizAnswer: (subBabId: string, questionId: number, optionIndex: number) => void;
  onNavigateTab: (tab: string) => void;
  focusQuizOnMount?: boolean;
}

export const MateriView: React.FC<MateriViewProps> = ({
  quizAnswers,
  onSelectQuizAnswer,
  onNavigateTab,
  focusQuizOnMount
}) => {
  const [activeSubBabId, setActiveSubBabId] = useState<string>(SUB_BAB_MATERI[0].id);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const quizSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusQuizOnMount && quizSectionRef.current) {
      setTimeout(() => {
        quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [focusQuizOnMount]);

  const activeSubBab = SUB_BAB_MATERI.find((s) => s.id === activeSubBabId) || SUB_BAB_MATERI[0];

  const handleToggleTts = (subBab: SubBabMateri) => {
    soundFX.playClick();
    if (speakingId === subBab.id) {
      stopSpeech();
      setSpeakingId(null);
    } else {
      setSpeakingId(subBab.id);
      speakIndonesian(subBab.fullTtsText, () => setSpeakingId(null));
    }
  };

  const getSubBabStats = (subBab: SubBabMateri) => {
    const answers = quizAnswers[subBab.id] || {};
    let answeredCount = 0;
    let correctCount = 0;
    subBab.quiz.forEach((q) => {
      if (answers[q.id] !== undefined) {
        answeredCount++;
        if (answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      }
    });
    return { answeredCount, correctCount, total: subBab.quiz.length };
  };

  const activeStats = getSubBabStats(activeSubBab);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Interactive Sub-Bab Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            Komponen 1 & 3 · Materi Lengkap & Kuis Cek Pemahaman Tiap Sub-Bab
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            Materi Bentang Alam Indonesia (IPAS SD Kelas 4)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pelajari ke-3 sub-bab di bawah ini, dengarkan fitur pembaca suara (Text-to-Speech), dan kumpulkan 3 Lencana Bintang!
          </p>
        </div>

        {/* Interactive Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          {SUB_BAB_MATERI.map((sb) => {
            const st = getSubBabStats(sb);
            const isComplete = st.answeredCount === st.total;
            const isActive = sb.id === activeSubBabId;
            const Icon = sb.id === 'daratan' ? Mountain : sb.id === 'perairan' ? Waves : Users;

            return (
              <button
                key={sb.id}
                onClick={() => {
                  soundFX.playClick();
                  stopSpeech();
                  setSpeakingId(null);
                  setActiveSubBabId(sb.id);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{sb.number}: {sb.id === 'daratan' ? 'Daratan' : sb.id === 'perairan' ? 'Perairan' : 'Adaptasi'}</span>
                <span className="font-mono text-amber-600 tabular-nums">
                  {isComplete ? `★ ${st.correctCount}/${st.total}` : `${st.answeredCount}/${st.total}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card for Active Sub-Bab */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs font-medium text-slate-500">
              {activeSubBab.number} · {activeSubBab.summaryBadge}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
              {activeSubBab.title} — {activeSubBab.subtitle}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleToggleTts(activeSubBab)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                speakingId === activeSubBab.id
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {speakingId === activeSubBab.id ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Hentikan Suara Narasi</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Dengarkan Materi (id-ID)</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateTab('virtual-lab');
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Lihat di Lab 3D</span>
            </button>
          </div>
        </div>

        {/* Introductory Paragraphs */}
        <div className="space-y-3">
          {activeSubBab.paragraphs.map((p, idx) => (
            <p key={idx} className="text-base text-slate-700 leading-relaxed max-w-4xl">
              {p}
            </p>
          ))}
        </div>

        {/* Detailed Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {activeSubBab.items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="text-xs font-mono font-medium text-emerald-700">
                  {item.altitudeOrType}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Contoh di Indonesia:
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  {item.examples.join(' · ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KOMPONEN 3: KUIS CEK PEMAHAMAN SUB-BAB */}
      <div
        ref={quizSectionRef}
        id="kuis-subbab"
        className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-amber-700">
              Uji Pemahaman Instan · {activeSubBab.number}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              Kuis Cek Pemahaman: {activeSubBab.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Star
              className={`w-5 h-5 ${
                activeStats.correctCount === activeStats.total
                  ? 'text-amber-500 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
            <span className="font-mono tabular-nums">
              Skor Sub-Bab: {activeStats.correctCount} / {activeStats.total} Benar
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {activeSubBab.quiz.map((q, qIdx) => {
            const selectedOption = quizAnswers[activeSubBab.id]?.[q.id];
            const isAnswered = selectedOption !== undefined;
            const isCorrect = selectedOption === q.correctIndex;

            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 p-5 space-y-4 bg-slate-50/40"
              >
                <div className="text-sm md:text-base font-semibold text-slate-900">
                  {qIdx + 1}. {q.question}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isThisSelected = selectedOption === optIdx;
                    const isThisCorrect = q.correctIndex === optIdx;

                    let btnClass =
                      'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                    if (isAnswered) {
                      if (isThisCorrect) {
                        btnClass = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold';
                      } else if (isThisSelected && !isThisCorrect) {
                        btnClass = 'border-red-500 bg-red-50 text-red-900';
                      } else {
                        btnClass = 'border-slate-200 bg-white/60 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          if (optIdx === q.correctIndex) {
                            soundFX.playCorrect();
                          } else {
                            soundFX.playWrong();
                          }
                          onSelectQuizAnswer(activeSubBab.id, q.id, optIdx);
                        }}
                        className={`px-4 py-3 text-left text-sm rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${btnClass}`}
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

                {isAnswered && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <strong className="font-semibold">
                      {isCorrect ? 'Jawaban Tepat! ' : 'Belum Tepat — Pembahasan: '}
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
