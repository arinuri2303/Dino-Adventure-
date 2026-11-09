import React, { useState, useMemo } from 'react';
import { VirtualLab3D } from './components/VirtualLab3D';
import { BerandaPanduanView } from './components/BerandaPanduanView';
import { MateriView } from './components/MateriView';
import { PaluGunungGame } from './components/PaluGunungGame';
import { AsesmenView } from './components/AsesmenView';
import { SUB_BAB_MATERI } from './data/mpiData';
import { soundFX, stopSpeech } from './utils/audio';

export default function App() {
  // Default to 'beranda' so Beranda & Panduan appears first when opening the link
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [focusQuizOnMateri, setFocusQuizOnMateri] = useState<boolean>(false);

  // Student Identity State
  const [studentName, setStudentName] = useState<string>('Alya Putri');
  const [studentClass, setStudentClass] = useState<string>('Kelas 4A');

  // Sub-Bab Quiz Answers: { [subBabId]: { [questionId]: selectedOptionIndex } }
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});

  // Game Palu Gunung Score (0 - 100)
  const [paluGunungScore, setPaluGunungScore] = useState<number>(0);

  // Asesmen Evaluasi Scores (0 - 100)
  const [asesmenScores, setAsesmenScores] = useState({
    lots: 0,
    hots: 0,
    total: 0
  });

  // Compute overall Sub-Bab Quiz Score (9 questions across 3 sub-babs -> 0-100 scale)
  const subBabScore = useMemo(() => {
    let totalQuestions = 0;
    let totalCorrect = 0;
    SUB_BAB_MATERI.forEach((sb) => {
      const sbAns = quizAnswers[sb.id] || {};
      sb.quiz.forEach((q) => {
        totalQuestions++;
        if (sbAns[q.id] === q.correctIndex) {
          totalCorrect++;
        }
      });
    });
    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  }, [quizAnswers]);

  const handleSelectQuizAnswer = (subBabId: string, questionId: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [subBabId]: {
        ...(prev[subBabId] || {}),
        [questionId]: optionIndex
      }
    }));
  };

  const handleNavigateTab = (tab: string) => {
    stopSpeech();
    if (tab === 'kuis') {
      setFocusQuizOnMateri(true);
      setActiveTab('materi');
    } else {
      setFocusQuizOnMateri(false);
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda & Panduan' },
    { id: 'materi', label: 'Materi & Kuis' },
    { id: 'virtual-lab', label: 'Virtual Lab 3D' },
    { id: 'palu-gunung', label: 'Palu Gunung' },
    { id: 'asesmen', label: 'Asesmen & Skor' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="h-16 flex items-center justify-between gap-8 px-6 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#beranda"
          onClick={(e) => {
            e.preventDefault();
            soundFX.playClick();
            handleNavigateTab('beranda');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          Jelajah Bentang Alam 3D
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  soundFX.playClick();
                  handleNavigateTab(item.id);
                }}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-emerald-700 font-semibold border-emerald-600'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => {
              soundFX.playClick();
              handleNavigateTab('beranda');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {studentName} · {studentClass}
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1">
        {activeTab === 'virtual-lab' && (
          <VirtualLab3D onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'beranda' && (
          <BerandaPanduanView
            studentName={studentName}
            studentClass={studentClass}
            onUpdateIdentity={(n, k) => {
              setStudentName(n);
              setStudentClass(k);
            }}
            onNavigateTab={handleNavigateTab}
            subBabScore={subBabScore}
            paluGunungScore={paluGunungScore}
            asesmenTotalScore={asesmenScores.total}
          />
        )}

        {activeTab === 'materi' && (
          <MateriView
            quizAnswers={quizAnswers}
            onSelectQuizAnswer={handleSelectQuizAnswer}
            onNavigateTab={handleNavigateTab}
            focusQuizOnMount={focusQuizOnMateri}
          />
        )}

        {activeTab === 'palu-gunung' && (
          <PaluGunungGame
            score={paluGunungScore}
            onUpdateScore={setPaluGunungScore}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'asesmen' && (
          <AsesmenView
            studentName={studentName}
            studentClass={studentClass}
            subBabScore={subBabScore}
            paluGunungScore={paluGunungScore}
            onUpdateAsesmenScores={(lots, hots, total) =>
              setAsesmenScores({ lots, hots, total })
            }
          />
        )}
      </main>
    </div>
  );
}
