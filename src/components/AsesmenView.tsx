import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  Send,
  Database,
  Download,
  Code2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  User,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import {
  ASSESSMENT_QUESTIONS,
  INITIAL_LEADERBOARD,
  LeaderboardEntry,
  SPREADSHEET_GVIZ_URL,
  SPREADSHEET_URL
} from '../data/mpiData';
import {
  SUPABASE_URL,
  DEFAULT_SUPABASE_TABLE,
  SUPABASE_SETUP_SQL,
  fetchScoresFromSupabase,
  insertScoreToSupabase
} from '../utils/supabaseClient';
import { soundFX } from '../utils/audio';

interface AsesmenViewProps {
  studentName: string;
  studentClass: string;
  subBabScore: number;
  paluGunungScore: number;
  onUpdateAsesmenScores: (lots: number, hots: number, total: number) => void;
}

const LOCAL_LEADERBOARD_KEY = 'mpi_bentang_alam_leaderboard_v1';
const SUPABASE_TABLE_STORAGE_KEY = 'mpi_bentang_alam_supabase_table';

export const AsesmenView: React.FC<AsesmenViewProps> = ({
  studentName,
  studentClass,
  subBabScore,
  paluGunungScore,
  onUpdateAsesmenScores
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Leaderboard & Supabase State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);
  const [isSavingDb, setIsSavingDb] = useState<boolean>(false);
  const [dbSourceStatus, setDbSourceStatus] = useState<string>(
    `Terhubung ke Supabase (${SUPABASE_URL})`
  );
  const [tableName, setTableName] = useState<string>(() => {
    return localStorage.getItem(SUPABASE_TABLE_STORAGE_KEY) || DEFAULT_SUPABASE_TABLE;
  });
  const [needsTableSetup, setNeedsTableSetup] = useState<boolean>(false);
  const [showDbConfigModal, setShowDbConfigModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'warning';
    text: string;
  } | null>(null);

  // Editable Developer Profile State (Komponen 7)
  const [devProfile, setDevProfile] = useState({
    nama: 'Arina Nuri, S.Pd.',
    instansi: 'SD Negeri Nusantara · Pendidikan Guru Sekolah Dasar',
    peran: 'Educational Game Developer & Interactive Content Creator',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS) — SD Kelas 4 (Kurikulum Merdeka)',
    cp: 'Peserta didik mengidentifikasi ragam bentang alam di Indonesia (daratan dan perairan) serta keterkaitannya dengan profesi, adaptasi masyarakat, dan upaya pelestarian lingkungan.',
    tp: '1. Mengklasifikasikan kenampakan alam daratan dan perairan melalui simulasi Virtual Lab 3D.\n2. Menganalisis hubungan ketinggian tempat (mdpl) dengan karakteristik suhu, tanaman, dan mata pencaharian penduduk.\n3. Merancang solusi pelestarian bentang alam (reboisasi, terasering, konservasi sungai & bakau).'
  });
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  // Assessment Timer
  useEffect(() => {
    if (isSubmitted) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Fetch Leaderboard from Supabase first, then merge with LocalStorage & Spreadsheet fallback
  const fetchLeaderboardData = useCallback(async () => {
    setIsLoadingDb(true);
    const savedLocalRaw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const localEntries: LeaderboardEntry[] = savedLocalRaw ? JSON.parse(savedLocalRaw) : [];

    // 1. Query Supabase
    const { data: supaData, error: supaError } = await fetchScoresFromSupabase(tableName);

    if (supaData && !supaError) {
      setNeedsTableSetup(false);
      const combined = [...supaData, ...localEntries, ...INITIAL_LEADERBOARD];
      // Deduplicate by nama + kelas + totalSkor
      const seen = new Set<string>();
      const unique = combined.filter((item) => {
        const key = `${item.nama}-${item.kelas}-${item.totalSkor}-${item.timestamp}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      unique.sort((a, b) => b.totalSkor - a.totalSkor);
      setLeaderboard(unique);
      setDbSourceStatus(`Sinkronisasi Aktif · Supabase (${tableName}) — ${supaData.length} Data Cloud`);
      setIsLoadingDb(false);
      return;
    }

    if (supaError && supaError.includes('Could not find the table')) {
      setNeedsTableSetup(true);
      setDbSourceStatus(
        `Terhubung ke Supabase · Tabel 'public.${tableName}' belum dibuat (Klik "Setup SQL Supabase")`
      );
    } else if (supaError) {
      setDbSourceStatus(`Supabase: ${supaError} · Menggunakan Cadangan Lokal`);
    }

    // 2. Fallback to Google Spreadsheet GViz + LocalStorage
    try {
      const response = await fetch(SPREADSHEET_GVIZ_URL);
      const text = await response.text();
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        const rows = parsed?.table?.rows || [];
        const remoteEntries: LeaderboardEntry[] = rows
          .map((r: { c: ({ v?: string | number; f?: string } | null)[] }) => {
            const c = r.c || [];
            return {
              timestamp: String(c[0]?.f || c[0]?.v || '2026-11-08'),
              nama: String(c[1]?.v || 'Siswa SD'),
              kelas: String(c[2]?.v || 'Kelas 4'),
              skorKuisSubBab: Number(c[3]?.v ?? 0),
              skorPaluGunung: Number(c[4]?.v ?? 0),
              skorAsesmenC1C3: Number(c[5]?.v ?? 0),
              skorAsesmenC4C6: Number(c[6]?.v ?? 0),
              totalSkor: Number(c[7]?.v ?? 0)
            };
          })
          .filter((item: LeaderboardEntry) => item.nama && item.nama !== 'Nama Siswa');

        const combined = [...localEntries, ...remoteEntries, ...INITIAL_LEADERBOARD];
        combined.sort((a, b) => b.totalSkor - a.totalSkor);
        setLeaderboard(combined);
      } else {
        const fallback = [...localEntries, ...INITIAL_LEADERBOARD].sort(
          (a, b) => b.totalSkor - a.totalSkor
        );
        setLeaderboard(fallback);
      }
    } catch {
      const fallback = [...localEntries, ...INITIAL_LEADERBOARD].sort(
        (a, b) => b.totalSkor - a.totalSkor
      );
      setLeaderboard(fallback);
    } finally {
      setIsLoadingDb(false);
    }
  }, [tableName]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Calculate LOTS (C1-C3: 4 questions) & HOTS (C4-C6: 6 questions) scores
  const calculateScores = () => {
    let lotsCorrect = 0;
    let hotsCorrect = 0;
    ASSESSMENT_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        if (q.part === 'LOTS') lotsCorrect++;
        else hotsCorrect++;
      }
    });
    const lotsScore = Math.round((lotsCorrect / 4) * 100);
    const hotsScore = Math.round((hotsCorrect / 6) * 100);
    const totalAsesmen = Math.round(((lotsCorrect + hotsCorrect) / 10) * 100);
    return { lotsCorrect, hotsCorrect, lotsScore, hotsScore, totalAsesmen };
  };

  const { lotsCorrect, hotsCorrect, lotsScore, hotsScore, totalAsesmen } = calculateScores();
  const answeredCount = Object.keys(answers).length;

  const handleFinishAssessment = () => {
    soundFX.playVictory();
    setIsSubmitted(true);
    onUpdateAsesmenScores(lotsScore, hotsScore, totalAsesmen);
  };

  const handleSaveToSupabase = async () => {
    soundFX.playCorrect();
    setIsSavingDb(true);
    setSubmitMessage(null);

    const overallScore = Math.round((subBabScore + paluGunungScore + totalAsesmen) / 3);
    const newEntry: LeaderboardEntry = {
      timestamp: new Date().toLocaleString('id-ID'),
      nama: studentName || 'Penjelajah Nusantara',
      kelas: studentClass || 'Kelas 4 SD',
      skorKuisSubBab: subBabScore,
      skorPaluGunung: paluGunungScore,
      skorAsesmenC1C3: lotsScore,
      skorAsesmenC4C6: hotsScore,
      totalSkor: overallScore
    };

    // 1. Save to localStorage immediately
    const existingRaw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const existingList: LeaderboardEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updatedLocal = [newEntry, ...existingList];
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(updatedLocal));

    setLeaderboard((prev) => [newEntry, ...prev].sort((a, b) => b.totalSkor - a.totalSkor));

    // 2. Insert into Supabase table
    const { ok, error } = await insertScoreToSupabase(newEntry, tableName);

    setIsSavingDb(false);
    if (ok) {
      setNeedsTableSetup(false);
      setSubmitMessage({
        type: 'success',
        text: `Skor ${newEntry.nama} berhasil disimpan secara permanen ke Database Supabase (${tableName})!`
      });
      fetchLeaderboardData();
    } else if (error && error.includes('Could not find the table')) {
      setNeedsTableSetup(true);
      setShowDbConfigModal(true);
      setSubmitMessage({
        type: 'warning',
        text: `Skor tersimpan di Papan Skor Lokal. Tabel 'public.${tableName}' belum dibuat di Supabase — jalankan SQL di bawah pada Supabase SQL Editor.`
      });
    } else {
      setSubmitMessage({
        type: 'warning',
        text: `Skor tersimpan di Papan Skor Lokal. Pesan Supabase: ${error}`
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadCsv = () => {
    soundFX.playClick();
    const headers = [
      'Timestamp',
      'Nama Siswa',
      'Kelas',
      'Skor Kuis Sub-Bab',
      'Skor Palu Gunung',
      'Skor Asesmen LOTS (C1-C3)',
      'Skor Asesmen HOTS (C4-C6)',
      'Total Skor Akhir'
    ];
    const csvRows = [
      headers.join(','),
      ...leaderboard.map((row) =>
        [
          `"${row.timestamp}"`,
          `"${row.nama}"`,
          `"${row.kelas}"`,
          row.skorKuisSubBab,
          row.skorPaluGunung,
          row.skorAsesmenC1C3,
          row.skorAsesmenC4C6,
          row.totalSkor
        ].join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Nilai_Bentang_Alam_Kelas4_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeQuestion = ASSESSMENT_QUESTIONS[currentQuestionIdx];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
      {/* SECTION 1: ASESMEN EVALUASI KOMPREHENSIF C1 - C6 */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-semibold text-sky-700">
              Komponen 5 · Asesmen Evaluasi Resmi Berbasis Taksonomi Bloom
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              Asesmen Evaluasi C1–C6 Bentang Alam Indonesia
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Terdiri atas 4 Soal LOTS (C1 Mengingat, C2 Memahami, C3 Menerapkan) dan 6 Soal HOTS (C4 Menganalisis, C5 Mengevaluasi, C6 Mencipta).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium">Waktu:</span>
              <span className="font-mono font-bold tabular-nums">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold font-mono tabular-nums">
              Terjawab: {answeredCount} / 10
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols: Active Question Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="text-xs font-mono font-semibold text-sky-700">
                Soal Nomor {activeQuestion.id} dari 10 · Bagian {activeQuestion.part} ({activeQuestion.cognitiveLevel})
              </div>
              <div className="text-xs text-slate-500">
                Siswa: <strong className="text-slate-800">{studentName}</strong> ({studentClass})
              </div>
            </div>

            <h2 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
              {activeQuestion.question}
            </h2>

            <div className="space-y-3">
              {activeQuestion.options.map((opt, optIdx) => {
                const chosenIdx = answers[activeQuestion.id];
                const isSelected = chosenIdx === optIdx;
                const isCorrect = activeQuestion.correctIndex === optIdx;

                let btnClass = 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800';
                if (!isSubmitted && isSelected) {
                  btnClass = 'border-sky-600 bg-sky-50 text-sky-950 font-semibold';
                } else if (isSubmitted) {
                  if (isCorrect) {
                    btnClass = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'border-red-500 bg-red-50 text-red-900';
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (isSubmitted) return;
                      soundFX.playClick();
                      setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optIdx }));
                    }}
                    className={`w-full px-4 py-3.5 text-left text-sm rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Pembahasan ({activeQuestion.cognitiveLevel}): </strong>
                {activeQuestion.explanation}
              </div>
            )}

            {/* Prev / Next Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setCurrentQuestionIdx((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentQuestionIdx === 0}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 cursor-pointer"
              >
                ← Soal Sebelumnya
              </button>

              {currentQuestionIdx < ASSESSMENT_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setCurrentQuestionIdx((prev) =>
                      Math.min(ASSESSMENT_QUESTIONS.length - 1, prev + 1)
                    );
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  Soal Berikutnya →
                </button>
              ) : !isSubmitted ? (
                <button
                  onClick={handleFinishAssessment}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  Selesaikan & Hitung Skor Evaluasi
                </button>
              ) : null}
            </div>
          </div>

          {/* Right 4 Cols: Question Navigator & LOTS/HOTS Score Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">
                Navigasi 10 Nomor Soal (LOTS & HOTS)
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {ASSESSMENT_QUESTIONS.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIdx;
                  let boxClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (isSubmitted) {
                    boxClass =
                      answers[q.id] === q.correctIndex
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-red-600 text-white border-red-600';
                  } else if (isCurrent) {
                    boxClass = 'bg-slate-900 text-white border-slate-900';
                  } else if (isAnswered) {
                    boxClass = 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        soundFX.playClick();
                        setCurrentQuestionIdx(idx);
                      }}
                      className={`py-2.5 rounded-xl border text-xs font-mono tabular-nums transition-colors cursor-pointer ${boxClass}`}
                    >
                      {q.id}
                      <span className="block text-[10px] opacity-80">{q.part}</span>
                    </button>
                  );
                })}
              </div>

              {!isSubmitted ? (
                <button
                  onClick={handleFinishAssessment}
                  className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                >
                  Kumpulkan Jawaban ({answeredCount}/10)
                </button>
              ) : (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="text-xs font-semibold text-emerald-700">
                    Hasil Akhir Evaluasi Kognitif
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">LOTS (C1-C3)</div>
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {lotsScore}%
                      </div>
                      <div className="text-[10px] text-slate-500">{lotsCorrect}/4 Benar</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">HOTS (C4-C6)</div>
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {hotsScore}%
                      </div>
                      <div className="text-[10px] text-slate-500">{hotsCorrect}/6 Benar</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] text-emerald-800">Skor Total</div>
                      <div className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                        {totalAsesmen}
                      </div>
                      <div className="text-[10px] text-emerald-700">Skala 100</div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveToSupabase}
                    disabled={isSavingDb}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSavingDb
                        ? 'Menyimpan ke Supabase...'
                        : 'Kirim Nilai ke Database Supabase'}
                    </span>
                  </button>

                  {submitMessage && (
                    <div
                      className={`p-2.5 rounded-lg border text-xs ${
                        submitMessage.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: KOMPONEN 6 — DATABASE SUPABASE & LEADERBOARD */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-semibold text-emerald-700">
              Komponen 6 · Integrasi Cloud Database Supabase (furuwnqyzkovznoofczb.supabase.co)
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
              Papan Skor Siswa (Leaderboard) & Rekap Database
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Status Database: {dbSourceStatus}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchLeaderboardData}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
              <span>Sinkronkan Supabase</span>
            </button>

            <button
              onClick={handleSaveToSupabase}
              disabled={isSavingDb}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan Skor Saya Sekarang</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Rekap CSV</span>
            </button>

            <button
              onClick={() => setShowDbConfigModal((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                needsTableSetup
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{needsTableSetup ? 'Setup SQL Supabase' : 'Konfigurasi Database'}</span>
            </button>
          </div>
        </div>

        {/* Supabase Setup & Table Config Drawer */}
        {showDbConfigModal && (
          <div className="p-5 rounded-xl bg-slate-900 text-slate-100 space-y-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-400">
                  Konfigurasi Tabel Supabase ({SUPABASE_URL})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jika tabel <code className="text-amber-300">public.{tableName}</code> belum dibuat di Supabase Anda, salin dan jalankan SQL di bawah ini pada menu <strong>SQL Editor</strong> di Dashboard Supabase.
                </p>
              </div>
              <button
                onClick={() => setShowDbConfigModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5 space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Nama Tabel Supabase:
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => {
                      const val = e.target.value.trim() || DEFAULT_SUPABASE_TABLE;
                      setTableName(val);
                      localStorage.setItem(SUPABASE_TABLE_STORAGE_KEY, val);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleCopySql}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'SQL Berhasil Disalin!' : 'Salin SQL Tabel Supabase'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/furuwnqyzkovznoofczb/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Buka Supabase SQL Editor</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={SPREADSHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
                  >
                    <span>Buka Google Spreadsheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <pre className="p-3.5 rounded-lg bg-slate-950 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-right">Kuis Sub-Bab</th>
                <th className="py-3 px-4 text-right">Palu Gunung</th>
                <th className="py-3 px-4 text-right">LOTS (C1-C3)</th>
                <th className="py-3 px-4 text-right">HOTS (C4-C6)</th>
                <th className="py-3 px-4 text-right">Total Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {leaderboard.map((entry, idx) => (
                <tr key={`${entry.nama}-${idx}`} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 tabular-nums">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {entry.nama}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {entry.kelas}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {entry.skorKuisSubBab}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {entry.skorPaluGunung}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {entry.skorAsesmenC1C3}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {entry.skorAsesmenC4C6}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-700">
                    {entry.totalSkor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: KOMPONEN 7 — PROFIL PENGEMBANG & CAPAIAN PEMBELAJARAN */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-700">
              Komponen 7 · Identitas Pengembang & Kurikulum Merdeka
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Profil Pengembang Media Pembelajaran Interaktif
            </h2>
          </div>
          <button
            onClick={() => setIsEditingProfile((prev) => !prev)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
          >
            {isEditingProfile ? 'Simpan Profil' : 'Edit Profil Pengembang'}
          </button>
        </div>

        {isEditingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Pengembang
              </label>
              <input
                type="text"
                value={devProfile.nama}
                onChange={(e) => setDevProfile({ ...devProfile, nama: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                NIP / NIM / Instansi
              </label>
              <input
                type="text"
                value={devProfile.instansi}
                onChange={(e) => setDevProfile({ ...devProfile, instansi: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{devProfile.nama}</h3>
                <p className="text-xs font-medium text-emerald-700">{devProfile.peran}</p>
                <p className="text-xs text-slate-600">{devProfile.instansi}</p>
                <p className="text-xs text-slate-500 pt-1">{devProfile.mapel}</p>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Capaian Pembelajaran (CP)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{devProfile.cp}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Tujuan Pembelajaran (TP)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {devProfile.tp}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
