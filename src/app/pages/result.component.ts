
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
import { MaturityLevel } from '../core/models';
import { loadContactPref } from './contact.component';
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

const MATURITY_CONFIG: Record<MaturityLevel, { emoji: string; headline: string; text: string; color: string }> = {
  gut: {
    emoji: '😊',
    headline: 'Ihr Testprozess ist solide aufgestellt',
    text: 'Sie haben klare Strukturen und folgen einem definierten Vorgehen. Mit gezielten Optimierungen lässt sich Ihr Testprozess noch weiter stärken — unser Team zeigt Ihnen wie.',
    color: '#15803d',
  },
  ausbaufaehig: {
    emoji: '😐',
    headline: 'Ihr Testprozess hat deutliches Verbesserungspotenzial',
    text: 'Erste Ansätze sind erkennbar, aber es gibt noch erhebliches Potenzial. Mit strukturierten Maßnahmen können Sie Qualität und Effizienz Ihres Testings deutlich steigern.',
    color: '#b45309',
  },
  minimal: {
    emoji: '😕',
    headline: 'Ihr Testprozess braucht dringend Aufmerksamkeit',
    text: 'Systematisches Testen ist in Ihrer Organisation noch kaum verankert. Jetzt ist der richtige Zeitpunkt, mit externer Unterstützung eine solide Basis aufzubauen.',
    color: '#b91c1c',
  },
};

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  template: `
  <div class="container">
    <div class="card">

      <!-- Teaser: Ergebnis noch nicht aufgedeckt -->
      <ng-container *ngIf="!revealed()">
        <div class="teaser-block">
          <div class="teaser-icon">📋</div>
          <h2>Deine Auswertung ist bereit</h2>
          <p class="sub">
            Deine Antworten wurden gespeichert. Unser System hat auf Basis deiner Antworten eine erste
            Einschätzung deines Testprozesses erstellt — möchtest du das Ergebnis sehen?
          </p>
          <button class="reveal-btn" (click)="reveal()">
            Möchtest du dein Ergebnis sehen?
          </button>
        </div>
      </ng-container>

      <!-- Sending state -->
      <ng-container *ngIf="revealed() && sending()">
        <h2>Deine Antworten werden übermittelt&hellip;</h2>
        <mat-progress-bar mode="indeterminate" style="margin:16px 0"></mat-progress-bar>
        <p class="sub">Deine Auswertung wird sicher an einen Sachbearbeiter übermittelt.</p>
      </ng-container>

      <!-- Success state: maturity front and centre -->
      <ng-container *ngIf="sent()">
        <div class="maturity-block">
          <div class="maturity-emoji">{{ maturityEmoji() }}</div>
          <h2 class="maturity-headline" [style.color]="maturityColor()">{{ maturityHeadline() }}</h2>
          <p class="maturity-text">{{ maturityText() }}</p>
        </div>
        <p class="sub sent-note">
          Deine Ergebnisse wurden an den zuständigen Sachbearbeiter gesendet —
          Du wirst kontaktiert, sobald die Auswertung abgeschlossen ist.
        </p>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="goStart()">Zur Startseite</button>
        </div>
      </ng-container>

      <!-- Error state -->
      <ng-container *ngIf="error()">
        <h2>Übermittlung fehlgeschlagen</h2>
        <p class="sub" style="color:#b91c1c">
          Beim Übermitteln ist ein Fehler aufgetreten. Bitte kontaktiere uns direkt.
        </p>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="goStart()">Zur Startseite</button>
        </div>
      </ng-container>

    </div>
  </div>
  `,
  styles: [`
    .container { display:flex; justify-content:center; align-items:flex-start; padding:32px 16px; }
    .card { background:#fff; border-radius:12px; padding:32px 28px; max-width:480px; width:100%;
            box-shadow:0 2px 16px rgba(0,0,0,.08); }

    .teaser-block { text-align:center; padding:8px 0 4px; }
    .teaser-icon { font-size:3.5rem; line-height:1; margin-bottom:16px; }
    .teaser-block h2 { font-size:1.2rem; font-weight:700; margin:0 0 10px; }
    .reveal-btn {
      margin-top:20px;
      background:#451DC7; color:#fff; border:none; border-radius:10px;
      padding:14px 28px; font-size:1rem; font-weight:600; cursor:pointer;
      width:100%; transition:background .15s;
    }
    .reveal-btn:hover { background:#3a17a8; }

    .maturity-block { text-align:center; padding:12px 0 20px; }
    .maturity-emoji { font-size:4rem; line-height:1; margin-bottom:16px; }
    .maturity-headline { font-size:1.2rem; font-weight:700; margin:0 0 12px; }
    .maturity-text { font-size:.93rem; color:#444; line-height:1.6; margin:0; }

    .sub { font-size:.88rem; color:#666; line-height:1.55; margin:12px 0; }
    .sent-note { border-top:1px solid #e5e7eb; padding-top:14px; margin-top:4px; }

    .actions { margin-top:20px; display:flex; justify-content:flex-end; }

    h2 { font-size:1.15rem; font-weight:700; margin:0 0 8px; }
  `]
})
export class ResultComponent {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  revealed = signal<boolean>(false);
  sending = signal<boolean>(false);
  sent = signal<boolean>(false);
  error = signal<boolean>(false);

  maturityEmoji = signal<string>('');
  maturityHeadline = signal<string>('');
  maturityText = signal<string>('');
  maturityColor = signal<string>('#111');

  constructor() {}

  reveal() {
    this.revealed.set(true);
    this.sending.set(true);
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

    // Set maturity display immediately — independent of webhook success
    const mc = MATURITY_CONFIG[result.maturity];
    this.maturityEmoji.set(mc.emoji);
    this.maturityHeadline.set(mc.headline);
    this.maturityText.set(mc.text);
    this.maturityColor.set(mc.color);

    const contactPref = loadContactPref();
    const payload = {
      userName: userData.name || 'Unbekannt',
      userEmail: userData.email || '',
      recommendation: result.top as string,
      scores: result.scores as Record<string, number>,
      rationale: result.rationale,
      topFactors: result.topFactors,
      maturity: result.maturity,
      contactPref: contactPref?.pref ?? null,
      contactPhone: contactPref?.phone ?? null,
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
