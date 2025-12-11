
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QUESTIONNAIRE } from '../core/questionnaire';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [CommonModule,MatButtonModule, MatCardModule, MatProgressBarModule],
  template: `
  <div class="container">
    <div class="card">
      <h2 *ngIf="!sent()">Ihre Antworten werden übermittelt</h2>
      <h2 *ngIf="sent()">Vielen Dank — Ergebnisse versendet</h2>

      <div class="message">
        <mat-progress-bar *ngIf="sending()" mode="indeterminate"></mat-progress-bar>
        <p *ngIf="sending()">Ihre Antworten werden sicher an einen Sachbearbeiter übermittelt. Die Auswertung erfolgt im Hintergrund; Sie werden kontaktiert.</p>
        <p *ngIf="sent()">Die Ergebnisse wurden an den zuständigen Sachbearbeiter gesendet. Sie werden benachrichtigt, sobald die Auswertung abgeschlossen ist.</p>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="goStart()">Zur Startseite</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .progress { margin: 8px 0 12px; }
    .options { display: grid; gap: 12px; }
    .option { justify-content: flex-start; padding: 12px 16px; border-radius: 12px; }
    .option.active { border-color: #451DC7; }
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; }
  `]
})
export class ResultComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // Anzeige-/Sende-Status
  sending = signal<boolean>(true);
  sent = signal<boolean>(false);

  constructor() {
    // Beim Betreten der Seite: Antworten im Hintergrund übermitteln
    this.sendResultsInBackground();
  }

  async sendResultsInBackground() {
    const answers = loadAll();
    try {
      // Simuliere asynchronen Versand — ersetze hier mit echtem API-Aufruf falls vorhanden
      console.log('Sende Ergebnisse an Sachbearbeiter...', answers);
      await new Promise(r => setTimeout(r, 1200));

      // Markiere als gesendet (lokal) — optional: lösche gespeicherte Antworten
      localStorage.setItem('fk_results_sent_at', new Date().toISOString());
      localStorage.setItem('fk_results_payload', JSON.stringify(answers));
      this.sent.set(true);
    } catch (err) {
      console.error('Fehler beim Senden der Ergebnisse', err);
      this.sent.set(false);
    } finally {
      this.sending.set(false);
    }
  }

  goStart() {
    this.router.navigate(['/']);
  }
}

/* --- einfache LocalStorage-Persistenz --- */
const KEY = 'fk_answers_v1';
function loadAll(): Record<string, string> {
  return JSON.parse(localStorage.getItem(KEY) ?? '{}');
}
function saveAll(data: Record<string, string>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function saveAnswer(index: number, choiceId: string) {
  const qid = QUESTIONNAIRE.questions[index].id;
  const all = loadAll(); all[qid] = choiceId; saveAll(all);
}
function loadAnswer(index: number): string | null {
  const qid = QUESTIONNAIRE.questions[index].id;
  const all = loadAll(); return all[qid] ?? null;
}
