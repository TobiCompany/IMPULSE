
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { computeRecommendation } from '../core/evaluate';
import { QUESTIONNAIRE } from '../core/questionnaire';

const ANSWERS_KEY = 'fk_answers_v1';
const USER_KEY = 'fk_user_data';

function loadAnswers(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  return JSON.parse(localStorage.getItem(ANSWERS_KEY) ?? '{}');
}

function loadUserData(): { name: string; email: string } {
  if (typeof localStorage === 'undefined') return { name: '', email: '' };
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : { name: '', email: '' };
  } catch {
    return { name: '', email: '' };
  }
}

export function saveAnswer(index: number, choiceId: string) {
  if (typeof localStorage === 'undefined') return;
  const qid = QUESTIONNAIRE.questions[index].id;
  const all = loadAnswers();
  all[qid] = choiceId;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(all));
}

export function loadAnswer(index: number): string | null {
  if (typeof localStorage === 'undefined') return null;
  return loadAnswers()[QUESTIONNAIRE.questions[index].id] ?? null;
}

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  template: `
  <div class="container">
    <div class="card">
      <h2 *ngIf="!sent() && !error()">Ihre Antworten werden übermittelt</h2>
      <h2 *ngIf="sent()">Vielen Dank &mdash; Ergebnisse versendet</h2>
      <h2 *ngIf="error()">Übermittlung fehlgeschlagen</h2>

      <div class="message">
        <mat-progress-bar *ngIf="sending()" mode="indeterminate"></mat-progress-bar>
        <p *ngIf="sending()">Ihre Antworten werden sicher an einen Sachbearbeiter übermittelt. Die Auswertung erfolgt im Hintergrund; Sie werden kontaktiert.</p>
        <p *ngIf="sent()">Die Ergebnisse wurden an den zuständigen Sachbearbeiter gesendet. Sie werden benachrichtigt, sobald die Auswertung abgeschlossen ist.</p>
        <p *ngIf="error()" style="color:#b91c1c">Beim Übermitteln ist ein Fehler aufgetreten. Bitte kontaktieren Sie uns direkt.</p>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="goStart()">Zur Startseite</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .message { margin: 16px 0; }
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; }
  `]
})
export class ResultComponent {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  sending = signal<boolean>(true);
  sent = signal<boolean>(false);
  error = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.submitResults();
    } else {
      this.sending.set(false);
    }
  }

  async submitResults() {
    const answers = loadAnswers();
    const userData = loadUserData();
    const result = computeRecommendation({ answers });

    const payload = {
      userName: userData.name || 'Unbekannt',
      userEmail: userData.email || '',
      recommendation: result.top as string,
      scores: result.scores as Record<string, number>,
      rationale: result.rationale,
      topFactors: result.topFactors,
    };

    try {
      await this.http.post('/api/submit', payload).toPromise();
      localStorage.setItem('fk_results_sent_at', new Date().toISOString());
      this.sent.set(true);
    } catch (err) {
      console.error('Fehler beim Übermitteln', err);
      this.error.set(true);
    } finally {
      this.sending.set(false);
    }
  }

  goStart() {
    this.router.navigate(['/']);
  }
}
