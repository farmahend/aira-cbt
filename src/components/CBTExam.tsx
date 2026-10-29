import React, { useState, useEffect, useMemo } from 'react';
import { MathText } from './MathText';
import {
  Question,
  Exam,
  CBTUserAnswer,
  ExamSessionResult,
  QuestionType
} from '../types';
import {
  saveActiveCBTSession,
  getActiveCBTSession,
  clearActiveCBTSession
} from '../utils/storage';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Layers,
  Sparkles,
  ArrowRight,
  CheckSquare,
  ListOrdered,
  X,
  Zap
} from 'lucide-react';

interface CBTExamProps {
  exam: Exam;
  questions: Question[];
  onFinishExam: (result: ExamSessionResult) => void;
  onExitExam: () => void;
}

export const CBTExam: React.FC<CBTExamProps> = ({
  exam,
  questions,
  onFinishExam,
  onExitExam,
}) => {
  // Current index in question list
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Restore in-progress session from local storage (Offline-First resilience & 0ms latency)
  const savedSession = useMemo(() => getActiveCBTSession(exam.id), [exam.id]);

  // User answers map: questionId -> CBTUserAnswer
  const [answers, setAnswers] = useState<Record<string, CBTUserAnswer>>(
    () => savedSession?.answers || {}
  );
  
  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (savedSession && savedSession.remainingSeconds > 0) {
      return savedSession.remainingSeconds;
    }
    return exam.durationMinutes * 60;
  });
  const [isTimeWarning, setIsTimeWarning] = useState(false);

  // Auto-persist answers and time locally on every answer update (0ms, zero network)
  useEffect(() => {
    saveActiveCBTSession(exam.id, answers, remainingSeconds);
  }, [answers, remainingSeconds, exam.id]);
  
  // Question Sheet / Drawer Modal on mobile and desktop
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  
  // Submit Confirmation Modal
  const [isConfirmFinishOpen, setIsConfirmFinishOpen] = useState(false);
  
  // Font size scale: 'normal' | 'large' | 'xlarge'
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const currentQuestion = questions[currentIndex] || questions[0];

  // Initialize answer state if not exists
  const currentAnswer: CBTUserAnswer = useMemo(() => {
    if (!currentQuestion) {
      return {
        questionId: '',
        type: 'pilihan_ganda'
      };
    }
    return answers[currentQuestion.id] || {
      questionId: currentQuestion.id,
      type: currentQuestion.type,
      selectedOptionId: undefined,
      selectedOptionIds: [],
      matchingAnswers: {},
      trueFalseAnswers: {},
      isFlagged: false
    };
  }, [answers, currentQuestion]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        if (prev <= 300) {
          setIsTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam.id]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: check if question has an answer
  const isQuestionAnswered = (q: Question): boolean => {
    const ans = answers[q.id];
    if (!ans) return false;
    switch (q.type) {
      case 'pilihan_ganda':
        return Boolean(ans.selectedOptionId);
      case 'pilihan_ganda_kompleks':
        return Boolean(ans.selectedOptionIds && ans.selectedOptionIds.length > 0);
      case 'menjodohkan':
        return Boolean(
          ans.matchingAnswers &&
          q.matchingPairs &&
          Object.keys(ans.matchingAnswers).length >= q.matchingPairs.length
        );
      case 'benar_salah':
        return Boolean(
          ans.trueFalseAnswers &&
          q.trueFalseItems &&
          Object.keys(ans.trueFalseAnswers).length >= q.trueFalseItems.length
        );
      default:
        return false;
    }
  };

  // Answer handlers
  const handleSelectPilihanGanda = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        selectedOptionId: optionId
      }
    }));
  };

  const handleTogglePilihanGandaKompleks = (optionId: string) => {
    const currentList = currentAnswer.selectedOptionIds || [];
    const nextList = currentList.includes(optionId)
      ? currentList.filter((id) => id !== optionId)
      : [...currentList, optionId];

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        selectedOptionIds: nextList
      }
    }));
  };

  const handleSelectMenjodohkan = (leftId: string, rightTarget: string) => {
    const currentMatches = currentAnswer.matchingAnswers || {};
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        matchingAnswers: {
          ...currentMatches,
          [leftId]: rightTarget
        }
      }
    }));
  };

  const handleSelectBenarSalah = (itemId: string, value: boolean) => {
    const currentTF = currentAnswer.trueFalseAnswers || {};
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        trueFalseAnswers: {
          ...currentTF,
          [itemId]: value
        }
      }
    }));
  };

  const handleToggleFlag = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        isFlagged: !currentAnswer.isFlagged
      }
    }));
  };

  // Final evaluation logic
  const calculateResult = (): ExamSessionResult => {
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      maxScore += q.points;
      const ans = answers[q.id];
      const answered = isQuestionAnswered(q);

      if (!answered) {
        unansweredCount++;
        return;
      }

      let isCorrect = false;

      if (q.type === 'pilihan_ganda') {
        if (ans?.selectedOptionId === q.correctOptionId) {
          isCorrect = true;
        }
      } else if (q.type === 'pilihan_ganda_kompleks') {
        const correctSet = new Set(q.correctOptionIds || []);
        const userSet = new Set(ans?.selectedOptionIds || []);
        if (
          correctSet.size === userSet.size &&
          [...correctSet].every((id) => userSet.has(id))
        ) {
          isCorrect = true;
        }
      } else if (q.type === 'menjodohkan') {
        const pairs = q.matchingPairs || [];
        const userMatches = ans?.matchingAnswers || {};
        const allMatched = pairs.every((p) => userMatches[p.id] === p.right);
        if (allMatched) {
          isCorrect = true;
        }
      } else if (q.type === 'benar_salah') {
        const items = q.trueFalseItems || [];
        const userTF = ans?.trueFalseAnswers || {};
        const allCorrect = items.every((item) => userTF[item.id] === item.isTrue);
        if (allCorrect) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        correctCount++;
        totalScore += q.points;
      } else {
        incorrectCount++;
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const timeSpent = exam.durationMinutes * 60 - remainingSeconds;

    return {
      id: `res_${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      grade: exam.grade,
      isDemo: exam.isDemo,
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      isPassed: percentage >= exam.passingGrade,
      timeSpentSeconds: timeSpent,
      correctCount,
      incorrectCount,
      unansweredCount,
      completedAt: new Date().toISOString(),
      userAnswers: answers
    };
  };

  const handleAutoSubmit = () => {
    clearActiveCBTSession(exam.id);
    const res = calculateResult();
    onFinishExam(res);
  };

  const handleManualSubmit = () => {
    setIsConfirmFinishOpen(false);
    clearActiveCBTSession(exam.id);
    const res = calculateResult();
    onFinishExam(res);
  };

  // Font size styling helper
  const textSizeClass = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed'
  }[fontSize];

  // Stats for the confirmation dialog
  const answeredCount = questions.filter(isQuestionAnswered).length;
  const flaggedCount = Object.values(answers).filter((a) => a.isFlagged).length;
  const remainingCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Header CBT Bar */}
      <header className="bg-purple-900 text-white border-b-2 border-amber-400 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand & Exam Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-purple-950 font-black flex items-center justify-center text-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-md">
                  {exam.title}
                </span>
                {exam.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-purple-950 uppercase">
                    Demo Gratis
                  </span>
                )}
              </div>
              <p className="text-[11px] text-purple-200">
                Sistem CBT Aira Bimbel · Standar Ujian Asli
              </p>
            </div>
          </div>

          {/* Center: Offline-First Zero-Latency Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>0ms Offline-First (Tersimpan di Perangkat)</span>
          </div>

          {/* Center / Right: Font size & Timer */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Font scale buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-purple-950/60 p-1 rounded-lg border border-purple-700/50 text-xs">
              <span className="text-[10px] text-purple-300 px-1 font-medium">Ukuran:</span>
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded font-bold ${
                  fontSize === 'normal' ? 'bg-amber-400 text-purple-950' : 'text-purple-200 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded font-bold ${
                  fontSize === 'large' ? 'bg-amber-400 text-purple-950' : 'text-purple-200 hover:text-white'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded font-bold ${
                  fontSize === 'xlarge' ? 'bg-amber-400 text-purple-950' : 'text-purple-200 hover:text-white'
                }`}
              >
                A++
              </button>
            </div>

            {/* Timer countdown display */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm sm:text-base shadow-xs tabular-nums ${
                isTimeWarning
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-purple-950 border-purple-700 text-amber-300'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            {/* Question Sheet Toggle Button */}
            <button
              type="button"
              onClick={() => setIsQuestionListOpen(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <ListOrdered className="w-4 h-4" />
              <span className="hidden sm:inline">Daftar Soal</span>
              <span className="bg-purple-950 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-mono">
                {currentIndex + 1}/{questions.length}
              </span>
            </button>

          </div>

        </div>
      </header>

      {/* CBT Body Area: 2 Distinct Separated Cards */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        
        {/* Navigation Indicator Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Nomor Soal:
            </span>
            <span className="w-8 h-8 rounded-lg bg-purple-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-slate-500">
              dari {questions.length} soal ({currentQuestion.subject})
            </span>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200">
            {currentQuestion.type === 'pilihan_ganda' && 'Pilihan Ganda (Satu Jawaban Benar)'}
            {currentQuestion.type === 'pilihan_ganda_kompleks' && 'Pilihan Ganda Kompleks (Banyak Jawaban)'}
            {currentQuestion.type === 'menjodohkan' && 'Menjodohkan (Pasangkan Jawaban)'}
            {currentQuestion.type === 'benar_salah' && 'Benar / Salah (Pernyataan)'}
          </div>
        </div>

        {/* 2-CARD SEPARATION: CRITICAL REQUIREMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================== */}
          {/* CARD 1: STIMULUS & PERNYATAAN (Left Column on Desktop)        */}
          {/* ============================================================== */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[75vh]">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">
                  Kartu Stimulus & Teks Pernyataan
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Wacana / Informasi
              </span>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {currentQuestion.stimulusTitle && (
                <h4 className="text-base font-bold text-purple-950 border-b border-purple-100 pb-2">
                  {currentQuestion.stimulusTitle}
                </h4>
              )}

              {/* Optional Stimulus Image */}
              {currentQuestion.stimulusImageUrl && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 text-center">
                  <img
                    src={currentQuestion.stimulusImageUrl}
                    alt="Stimulus Soal TKA"
                    className="max-h-72 mx-auto rounded-lg object-contain"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Gambar Pendukung Stimulus
                  </span>
                </div>
              )}

              {/* Stimulus Text */}
              <div className={`text-slate-800 ${textSizeClass} whitespace-pre-line leading-relaxed font-normal`}>
                <MathText text={currentQuestion.stimulusText} />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CARD 2: PERTANYAAN & OPSI JAWABAN (Right Column on Desktop)   */}
          {/* ============================================================== */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-purple-200 shadow-sm overflow-hidden flex flex-col max-h-[75vh]">
            <div className="bg-purple-50/70 px-5 py-3 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider font-sans">
                  Kartu Pertanyaan & Lembar Jawaban
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Bobot: {currentQuestion.points} Poin
              </span>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* Question Prompt */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className={`font-semibold text-slate-900 ${textSizeClass}`}>
                  <MathText text={currentQuestion.questionPrompt} />
                </p>
              </div>

              {/* Interactive Inputs by Question Type */}
              
              {/* 1. PILIHAN GANDA */}
              {currentQuestion.type === 'pilihan_ganda' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectPilihanGanda(opt.id)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 min-h-[48px] cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-700 text-purple-950 shadow-xs ring-2 ring-purple-100'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/70 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-purple-900 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <span className={`flex-1 font-normal ${textSizeClass}`}>
                          <MathText text={opt.text} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. PILIHAN GANDA KOMPLEKS (Multi-select) */}
              {currentQuestion.type === 'pilihan_ganda_kompleks' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-purple-900 bg-purple-50 p-2.5 rounded-lg border border-purple-200 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-purple-700" />
                    <span>Dapat memilih lebih dari satu jawaban benar:</span>
                  </div>

                  {currentQuestion.options.map((opt) => {
                    const isSelected = (currentAnswer.selectedOptionIds || []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleTogglePilihanGandaKompleks(opt.id)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 min-h-[48px] cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-700 text-purple-950 shadow-xs ring-2 ring-purple-100'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/70 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-purple-900 text-white'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {isSelected ? '✓' : opt.label}
                        </div>
                        <span className={`flex-1 font-normal ${textSizeClass}`}>
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. MENJODOHKAN (Matching Pairs) */}
              {currentQuestion.type === 'menjodohkan' && currentQuestion.matchingPairs && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Pilih pasangan yang tepat untuk setiap premis di bawah ini:
                  </p>

                  {/* Extract unique right-hand side options for dropdown selection */}
                  {(() => {
                    const availableRights = currentQuestion.matchingPairs.map(p => p.right);
                    return currentQuestion.matchingPairs.map((pair, idx) => {
                      const selectedRight = currentAnswer.matchingAnswers?.[pair.id] || '';
                      return (
                        <div
                          key={pair.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-950 text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-slate-800">
                              <MathText text={pair.left} />
                            </span>
                          </div>

                          <div className="pl-7">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">
                              Pasangan yang sesuai:
                            </label>
                            <select
                              value={selectedRight}
                              onChange={(e) => handleSelectMenjodohkan(pair.id, e.target.value)}
                              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600 cursor-pointer"
                            >
                              <option value="">-- Pilih Jawaban Pasangan --</option>
                              {availableRights.map((r, rIdx) => (
                                <option key={rIdx} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* 4. BENAR / SALAH (True or False) */}
              {currentQuestion.type === 'benar_salah' && currentQuestion.trueFalseItems && (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                          <th className="py-2.5 px-3 font-bold">Pernyataan</th>
                          <th className="py-2.5 px-2 font-bold text-center w-20">Benar</th>
                          <th className="py-2.5 px-2 font-bold text-center w-20">Salah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentQuestion.trueFalseItems.map((item) => {
                          const currentVal = currentAnswer.trueFalseAnswers?.[item.id];
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/60">
                              <td className="py-3 px-3 text-slate-800 font-normal leading-relaxed">
                                <MathText text={item.statement} />
                              </td>
                              <td className="py-3 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleSelectBenarSalah(item.id, true)}
                                  className={`w-9 h-9 rounded-lg font-bold text-xs transition-all mx-auto flex items-center justify-center ${
                                    currentVal === true
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                >
                                  B
                                </button>
                              </td>
                              <td className="py-3 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleSelectBenarSalah(item.id, false)}
                                  className={`w-9 h-9 rounded-lg font-bold text-xs transition-all mx-auto flex items-center justify-center ${
                                    currentVal === false
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                                  }`}
                                >
                                  S
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-200 py-3.5 px-4 sm:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Previous Question Button */}
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Soal Sebelumnya</span>
            <span className="sm:hidden">Sebelum</span>
          </button>

          {/* Ragu-ragu Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFlag}
            className={`px-4 py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              currentAnswer.isFlagged
                ? 'bg-amber-400 border-amber-500 text-purple-950 shadow-xs'
                : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Flag className={`w-4 h-4 ${currentAnswer.isFlagged ? 'fill-purple-950' : 'fill-none'}`} />
            <span>Ragu-Ragu</span>
          </button>

          {/* Next / Selesai Ujian Button */}
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Soal Berikutnya</span>
              <span className="sm:hidden">Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmFinishOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Kumpulkan Ujian</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

        </div>
      </footer>

      {/* Drawer: Daftar Soal Modal */}
      {isQuestionListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Navigasi Daftar Soal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionListOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Legend status */}
              <div className="flex items-center justify-around p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-purple-900 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-slate-600">Sudah Dijawab ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-amber-400 text-purple-950 flex items-center justify-center text-[10px] font-bold">
                    !
                  </div>
                  <span className="text-slate-600">Ragu-ragu ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    -
                  </div>
                  <span className="text-slate-600">Belum ({remainingCount})</span>
                </div>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1">
                {questions.map((q, idx) => {
                  const answered = isQuestionAnswered(q);
                  const flagged = answers[q.id]?.isFlagged;
                  const isCurrent = idx === currentIndex;

                  let colorClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                  if (flagged) {
                    colorClass = 'bg-amber-400 text-purple-950 border-amber-500 font-black';
                  } else if (answered) {
                    colorClass = 'bg-purple-900 text-white border-purple-950 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsQuestionListOpen(false);
                      }}
                      className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${colorClass} ${
                        isCurrent ? 'ring-4 ring-amber-400 ring-offset-2' : ''
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">{idx + 1}</span>
                      <span className="text-[9px] opacity-75 mt-0.5">
                        {flagged ? 'RAGU' : answered ? 'JAWAB' : 'KOSONG'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons inside drawer */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionListOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
                >
                  Tutup Daftar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuestionListOpen(false);
                    setIsConfirmFinishOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  Selesaikan Ujian
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {isConfirmFinishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5">
            
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Kumpulkan Lembar Jawaban CBT?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Periksa kembali ringkasan jawabanmu di bawah sebelum hasil skormu dihitung otomatis:
              </p>
            </div>

            {/* Status breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Soal:</span>
                <span className="font-bold text-slate-900">{questions.length} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sudah Terjawab:</span>
                <span className="font-bold text-emerald-700">{answeredCount} Soal</span>
              </div>
              {remainingCount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Belum Terjawab:</span>
                  <span>{remainingCount} Soal</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Ditandai Ragu-ragu:</span>
                  <span>{flaggedCount} Soal</span>
                </div>
              )}
            </div>

            {remainingCount > 0 ? (
              <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                ⚡ <strong>Catatan:</strong> Masih ada {remainingCount} butir soal kosong. Kamu tetap dapat mengumpulkan lembar jawaban jika sudah yakin.
              </p>
            ) : (
              <p className="text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium">
                ✨ <strong>Keren!</strong> Seluruh soal telah terisi. Skor dan Trik 15 Detik Mas Aira langsung siap dibuka.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmFinishOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cek Kembali
              </button>

              <button
                type="button"
                onClick={handleManualSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-900 via-purple-950 to-indigo-950 hover:from-purple-800 hover:to-purple-900 text-white font-black text-xs shadow-md border border-amber-400 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                🚀 Ya, Kumpulkan Sekarang
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
