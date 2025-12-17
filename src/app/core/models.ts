
export type AnswerType = 'single' | 'multi';

export interface ChoiceOption { id: string; label: string; weight?: number; }
export interface Question {
  id: string;
  text: string;
  type: AnswerType;
  required: boolean;
  choices: ChoiceOption[];
  active?: boolean;
  category: 
    'ziele'                  // Hauptziele für Tool-Einführung
  | 'modell'
  | 'kritisch'
  | 'probleme'               // Spezifische Probleme
  | 'qualität'               // Zufriedenheit mit Softwarequalität
  | 'fehlerphase'            // Phase mit den meisten Fehlern
  | 'fehlerquelle'           // Quelle der Fehler
  | 'prozesse'               // Zufriedenheit mit Entwicklungsprozessen
  | 'kritische-bereiche'     // Kritische Geschäftsbereiche
  | 'harmonisierung'         // Harmonisierung von Testprozessen
  | 'entwicklungsmodell'     // Entwicklungsmodell (V-Modell, Agile etc.)
  | 'rollen'                 // Rollen im Testmanagement
  | 'anforderungen-speicherort' // Speicherort der Anforderungen
  | 'abdeckung'              // Testfall-Abdeckung
  | 'verantwortung-testfälle'// Verantwortlichkeiten für Testfälle
  | 'skalierung-performance' // Skalierbarkeit & Performance
  | 'compliance'             // Regulatorische Anforderungen
  | 'integrationen'          // Schnittstellen & Tools
  | 'zugriffsrechte'         // Zugriffsrechte
  | 'betriebsumgebung'       // Online-/Offline-Nutzung
  | 'einführungsstrategie'   // Zentral vs. Teamweise Einführung
  | 'reporting'              // Reporting & Analysefunktionen
  | 'budget';                // Budgetrestriktionen

}

export interface Questionnaire {
  id: string;
  title: string;
  questions: Question[];
}

export type Recommendation =
  | 'V-Model'
  | 'Agile Testing'
  | 'Risk-Based Testing'
  | 'Exploratory Testing'
  | 'Continuous Testing';

export interface Result {
  top: Recommendation;
  scores: Record<Recommendation, number>;
  rationale: string;
}
