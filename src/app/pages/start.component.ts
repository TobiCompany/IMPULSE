
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-start',
  imports: [CommonModule, MatButtonModule, FormsModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="page">
      <div class="card">

        <div class="brand">
          <span class="brand-dot"></span>
          <span class="brand-name">Wavestone · IMPULSE</span>
        </div>

        <h1>Welcher Testprozess passt zu Ihnen?</h1>
        <p class="subtitle">
          Beantworten Sie 11 kurze Fragen — wir liefern eine erste Einschätzung Ihres Testprozesses und eine Empfehlung.
        </p>

        <form #startForm="ngForm" (ngSubmit)="start(startForm)" class="form">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Ihr Name</mat-label>
            <input matInput name="name" [(ngModel)]="userName" placeholder="Max Mustermann">
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Ihre E-Mail-Adresse*</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="userEmail"
                   placeholder="name@firma.de" #emailModel="ngModel" required email>
            <mat-error *ngIf="emailModel.invalid && (emailModel.dirty || emailModel.touched || startForm.submitted)">
              {{ emailModel.errors?.[‘required’] ? ‘E-Mail ist erforderlich’ : ‘Ungültige E-Mail-Adresse’ }}
            </mat-error>
          </mat-form-field>

          <button class="submit-btn" type="submit" [disabled]="startForm.invalid">
            Jetzt starten →
          </button>
        </form>

        <div class="info-strip">
          <div class="info-item">
            <span class="info-icon">⏱</span>
            <span>Ca. 3 Minuten</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🔒</span>
            <span>Vertraulich & sicher</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📊</span>
            <span>Sofortiges Ergebnis</span>
          </div>
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
      padding: 36px 32px 28px;
      max-width: 460px;
      width: 100%;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .brand-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: linear-gradient(135deg, #451DC7, #2d9e6b);
      flex-shrink: 0;
    }
    .brand-name {
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #888;
    }

    h1 {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0 0 10px;
      color: #111;
      line-height: 1.3;
    }
    .subtitle {
      font-size: .9rem;
      color: #555;
      line-height: 1.6;
      margin: 0 0 24px;
    }

    .form { display: flex; flex-direction: column; gap: 4px; }
    .field { width: 100%; }

    .submit-btn {
      margin-top: 8px;
      width: 100%;
      background: #451DC7;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s;
      letter-spacing: .02em;
    }
    .submit-btn:hover:not(:disabled) { background: #3a17a8; }
    .submit-btn:disabled { background: #c4b5fd; cursor: not-allowed; }

    .info-strip {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: .75rem;
      color: #777;
      text-align: center;
    }
    .info-icon { font-size: 1.1rem; }
  `]
})
export class StartComponent {
  userName: string = '';
  userEmail: string = '';

  constructor(private router: Router) {}

  start(form?: NgForm): void {
    if (form && form.invalid) {
      return;
    }
    // Alte Session-Daten löschen, damit Fragen nicht vorausgefüllt sind
    localStorage.removeItem('fk_answers_v1');
    localStorage.removeItem('fk_contact_pref');

    // Speichere Nutzerdaten vor Weiterleitung
    const userData = {
      name: this.userName.trim(),
      email: this.userEmail.trim(),
      startedAt: new Date().toISOString()
    };
    localStorage.setItem('fk_user_data', JSON.stringify(userData));
    this.router.navigateByUrl('/frage/0');
  }
}
