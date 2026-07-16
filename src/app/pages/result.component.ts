
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

const MATURITY_CONFIG: Record<MaturityLevel, { headline: string; text: string; color: string; bg: string }> = {
  gut: {
    headline: 'Ihr Testprozess ist solide aufgestellt',
    text: 'Sie haben klare Strukturen und folgen einem definierten Vorgehen. Mit gezielten Optimierungen lässt sich Ihr Testprozess noch weiter stärken — unser Team zeigt Ihnen wie.',
    color: '#15803d',
    bg: '#dcfce7',
  },
  ausbaufaehig: {
    headline: 'Ihr Testprozess hat deutliches Verbesserungspotenzial',
    text: 'Erste Ansätze sind erkennbar, aber es gibt noch erhebliches Potenzial. Mit strukturierten Maßnahmen können Sie Qualität und Effizienz Ihres Testings deutlich steigern.',
    color: '#1d4ed8',
    bg: '#dbeafe',
  },
  minimal: {
    headline: 'Ihr Testprozess braucht dringend Aufmerksamkeit',
    text: 'Systematisches Testen ist in Ihrer Organisation noch kaum verankert. Jetzt ist der richtige Zeitpunkt, mit externer Unterstützung eine solide Basis aufzubauen.',
    color: '#b91c1c',
    bg: '#fee2e2',
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

      <!-- Success state -->
      <ng-container *ngIf="sent()">

        <!-- Maturity badge -->
        <div class="maturity-badge" [style.background]="maturityBg()" [style.borderColor]="maturityColor()">
          <span class="maturity-label">Reifegrad-Einschätzung</span>
          <span class="maturity-headline" [style.color]="maturityColor()">{{ maturityHeadline() }}</span>
          <p class="maturity-text">{{ maturityText() }}</p>
        </div>

        <!-- Bar chart -->
        <div class="chart-section" *ngIf="scoreEntries().length > 0">
          <div class="chart-title">Methoden-Fit</div>
          <div class="chart-bars">
            <div class="bar-row" *ngFor="let e of scoreEntries()" [class.bar-row--top]="e.isTop">
              <span class="bar-label" [title]="e.key">{{ e.key }}</span>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="e.pct" [class.bar-fill--top]="e.isTop"></div>
              </div>
              <span class="bar-val">{{ e.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Keywords -->
        <div class="factors-section" *ngIf="topFactors().length > 0">
          <div class="factors-label">Identifizierte Schwachstellen</div>
          <div class="factors-chips">
            <span class="factor-chip" *ngFor="let f of topFactors()">{{ f }}</span>
          </div>
        </div>

        <p class="sub sent-note">
          Deine Ergebnisse wurden an den zuständigen Sachbearbeiter gesendet —
          Du wirst kontaktiert, sobald die Auswertung abgeschlossen ist.
        </p>
        <div class="actions">
          <a class="wavestone-btn" href="https://wavestone.com/de" target="_blank" rel="noopener">Mehr über Wavestone</a>
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
    .container { display:flex; justify-content:center; align-items:flex-start; padding:32px 16px; min-height:100vh; }
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

    .maturity-badge {
      border-radius:10px; border-left:4px solid; padding:16px 18px;
      margin-bottom:20px;
    }
    .maturity-label {
      font-size:.65rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.1em; color:#666; display:block; margin-bottom:6px;
    }
    .maturity-headline { font-size:1.05rem; font-weight:700; display:block; margin-bottom:8px; }
    .maturity-text { font-size:.88rem; color:#444; line-height:1.6; margin:0; }

    .chart-section { margin-bottom:18px; }
    .chart-title {
      font-size:.68rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.09em; color:#888; margin-bottom:10px;
    }
    .chart-bars { display:flex; flex-direction:column; gap:7px; }
    .bar-row { display:flex; align-items:center; gap:8px; }
    .bar-label {
      width:150px; font-size:.78rem; color:#555; text-align:right;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:0;
    }
    .bar-row--top .bar-label { font-weight:700; color:#111; }
    .bar-track {
      flex:1; height:10px; background:#e5e7eb;
      border-radius:5px; overflow:hidden; min-width:40px;
    }
    .bar-fill { height:100%; border-radius:5px; background:#c4b5fd; transition:width .4s ease; }
    .bar-fill--top { background:#451DC7; }
    .bar-val { width:34px; font-size:.72rem; font-weight:700; color:#888; flex-shrink:0; }
    .bar-row--top .bar-val { color:#451DC7; }

    .factors-section { margin-bottom:16px; }
    .factors-label {
      font-size:.65rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.09em; color:#888; margin-bottom:8px;
    }
    .factors-chips { display:flex; flex-wrap:wrap; gap:6px; }
    .factor-chip {
      font-size:.78rem; background:#eff6ff; border:1px solid #bfdbfe;
      border-radius:999px; padding:3px 11px; color:#1d4ed8;
    }

    .sub { font-size:.88rem; color:#666; line-height:1.55; margin:12px 0; }
    .sent-note { border-top:1px solid #e5e7eb; padding-top:14px; margin-top:4px; }

    .actions { margin-top:20px; display:flex; justify-content:flex-end; gap:10px; align-items:center; }
    .wavestone-btn {
      display:inline-flex; align-items:center;
      background:#fff; border:1.5px solid #451DC7; border-radius:8px;
      padding:0 18px; height:36px; font-size:.88rem; font-weight:600;
      color:#451DC7; text-decoration:none; transition:background .15s;
    }
    .wavestone-btn:hover { background:#f0ebff; }

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

  maturityHeadline = signal<string>('');
  maturityText = signal<string>('');
  maturityColor = signal<string>('#111');
  maturityBg = signal<string>('#f9fafb');
  scoreEntries = signal<Array<{ key: string; val: number; max: number; pct: number; isTop: boolean }>>([]);
  topFactors = signal<string[]>([]);

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
    this.maturityHeadline.set(mc.headline);
    this.maturityText.set(mc.text);
    this.maturityColor.set(mc.color);
    this.maturityBg.set(mc.bg);

    // Build sorted dimension entries for bar chart
    const dimEntries = Object.entries(result.dimensionScores)
      .map(([key, { val, max }]) => ({
        key, val, max,
        pct: Math.min(Math.round((val / max) * 100), 100),
      }))
      .sort((a, b) => b.pct - a.pct);
    const topDimKey = dimEntries[0]?.key ?? '';
    this.scoreEntries.set(dimEntries.map(e => ({ ...e, isTop: e.key === topDimKey })));
    this.topFactors.set(result.topFactors ?? []);

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
