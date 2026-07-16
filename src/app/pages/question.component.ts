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
  <div class="page">
    <div class="card">

      <!-- Fortschrittsindikator -->
      <div class="progress-header">
        <span class="progress-label">Frage {{ index()+1 }} von {{ total() }}</span>
        <span class="progress-pct">{{ progress() | number:'1.0-0' }}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="progress()"></div>
      </div>

      <h2>{{ q().text }}</h2>

      <div class="options">
        <button
          *ngFor="let c of q().choices"
          class="option"
          (click)="toggle(c.id)"
          [class.active]="isSelected(c.id)">
          {{ c.label }}
        </button>
      </div>

      <div class="actions">
        <button class="next-btn" (click)="next()" [disabled]="!selected()">Weiter →</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 28px 28px 24px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .progress-label {
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #888;
    }
    .progress-pct {
      font-size: .72rem;
      font-weight: 700;
      color: #451DC7;
    }
    .progress-track {
      height: 6px;
      background: #e5e7eb;
      border-radius: 99px;
      overflow: hidden;
      margin-bottom: 22px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #451DC7, #2d9e6b);
      border-radius: 99px;
      transition: width .35s ease;
    }

    h2 { font-size: 1.15rem; font-weight: 700; margin: 0 0 20px; color: #111; line-height: 1.4; }

    .options { display: grid; gap: 10px; }
    .option {
      width: 100%;
      text-align: left;
      padding: 13px 16px;
      border-radius: 10px;
      border: 1.5px solid #e5e7eb;
      background: #fff;
      font-size: .92rem;
      color: #333;
      cursor: pointer;
      transition: border-color .15s, background .15s, color .15s;
    }
    .option:hover { border-color: #c4b5fd; background: #faf8ff; }
    .option.active { background: #451DC7; color: #fff; border-color: #451DC7; }

    .actions { margin-top: 20px; display: flex; justify-content: flex-end; }
    .next-btn {
      background: #451DC7; color: #fff; border: none;
      border-radius: 10px; padding: 12px 28px;
      font-size: .95rem; font-weight: 700; cursor: pointer;
      transition: background .15s;
    }
    .next-btn:hover:not(:disabled) { background: #3a17a8; }
    .next-btn:disabled { background: #c4b5fd; cursor: not-allowed; }
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
