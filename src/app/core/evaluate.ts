
import { Result, Recommendation } from './models';

interface EvalCtx {
  answers: Record<string, string | string[]>;
}

/**
 * Heuristik:
 * - Compliance hoch -> +V-Model, +Risk-Based
 * - Agiles Umfeld -> +Agile, +Continuous
 * - Hohe Unsicherheit -> +Exploratory, +Risk-Based
 * - Hoher Automatisierungsgrad/CI -> +Continuous
 * - Großes Team, klare Anforderungen -> +V-Model
 */
export function computeRecommendation(ctx: EvalCtx): Result {
  const score: Record<Recommendation, number> = {
    'V-Model': 0,
    'Agile Testing': 0,
    'Risk-Based Testing': 0,
    'Exploratory Testing': 0,
    'Continuous Testing': 0
  };

  const prozess = ctx.answers['q01'];
  if (prozess === 'classic') score['V-Model'] += 3;
  if (prozess === 'agile')   score['Agile Testing'] += 3, score['Continuous Testing'] += 2;
  if (prozess === 'hybrid')  score['Agile Testing'] += 1, score['V-Model'] += 1;

  const compliance = ctx.answers['q02'];
  if (compliance === 'high') score['V-Model'] += 3, score['Risk-Based Testing'] += 2;
  if (compliance === 'mid')  score['Risk-Based Testing'] += 1;

  const req = ctx.answers['q03'];
  if (req === 'uncertain') score['Exploratory Testing'] += 3, score['Risk-Based Testing'] += 2;
  if (req === 'partial')   score['Exploratory Testing'] += 1;

  // Beispiel für weitere Signale:
  const team = ctx.answers['q08']; // z.B. "1-2", "3-5", "6-10", "10+"
  if (team === '10+') score['V-Model'] += 2;
  if (team === '1-2') score['Exploratory Testing'] += 1;

  const ci = ctx.answers['q12']; // "ci-on", "ci-off"
  if (ci === 'ci-on') score['Continuous Testing'] += 3;

  // ... ergänze weitere Regeln analog (Risiko, Testdatenverfügbarkeit, Automatisierung usw.)

  const top = (Object.entries(score).sort((a,b) => b[1] - a[1])[0] ?? ['Exploratory Testing'])[0] as Recommendation;

  const rationale = (() => {
    switch (top) {
      case 'V-Model':
        return 'Strukturiertes, phasenorientiertes Vorgehen mit starker Dokumentation – geeignet bei hoher Regulierung, klaren Anforderungen und größeren Teams.';
      case 'Agile Testing':
        return 'Inkrementelles Testen in Sprints, frühes Feedback, enge Zusammenarbeit – ideal für agile Projekte mit dynamischen Anforderungen.';
      case 'Risk-Based Testing':
        return 'Fokus auf risikoreiche Bereiche, priorisierte Testfälle – sinnvoll bei knappen Ressourcen und hoher Kritikalität.';
      case 'Exploratory Testing':
        return 'Lern- & hypothesengetriebenes Vorgehen, wertvoll bei hoher Unsicherheit und frühem Produktreifegrad.';
      case 'Continuous Testing':
        return 'Durchgängiges Testen im CI/CD, Automatisierung, schnelle Feedback-Loops – optimal für DevOps-Umgebungen.';
    }
  })();

  return { top, scores: score, rationale };
}
