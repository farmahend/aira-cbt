import Papa from 'papaparse';
import { Question, QuestionType, GradeLevel } from '../types';

export const CSV_TEMPLATE_HEADERS = [
  'grade',
  'subject',
  'type',
  'stimulus_title',
  'stimulus_text',
  'stimulus_image_url',
  'question_prompt',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option_e',
  'correct_answer',
  'matching_pairs',
  'true_false_items',
  'points',
  'fast_trick',
  'explanation'
];

export const SAMPLE_CSV_ROWS = [
  {
    grade: 'SMA',
    subject: 'Penalaran Matematika (TKA SMA)',
    type: 'pilihan_ganda',
    stimulus_title: 'Analisis Pertumbuhan Mikroba',
    stimulus_text: 'Suatu koloni bakteri berlipat ganda setiap 30 menit. Pada awal pengamatan terdapat 200 bakteri.',
    stimulus_image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    question_prompt: 'Berapa banyak bakteri setelah 3 jam pengamatan?',
    option_a: '3.200 bakteri',
    option_b: '6.400 bakteri',
    option_c: '12.800 bakteri',
    option_d: '25.600 bakteri',
    option_e: '51.200 bakteri',
    correct_answer: 'C',
    matching_pairs: '',
    true_false_items: '',
    points: 20,
    fast_trick: '3 jam = 6 periode 30 menit. N = 200 * (2^6) = 200 * 64 = 12.800!',
    explanation: 'Pertumbuhan eksponensial dengan rumus N(t) = N0 * 2^(t/T). N = 200 * 2^6 = 12.800 bakteri.'
  },
  {
    grade: 'SMP',
    subject: 'Literasi Sains Terpadu (TKA SMP)',
    type: 'pilihan_ganda_kompleks',
    stimulus_title: 'Siklus Hidrologi & Polusi Air',
    stimulus_text: 'Limbah mikroplastik ditemukan mencemari muara sungai dan mengendap di sedimen mangrove.',
    stimulus_image_url: '',
    question_prompt: 'Pilihlah DUA atau LEBIH dampak pencemaran mikroplastik pada rantai makanan mangrove! (Centang opsi)',
    option_a: 'Bioakumulasi racun pada kepiting dan ikan belanak',
    option_b: 'Peningkatan laju penyerapan karbon oleh pohon bakau',
    option_c: 'Terganggunya sistem pencernaan biota bentik',
    option_d: 'Kualitas air tanah di pesisir menjadi lebih jernih',
    option_e: 'Penurunan populasi burung pemangsa pemakan ikan',
    correct_answer: 'A,C,E',
    matching_pairs: '',
    true_false_items: '',
    points: 25,
    fast_trick: 'Mikroplastik tidak bisa dicerna -> menumpuk (bioakumulasi) -> merusak puncak rantai makanan!',
    explanation: 'Mikroplastik termakan oleh organisme kecil, merusak saluran pencernaan, dan mengalami biomagnifikasi hingga burung pemangsa.'
  },
  {
    grade: 'SD',
    subject: 'Matematika Geometri (TKA SD)',
    type: 'menjodohkan',
    stimulus_title: 'Karakteristik Bangun Ruang',
    stimulus_text: 'Perhatikan sifat-sifat bangun ruang kubus, balok, kerucut, dan tabung.',
    stimulus_image_url: '',
    question_prompt: 'Pasangkanlah sifat bangun ruang di sebelah kiri dengan nama bangunnya!',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_e: '',
    correct_answer: '',
    matching_pairs: 'Memiliki 6 sisi persegi sama besar:Kubus | Memiliki 1 titik puncak dan 1 sisi alas melingkar:Kerucut | Memiliki 2 sisi lingkaran sejajar dan 1 selimut lengkung:Tabung',
    true_false_items: '',
    points: 25,
    fast_trick: 'Cari kata kunci: 6 persegi = Kubus, Puncak lancip = Kerucut, Selimut lengkung tabung!',
    explanation: 'Identitas bangun ruang berdasar jumlah rusuk, titik sudut, dan bentuk bidang sisinya.'
  },
  {
    grade: 'SMA',
    subject: 'Penalaran Umum (TKA SMA)',
    type: 'benar_salah',
    stimulus_title: 'Logika Silogisme Iklim Global',
    stimulus_text: 'Emisi gas rumah kaca yang tidak terkontrol mempercepat kenaikan suhu rata-rata permukaan bumi.',
    stimulus_image_url: '',
    question_prompt: 'Tentukan apakah setiap pernyataan berikut bernilai Benar atau Salah!',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_e: '',
    correct_answer: '',
    matching_pairs: '',
    true_false_items: 'Kenaikan suhu global menyebabkan pencairan es di kutub lebih cepat:BENAR | Reboisasi hutan memperparah efek pemanasan global:SALAH | Peningkatan gas metana berkontribusi terhadap efek rumah kaca:BENAR',
    points: 20,
    fast_trick: 'Reboisasi menyerap CO2 sehingga mengurangi pemanasan, jadi pernyataan 2 pasti SALAH!',
    explanation: 'Pernyataan 1 dan 3 sesuai dengan konsensus ilmiah perubahan iklim; pernyataan 2 berkebalikan dari fakta ilmiah.'
  }
];

export function generateCSVTemplate(): string {
  return Papa.unparse(SAMPLE_CSV_ROWS, {
    quotes: true,
    delimiter: ',',
    header: true
  });
}

export function downloadCSVTemplate(): void {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `template_soal_tka_airabimbel_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportQuestionsToCSV(questions: Question[], customFilename?: string): void {
  const rows = questions.map(q => {
    // Flatten options
    const optMap: Record<string, string> = {};
    (q.options || []).forEach(o => {
      optMap[`option_${o.label.toLowerCase()}`] = o.text;
    });

    let correct = '';
    if (q.type === 'pilihan_ganda') {
      const found = q.options?.find(o => o.id === q.correctOptionId);
      correct = found?.label || 'A';
    } else if (q.type === 'pilihan_ganda_kompleks') {
      correct = (q.options || [])
        .filter(o => (q.correctOptionIds || []).includes(o.id))
        .map(o => o.label)
        .join(',');
    }

    const matchingStr = (q.matchingPairs || [])
      .map(p => `${p.left}:${p.right}`)
      .join(' | ');

    const tfStr = (q.trueFalseItems || [])
      .map(t => `${t.statement}:${t.isTrue ? 'BENAR' : 'SALAH'}`)
      .join(' | ');

    return {
      grade: q.grade,
      subject: q.subject,
      type: q.type,
      stimulus_title: q.stimulusTitle || '',
      stimulus_text: q.stimulusText || '',
      stimulus_image_url: q.stimulusImageUrl || '',
      question_prompt: q.questionPrompt,
      option_a: optMap['option_a'] || '',
      option_b: optMap['option_b'] || '',
      option_c: optMap['option_c'] || '',
      option_d: optMap['option_d'] || '',
      option_e: optMap['option_e'] || '',
      correct_answer: correct,
      matching_pairs: matchingStr,
      true_false_items: tfStr,
      points: q.points,
      fast_trick: q.fastTrick || '',
      explanation: q.explanation || ''
    };
  });

  const csv = Papa.unparse(rows, { quotes: true, header: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', customFilename || `bank_soal_tka_airabimbel_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseQuestionsFromCSV(csvString: string): {
  success: boolean;
  questions: Question[];
  errors: string[];
} {
  try {
    const cleanCsv = String(csvString || '').replace(/^\\uFEFF/, '');
    const parsed = Papa.parse<Record<string, string>>(cleanCsv, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.replace(/^\\uFEFF/, '').trim().toLowerCase(),
      transform: (value) => typeof value === 'string' ? value.trim() : value
    });

    const questions: Question[] = [];
    const errors: string[] = (parsed.errors || []).map(e => `Baris ${(e.row ?? 0) + 2}: ${e.message}`);
    if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
      return { success: false, questions: [], errors: ['Header CSV tidak ditemukan. Unduh template terbaru dari dashboard admin.'] };
    }
    const requiredHeaders = ['question_prompt'];
    const missingHeaders = requiredHeaders.filter(header => !parsed.meta.fields?.includes(header) && !parsed.meta.fields?.includes('prompt'));
    if (missingHeaders.length) {
      return { success: false, questions: [], errors: [`Kolom wajib tidak ditemukan: ${missingHeaders.join(', ')}.`] };
    }

    parsed.data.forEach((row: any, idx: number) => {
      const lineNum = idx + 2;
      const grade = String(row.grade || 'SMA').toUpperCase().trim() as 'SD' | 'SMP' | 'SMA';
      const type = String(row.type || 'pilihan_ganda').trim().toLowerCase() as QuestionType;
      const validGrades = ['SD', 'SMP', 'SMA'];
      const validTypes = ['pilihan_ganda', 'pilihan_ganda_kompleks', 'menjodohkan', 'benar_salah'];
      if (!validGrades.includes(grade)) errors.push(`Baris ${lineNum}: grade "${grade}" tidak dikenal; digunakan SMA.`);
      if (!validTypes.includes(type)) errors.push(`Baris ${lineNum}: tipe soal "${type}" tidak dikenal; digunakan pilihan_ganda.`);
      const subject = (row.subject || 'Penalaran TKA').trim();
      const prompt = (row.question_prompt || row.prompt || '').trim();

      if (!prompt) {
        errors.push(`Baris ${lineNum}: Kolom 'question_prompt' tidak boleh kosong.`);
        return;
      }

      const qId = `q_import_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`;

      // Options builder
      const options = [
        { id: `${qId}_opt_a`, label: 'A', text: (row.option_a || '').trim() },
        { id: `${qId}_opt_b`, label: 'B', text: (row.option_b || '').trim() },
        { id: `${qId}_opt_c`, label: 'C', text: (row.option_c || '').trim() },
        { id: `${qId}_opt_d`, label: 'D', text: (row.option_d || '').trim() },
        { id: `${qId}_opt_e`, label: 'E', text: (row.option_e || '').trim() }
      ].filter(o => o.text.length > 0);

      // Correct answer resolution
      const correctRaw = (row.correct_answer || 'A').toUpperCase().trim();
      let correctOptionId: string | undefined = undefined;
      const correctOptionIds: string[] = [];

      if (type === 'pilihan_ganda') {
        const matched = options.find(o => o.label === correctRaw);
        correctOptionId = matched ? matched.id : options[0]?.id;
      } else if (type === 'pilihan_ganda_kompleks') {
        const correctLabels = correctRaw.split(/[,;\s]+/).map((s: string) => s.trim());
        options.forEach(o => {
          if (correctLabels.includes(o.label)) {
            correctOptionIds.push(o.id);
          }
        });
        if (correctOptionIds.length === 0 && options[0]) {
          correctOptionIds.push(options[0].id);
        }
      }

      // Matching pairs builder: "A:1 | B:2"
      let matchingPairs: any[] | undefined = undefined;
      if (type === 'menjodohkan') {
        const rawMatching = (row.matching_pairs || '').trim();
        if (rawMatching) {
          matchingPairs = rawMatching.split('|').map((pairStr: string, pIdx: number) => {
            const separator = pairStr.indexOf(':');
            const l = separator >= 0 ? pairStr.slice(0, separator) : pairStr;
            const r = separator >= 0 ? pairStr.slice(separator + 1) : '';
            return {
              id: `${qId}_m_${pIdx}`,
              left: (l || `Premis ${pIdx + 1}`).trim(),
              right: (r || `Pasangan ${pIdx + 1}`).trim()
            };
          });
        }
      }

      // True / False builder: "Stat 1:BENAR | Stat 2:SALAH"
      let trueFalseItems: any[] | undefined = undefined;
      if (type === 'benar_salah') {
        const rawTF = (row.true_false_items || '').trim();
        if (rawTF) {
          trueFalseItems = rawTF.split('|').map((itemStr: string, tfIdx: number) => {
            const separator = itemStr.lastIndexOf(':');
            const stat = separator >= 0 ? itemStr.slice(0, separator) : itemStr;
            const val = separator >= 0 ? itemStr.slice(separator + 1) : '';
            const isTrue = ['BENAR', 'TRUE', '1', 'YA'].includes((val || '').trim().toUpperCase());
            return {
              id: `${qId}_tf_${tfIdx}`,
              statement: (stat || `Pernyataan ${tfIdx + 1}`).trim(),
              isTrue
            };
          });
        }
      }

      const q: Question = {
        id: qId,
        grade: ['SD', 'SMP', 'SMA'].includes(grade) ? grade : 'SMA',
        subject,
        type: ['pilihan_ganda', 'pilihan_ganda_kompleks', 'menjodohkan', 'benar_salah'].includes(type)
          ? type
          : 'pilihan_ganda',
        stimulusTitle: (row.stimulus_title || '').trim(),
        stimulusText: (row.stimulus_text || '').trim(),
        stimulusImageUrl: (row.stimulus_image_url || '').trim(),
        questionPrompt: prompt,
        options: options.length > 0 ? options : undefined,
        correctOptionId,
        correctOptionIds: correctOptionIds.length > 0 ? correctOptionIds : undefined,
        matchingPairs,
        trueFalseItems,
        points: Number(row.points) || 20,
        fastTrick: (row.fast_trick || '').trim(),
        explanation: (row.explanation || 'Pembahasan telah disediakan oleh Aira Bimbel.').trim()
      };

      questions.push(q);
    });

    return {
      success: questions.length > 0,
      questions,
      errors: questions.length === 0 && errors.length === 0 ? ['Tidak ada soal valid di dalam file CSV.'] : errors
    };
  } catch (err: any) {
    return {
      success: false,
      questions: [],
      errors: [err.message || 'Gagal memproses file CSV']
    };
  }
}
