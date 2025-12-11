import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QUESTIONNAIRE } from '../core/questionnaire';

@Component({
  standalone: true,
  selector: 'app-question',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  template: `
  <div class="container">
    <div class="progress">
      <mat-progress-bar mode="determinate" [value]="progress()"></mat-progress-bar>
      <small>Frage {{ index()+1 }} von {{ total }}</small>
    </div>

    <div class="card">
      <h2>{{ q().text }}</h2>

      <div class="options">
        <button
          *ngFor="let c of q().choices"
          class="option"
          mat-stroked-button
          (click)="toggle(c.id)"
          [class.active]="isSelected(c.id)">
          {{ c.label }}
        </button>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="next()" [disabled]="selected().length === 0">Weiter</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .progress { margin: 8px 0 12px; }
    .options { display: grid; gap: 12px; }
    .option { 
      justify-content: flex-start; 
      padding: 12px 16px; 
      border-radius: 12px;
      transition: all 0.2s ease;
    }
    .option.active { 
      background-color: rgba(69, 29, 199, 0.8);
      color: white;
      border-color: #451DC7;
    }
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; }
    ::ng-deep .mat-mdc-progress-bar-fill::after { background-color: #451DC7 !important; }
    ::ng-deep .mdc-linear-progress__bar-inner { background-color: #451DC7 !important; }
    ::ng-deep .mat-mdc-raised-button[color="primary"] { background-color: #451DC7 !important; }
  `]
})
export class QuestionComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  total = QUESTIONNAIRE.questions.length;
  index = signal<number>(0);
  selected = signal<string[]>([]);

  // Fragen, die nur Single-Choice (eine Antwort sinnvoll) erlauben (1-basiert)
  singleChoiceQuestions = new Set<number>([3,6,8,9,12,13,18,19,21]);

  q = computed(() => QUESTIONNAIRE.questions[this.index()]);

  constructor() {
    this.route.paramMap.subscribe(p => {
      const i = Number(p.get('index') ?? 0);
      this.index.set(Math.max(0, Math.min(i, this.total - 1)));
      this.selected.set(loadAnswers(this.index()));
    });
  }

  isSelected(choiceId: string): boolean {
    return this.selected().includes(choiceId);
  }

  toggle(choiceId: string) {
    const current = this.selected();
    const qNum = this.index() + 1; // 1-based Frage-Nummer

    if (this.singleChoiceQuestions.has(qNum)) {
      // Single-Choice: Auswahl ersetzt vorherige Auswahl
      if (current.includes(choiceId)) {
        this.selected.set([]);
      } else {
        this.selected.set([choiceId]);
      }
    } else {
      // Mehrfachauswahl: Verhalten wie bisher
      if (current.includes(choiceId)) {
        this.selected.set(current.filter(id => id !== choiceId));
      } else {
        this.selected.set([...current, choiceId]);
      }
    }

    saveAnswers(this.index(), this.selected());
  }

  next() {
    const currentNum = this.index() + 1; // 1-based Frage-Nummer
    const nextIndex = this.index() + 1;

    // Nach Frage 21: direkt zur Ergebnisseite
    if (currentNum >= 21) {
      this.router.navigate(['/ergebnis']);
      return;
    }

    if (nextIndex < this.total) this.router.navigate(['/frage', nextIndex]);
    else this.router.navigate(['/ergebnis']);
  }

  progress = computed(() => (this.index()+1) / this.total * 100);
}

/* --- einfache LocalStorage-Persistenz --- */
const KEY = 'fk_answers_v1';
function loadAll(): Record<string, string[]> {
  return JSON.parse(localStorage.getItem(KEY) ?? '{}');
}
function saveAll(data: Record<string, string[]>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function saveAnswers(index: number, choiceIds: string[]) {
  const qid = QUESTIONNAIRE.questions[index].id;
  const all = loadAll(); all[qid] = choiceIds; saveAll(all);
}
function loadAnswers(index: number): string[] {
  const qid = QUESTIONNAIRE.questions[index].id;
  const all = loadAll(); return all[qid] ?? [];
}
