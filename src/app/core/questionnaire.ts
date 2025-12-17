
import { Questionnaire } from './models';

export const QUESTIONNAIRE: Questionnaire = {
  id: 'fk-testprozess',
  title: 'Fragenkatalog: Testmanagement-Tool',
  questions: [
    {
      active: false,
      id: 'q01',
      text: 'Was sind die Hauptziele für die Einführung eines Testmanagement-Tools?',
      type: 'multi',
      required: true,
      category: 'ziele',
      choices: [
        { id: 'transparenz', label: 'Transparenz über Teststatus und Ergebnisse' },
        { id: 'effizienz', label: 'Effizienzsteigerung im Testprozess' },
        { id: 'nachverfolgung', label: 'Bessere Nachverfolgbarkeit von Anforderungen und Defekten' },
        { id: 'automatisierung', label: 'Höhere Automatisierungsquote' },
        { id: 'standards', label: 'Einheitliche Standards und Prozesse' }
      ]
    },
    {
      active: true,
      id: 'q02',
      text: 'Welche spezifischen Probleme möchten Sie adressieren?',
      type: 'multi',
      required: true,
      category: 'probleme',
      choices: [
        { id: 'fehlende-uebersicht', label: 'Fehlende Übersicht über Testfortschritt' },
        { id: 'manueller-aufwand', label: 'Hoher manueller Aufwand' },
        { id: 'kommunikation', label: 'Unzureichende Kommunikation zwischen Teams' },
        { id: 'nachvollziehbarkeit', label: 'Schlechte Nachvollziehbarkeit von Anforderungen' },
        { id: 'integration', label: 'Mangelnde Integration mit anderen Tools' }
      ]
    },
    {
      active: true,
      id: 'q03',
      text: 'Sind Sie mit dem aktuellen Stand Ihrer Softwarequalität zufrieden?',
      type: 'single',
      required: true,
      category: 'qualität',
      choices: [
        { id: 'sehr-zufrieden', label: 'Sehr zufrieden' },
        { id: 'zufrieden', label: 'Zufrieden' },
        { id: 'neutral', label: 'Neutral' },
        { id: 'unzufrieden', label: 'Unzufrieden' },
        { id: 'sehr-unzufrieden', label: 'Sehr unzufrieden' }
      ]
    },
    {
      active: true,
      id: 'q04',
      text: 'In welchem Teil des Testprozesses identifizieren Sie die meisten Fehler?',
      type: 'single',
      required: true,
      category: 'fehlerphase',
      choices: [
        { id: 'funktionstest', label: 'Funktionstest' },
        { id: 'integrationstest', label: 'Integrationstest' },
        { id: 'systemtest', label: 'Systemtest' },
        { id: 'abnahmetest', label: 'Abnahmetest' },
        { id: 'performance', label: 'Performance-/Lasttest' }
      ]
    },
    {
      active: true,
      id: 'q05',
      text: 'Woher stammen die meisten Fehler?',
      type: 'single',
      required: true,
      category: 'fehlerquelle',
      choices: [
        { id: 'anforderungen', label: 'Anforderungen' },
        { id: 'quellcode', label: 'Quellcode' },
        { id: 'konfiguration', label: 'Konfiguration' },
        { id: 'schnittstellen', label: 'Schnittstellen' },
        { id: 'datenmigration', label: 'Datenmigration' }
      ]
    },
    {
      active: true,
      id: 'q06',
      text: 'Sind Sie mit Ihren aktuellen Entwicklungsprozessen zufrieden?',
      type: 'single',
      required: true,
      category: 'prozesse',
      choices: [
        { id: 'sehr-zufrieden', label: 'Sehr zufrieden' },
        { id: 'zufrieden', label: 'Zufrieden' },
        { id: 'neutral', label: 'Neutral' },
        { id: 'unzufrieden', label: 'Unzufrieden' },
        { id: 'sehr-unzufrieden', label: 'Sehr unzufrieden' }
      ]
    },
    {
      active: true,
      id: 'q07',
      text: 'Welche Geschäftsbereiche oder Prozesse sind am kritischsten?',
      type: 'multi',
      required: true,
      category: 'kritisch',
      choices: [
        { id: 'kernprozesse', label: 'Kernprozesse (z. B. Vertragsverwaltung)' },
        { id: 'zahlung', label: 'Zahlungsprozesse' },
        { id: 'reporting', label: 'Reporting/Analytics' },
        { id: 'kundenservice', label: 'Kundenservice' },
        { id: 'compliance', label: 'Compliance-relevante Prozesse' }
      ]
    },
    {
      active: true,
      id: 'q08',
      text: 'Gibt es bestehende Testprozesse oder Standards, die harmonisiert werden sollten?',
      type: 'single',
      required: true,
      category: 'harmonisierung',
      choices: [
        { id: 'unternehmensweit', label: 'Ja, unternehmensweit' },
        { id: 'abteilungen', label: 'Ja, innerhalb bestimmter Abteilungen' },
        { id: 'nein', label: 'Nein, alles ist bereits harmonisiert' },
        { id: 'teilweise', label: 'Teilweise, aber nicht priorisiert' },
        { id: 'unklar', label: 'Unklar' }
      ]
    },
    {
      active: true,
      id: 'q09',
      text: 'Mit welchen Softwareentwicklungsmodellen arbeiten Sie?',
      type: 'single',
      required: true,
      category: 'modell',
      choices: [
        { id: 'v-modell', label: 'V-Modell' },
        { id: 'wasserfall', label: 'Wasserfall' },
        { id: 'agile', label: 'Agile (Scrum/Kanban)' },
        { id: 'hybrid', label: 'Hybrid' },
        { id: 'sonstige', label: 'Sonstige' }
      ]
    },
    {
      active: true,
      id: 'q10',
      text: 'Welche Rollen und Verantwortlichkeiten gibt es im Testmanagement?',
      type: 'multi',
      required: true,
      category: 'rollen',
      choices: [
        { id: 'testmanager', label: 'Testmanager' },
        { id: 'tester', label: 'Tester' },
        { id: 'entwickler', label: 'Entwickler' },
        { id: 'po', label: 'Product Owner' },
        { id: 'ba', label: 'Business Analyst' }
      ]
    },
    {
      active: true,
      id: 'q11',
      text: 'Wo werden die Geschäftsanforderungen derzeit gespeichert?',
      type: 'single',
      required: true,
      category: 'anforderungen-speicherort',
      choices: [
        { id: 'jira', label: 'Jira' },
        { id: 'confluence', label: 'Confluence' },
        { id: 'excel', label: 'Excel' },
        { id: 'dms', label: 'Dokumentenmanagement-System' },
        { id: 'other', label: 'Sonstige' }
      ]
    },
    // 12
    {
      active: true,
      id: 'q12',
      text: 'Wie gut sind die Geschäftsanforderungen durch Testfälle abgedeckt?',
      type: 'single',
      required: true,
      category: 'abdeckung',
      choices: [
        { id: 'gt90', label: 'Sehr gut (>90%)' },
        { id: '70-90', label: 'Gut (70–90%)' },
        { id: '50-70', label: 'Mittel (50–70%)' },
        { id: 'lt50', label: 'Schlecht (<50%)' },
        { id: 'unclear', label: 'Unklar' }
      ]
    },
    // 13
    {
      active: true,
      id: 'q13',
      text: 'Gibt es verbindliche Verantwortlichkeiten für die Definition von Testfällen?',
      type: 'single',
      required: true,
      category: 'verantwortung-testfälle',
      choices: [
        { id: 'defined', label: 'Ja, klar definiert' },
        { id: 'partly', label: 'Teilweise definiert' },
        { id: 'not-defined', label: 'Nein, nicht geregelt' },
        { id: 'in-progress', label: 'Wird aktuell erarbeitet' },
        { id: 'unclear', label: 'Unklar' }
      ]
    },
    // 14
    {
      active: true,
      id: 'q14',
      text: 'Welche Skalierbarkeits- und Performance-Anforderungen muss das Tool erfüllen?',
      type: 'multi',
      required: true,
      category: 'skalierung-performance',
      choices: [
        { id: 'multi-team', label: 'Unterstützung für mehrere Teams' },
        { id: 'high-data', label: 'Hohe Datenmengen verarbeiten' },
        { id: 'fast-load', label: 'Schnelle Ladezeiten' },
        { id: 'cloud-onprem', label: 'Cloud- und On-Premise-Optionen' },
        { id: 'multi-project', label: 'Multi-Projektfähigkeit' }
      ]
    },
    // 15
    {
      active: true,
      id: 'q15',
      text: 'Welche regulatorischen oder Compliance-Anforderungen müssen berücksichtigt werden?',
      type: 'multi',
      required: true,
      category: 'compliance',
      choices: [
        { id: 'gdpr', label: 'DSGVO' },
        { id: 'iso27001', label: 'ISO 27001' },
        { id: 'internal-security', label: 'Interne Sicherheitsrichtlinien' },
        { id: 'industry-standards', label: 'Branchenstandards (z. B. BaFin)' },
        { id: 'none', label: 'Keine besonderen Anforderungen' }
      ]
    },
    // 16
    {
      active: true,
      id: 'q16',
      text: 'Mit welchen anderen Tools oder Schnittstellen soll es verbunden werden?',
      type: 'multi',
      required: true,
      category: 'integrationen',
      choices: [
        { id: 'cicd', label: 'CI/CD-Pipelines' },
        { id: 'automation-tools', label: 'Automatisierungstools (z. B. Selenium)' },
        { id: 'databases', label: 'Datenbanken' },
        { id: 'reporting-tools', label: 'Reporting-Tools' },
        { id: 'other', label: 'Sonstige' }
      ]
    },
    // 17
    {
      active: true,
      id: 'q17',
      text: 'Gibt es besondere Zugriffsrechte, die berücksichtigt werden müssen?',
      type: 'multi',
      required: true,
      category: 'zugriffsrechte',
      choices: [
        { id: 'rbac', label: 'Rollenbasierte Rechte' },
        { id: 'by-project', label: 'Zugriff nach Projekt' },
        { id: 'by-department', label: 'Zugriff nach Abteilung' },
        { id: 'external-users', label: 'Externe Nutzer berücksichtigen' },
        { id: 'no-special', label: 'Keine besonderen Anforderungen' }
      ]
    },
    // 18
    {
      active: true,
      id: 'q18',
      text: 'Wird das Tool in einer sicheren Umgebung mit eingeschränktem Online-Zugang eingesetzt?',
      type: 'single',
      required: true,
      category: 'betriebsumgebung',
      choices: [
        { id: 'offline', label: 'Ja, komplett offline' },
        { id: 'restricted', label: 'Ja, eingeschränkter Zugang' },
        { id: 'online', label: 'Nein, volle Online-Nutzung' },
        { id: 'hybrid', label: 'Hybrid' },
        { id: 'unclear', label: 'Unklar' }
      ]
    },
    // 19
    {
      active: true,
      id: 'q19',
      text: 'Soll das Tool separat für jedes Team eingeführt werden oder zentral?',
      type: 'single',
      required: true,
      category: 'einführungsstrategie',
      choices: [
        { id: 'per-team', label: 'Separat pro Team' },
        { id: 'central', label: 'Zentral für alle Teams' },
        { id: 'mixed', label: 'Mischform' },
        { id: 'not-decided', label: 'Noch nicht entschieden' },
        { id: 'unclear', label: 'Unklar' }
      ]
    },
    // 20
    {
      active: true,
      id: 'q20',
      text: 'Wie stellen Sie sich die Reporting- und Analysefunktionen vor?',
      type: 'multi',
      required: true,
      category: 'reporting',
      choices: [
        { id: 'standard-reports', label: 'Standardberichte' },
        { id: 'custom-dashboards', label: 'Individuell anpassbare Dashboards' },
        { id: 'realtime', label: 'Echtzeit-Reporting' },
        { id: 'export', label: 'Export in verschiedene Formate' },
        { id: 'kpi-tracking', label: 'KPI-Tracking' }
      ]
    },
    // 21
    {
      active: true,
      id: 'q21',
      text: 'Gibt es Kosten- oder Budgetbeschränkungen?',
      type: 'single',
      required: true,
      category: 'budget',
      choices: [
        { id: 'very-restrictive', label: 'Ja, sehr restriktiv' },
        { id: 'moderate', label: 'Ja, moderat' },
        { id: 'flexible', label: 'Nein, flexibel' },
        { id: 'not-defined', label: 'Noch nicht definiert' },
        { id: 'unclear', label: 'Unklar' }
      ]
    }
  ]
};
