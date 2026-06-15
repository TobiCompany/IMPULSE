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
      <small>Frage {{ index()+1 }} von {{ total() }}</small>
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
        <button mat-raised-button color="primary" (click)="next()" [disabled]="!selected()">Weiter</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .progress { margin: 8px 0 12px; }
    .options { 
      display: grid; 
      gap: 12px; 
      min-height: 200px; 
    }
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

  index = signal<number>(0);
  selected = signal<string>('');

  // Sichtbare Fragen (nur active === true). Falls "active" fehlt, wird die Frage angezeigt.
  visibleQuestions = computed(() => QUESTIONNAIRE.questions.filter(q => (q as any).active !== false));

  // Anzahl sichtbarer Fragen
  total = computed(() => this.visibleQuestions().length);

  q = computed(() => this.visibleQuestions()[this.index()]);

  constructor() {
    this.route.paramMap.subscribe(p => {
      const i = Number(p.get('index') ?? 0);
      const clamped = Math.max(0, Math.min(i, this.total()-1));
      this.index.set(clamped);

      const qObj = this.visibleQuestions()[this.index()];
      this.selected.set(qObj ? loadAnswerById(qObj.id) : '');
    });
  }

  isSelected(choiceId: string): boolean {
    return this.selected() === choiceId;
  }

  toggle(choiceId: string) {
    const current = this.selected();
    const qObj = this.visibleQuestions()[this.index()];

    if (qObj.type === 'single') {
      if (current === choiceId) {
        this.selected.set('');
      } else {
        this.selected.set(choiceId);
      }
    } else {
      // Für multi, aber da alle single sind, nicht relevant
      // Aber lassen wir es für zukünftige Erweiterungen
    }

    if (qObj) saveAnswerById(qObj.id, this.selected());
  }

  next() {
    const nextIndex = this.index() + 1;
    if (nextIndex < this.total()) this.router.navigate(['/frage', nextIndex]);
    else this.router.navigate(['/kontakt']);
  }

  progress = computed(() => (this.index()+1) / Math.max(1, this.total()) * 100);
}

/* --- einfache LocalStorage-Persistenz --- */
const KEY = 'fk_answers_v1';
function loadAll(): Record<string, string> {
  return JSON.parse(localStorage.getItem(KEY) ?? '{}');
}
function saveAll(data: Record<string, string>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function saveAnswerById(qid: string, choiceId: string) {
  const all = loadAll(); all[qid] = choiceId; saveAll(all);
}
function loadAnswerById(qid: string): string {
  const all = loadAll(); return all[qid] ?? '';
}
