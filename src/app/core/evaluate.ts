
import { Result, Recommendation, MaturityLevel } from './models';

interface EvalCtx {
  answers: Record<string, string | string[]>;
}

// Likert score: gar-nicht=1, weniger=2, mehr=3, voll=4; 0 if unanswered
function s(answer: string | string[] | undefined): number {
  if (!answer) return 0;
  const a = Array.isArray(answer) ? answer[0] : answer;
  if (a === 'voll')     return 4;
  if (a === 'mehr')     return 3;
  if (a === 'weniger')  return 2;
  if (a === 'gar-nicht') return 1;
  return 0;
}

// Inverted score for negatively-worded questions (q08: "wir testen alles manuell")
function inv(answer: string | string[] | undefined): number {
  const sc = s(answer);
  return sc === 0 ? 0 : 5 - sc;
}

/**
 * Questionnaire dimensions (all Likert scale, higher = better except q08):
 *   q01 – Klarer Überblick über Teststand            (Transparenz)
 *   q02 – Frühzeitige Erkennung von Steuerungsbedarf (Früherkennung)
 *   q03 – Produkt erfüllt Erwartungen                (Produktqualität)
 *   q04 – Keine/kaum Fehler in Produktion            (Produktionsqualität)
 *   q05 – Klare Aufgabenverantwortung im Test        (Rollen)
 *   q06 – Klare Rollen im Projekt                    (Rollen)
 *   q07 – Dokumentierter, einsehbarer Testprozess    (Dokumentation)
 *   q08 – Alles manuell getestet (n)                 (INVERTIERT – manuell = schlecht)
 *   q09 – Systematische Testfall-Unterstützung        (Systematik)
 *   q10 – Positiver Arbeitsaufwand                   (Teambefinden)
 *   q11 – Motivation & Engagement                    (Teambefinden)
 */
export function computeRecommendation(ctx: EvalCtx): Result {
  const a = ctx.answers;

  // --- Recommendation scores ---
  // Each driven by 3 most relevant dimensions (max 12 points each)
  const score: Record<Recommendation, number> = {
    'V-Model':
      s(a['q07']) + s(a['q01']) + s(a['q06']),           // Dokumentation + Transparenz + Rollen

    'Agile Testing':
      s(a['q02']) + s(a['q05']) + s(a['q11']),            // Früherkennung + Ownership + Motivation

    'Risk-Based Testing':
      inv(a['q04']) + inv(a['q03']) + inv(a['q02']),       // Qualitätsprobleme → Risikofokus

    'Exploratory Testing':
      s(a['q08']) + inv(a['q09']) + inv(a['q07']),         // Viel manuell + keine Tools + kein Prozess

    'Continuous Testing':
      s(a['q09']) + inv(a['q08']) + s(a['q01']),           // Tools + Automatisierung + Transparenz
  };

  const top = (Object.entries(score)
    .sort((x, y) => y[1] - x[1])[0] ?? ['Exploratory Testing'])[0] as Recommendation;

  // --- Rationale ---
  const rationale = (() => {
    switch (top) {
      case 'V-Model':
        return 'Ihr Testprozess weist klare Strukturen auf. Ein V-Modell-Ansatz mit dokumentierten Phasen und definierten Rollen würde Ihre vorhandenen Stärken optimal nutzen und absichern.';
      case 'Agile Testing':
        return 'Ihr Team ist gut aufgestellt und erkennt Probleme früh. Agile Testing-Praktiken helfen, Qualitätssicherung kontinuierlich und eng verzahnt mit der Entwicklung zu betreiben.';
      case 'Risk-Based Testing':
        return 'Es bestehen Qualitätslücken oder Fehler in Produktion. Risikobasiertes Testen ermöglicht es, Ressourcen gezielt auf die kritischsten Bereiche zu konzentrieren und schnell Wirkung zu erzielen.';
      case 'Exploratory Testing':
        return 'Der Testprozess ist noch wenig formalisiert. Exploratives Testen ermöglicht schnelle Erkenntnisse ohne aufwändige Vorbereitung und ist ein guter erster Schritt zu mehr Testqualität.';
      case 'Continuous Testing':
        return 'Vorhandene Testwerkzeuge und Automatisierungsansätze bieten eine gute Basis. Continuous Testing integriert Qualitätssicherung nahtlos in Ihre Entwicklungspipeline.';
    }
  })();

  // --- Maturity score (0–44; q08 inverted) ---
  const maturityScore =
    s(a['q01']) + s(a['q02']) + s(a['q03']) + s(a['q04']) +
    s(a['q05']) + s(a['q06']) + s(a['q07']) + inv(a['q08']) +
    s(a['q09']) + s(a['q10']) + s(a['q11']);

  // Thresholds: ≥35 gut (80%), 20–34 ausbaufaehig, <20 minimal
  const maturity: MaturityLevel =
    maturityScore >= 35 ? 'gut' :
    maturityScore >= 20 ? 'ausbaufaehig' :
    'minimal';

  // --- Dimension scores (what the questions actually measure) ---
  const dimensionScores: Record<string, { val: number; max: number }> = {
    'Test-Transparenz':       { val: s(a['q01']) + s(a['q02']),       max: 8 },
    'Qualität & Fehlerrate':  { val: s(a['q03']) + s(a['q04']),       max: 8 },
    'Rollen & Verantwortung': { val: s(a['q05']) + s(a['q06']),       max: 8 },
    'Prozessreife':           { val: s(a['q07']),                      max: 4 },
    'Automatisierung':        { val: inv(a['q08']) + s(a['q09']),      max: 8 },
    'Team & Motivation':      { val: s(a['q10']) + s(a['q11']),        max: 8 },
  };

  // --- Key pain points (for WARP inbox and result display) ---
  const topFactors: string[] = [];
  if (s(a['q01']) <= 2 && a['q01']) topFactors.push('Fehlende Testtransparenz');
  if (s(a['q02']) <= 2 && a['q02']) topFactors.push('Späte Problemerkennung');
  if (s(a['q04']) <= 2 && a['q04']) topFactors.push('Fehler in Produktion');
  if ((s(a['q05']) <= 2 || s(a['q06']) <= 2) && (a['q05'] || a['q06'])) topFactors.push('Unklare Rollen & Verantwortlichkeiten');
  if (s(a['q07']) <= 2 && a['q07']) topFactors.push('Kein dokumentierter Testprozess');
  if (s(a['q08']) >= 3 && a['q08']) topFactors.push('Hoher manueller Testanteil');
  if (s(a['q09']) <= 2 && a['q09']) topFactors.push('Keine systematische Testunterstützung');

  return { top, scores: score, dimensionScores, rationale, topFactors, maturity };
}
