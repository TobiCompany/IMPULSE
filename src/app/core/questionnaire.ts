
import { Questionnaire } from './models';

export const QUESTIONNAIRE: Questionnaire = {
  id: 'fk-testprozess',
  title: 'Fragenkatalog: Testmanagement-Tool',
  questions: [
    {
      active: true,
      id: 'q01',
      text: 'Wir haben jederzeit einen klaren Überblick über den aktuellen Stand im Test',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q02',
      text: 'Wir können schon frühzeitig erkennen, ob wir im Testprozess steuernd eingreifen müssen',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q03',
      text: 'Unser Produkt wird unseren Erwartungen / den Kundenerwartungen immer gerecht',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q04',
      text: 'Es treten keine oder fast keine Fehler in Produktion auf',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q05',
      text: 'Es ist jederzeit klar, wer im Testprozess welche Aufgabe übernimmt',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q06',
      text: 'In unserem Projekt sind Aufgaben / Rollen klar definiert',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q07',
      text: 'Unser Testprozess folgt klaren Richtlinien, die Niedergeschrieben und einsehbar sind',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q08',
      text: 'Wir testen in unserem Projekt alles manuell (n)',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q09',
      text: 'Wir nutzen Tools oder Schemata, die uns bei der Testfallerstellung systematisch unterstützen',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q10',
      text: 'Alle Mitarbeiter im Projekt äußern sich positiv über ihren Arbeitsaufwand',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    },
    {
      active: true,
      id: 'q11',
      text: 'Alle Projektbeteiligten sind stets motiviert und engagiert bei der Sache',
      type: 'single',
      required: true,
      category: 'zustimmung',
      choices: [
        { id: 'gar-nicht', label: 'stimmt gar nicht zu' },
        { id: 'weniger', label: 'stimmt weniger zu' },
        { id: 'mehr', label: 'stimmt mehr zu' },
        { id: 'voll', label: 'stimmt voll zu' }
      ]
    }
  ]
};
