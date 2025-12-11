
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-start',
  imports: [CommonModule, MatButtonModule, FormsModule, MatInputModule, MatFormFieldModule],
  template: `
    <header class="header">
      <div class="container">
        <h1>Welcher Testprozess passt?</h1>
        <p class="subtitle">
          Beantworte 21 Fragen, um eine Empfehlung für den passenden Testprozess zu erhalten.
        </p>        <div class="form-group">
          <mat-form-field appearance="outline">
            <mat-label>Ihr Name</mat-label>
            <input matInput [(ngModel)]="userName" placeholder="Max Mustermann">
          </mat-form-field>
        </div>
        <div class="form-group">
          <mat-form-field appearance="outline">
            <mat-label>Ihre E-Mail-Adresse</mat-label>
            <input matInput type="email" [(ngModel)]="userEmail" placeholder="name@beispiel.de">
          </mat-form-field>
        </div>        <button mat-raised-button color="primary" (click)="start()">Los geht’s</button>
      </div>
    </header>
    <main class="container">
      <div class="card">
        <h2>Was dich erwartet</h2>
        <ul>
          <li>Mobile-first, eine Frage pro Screen</li>
          <li>Kurze, klare Antwortoptionen</li>
          <li>Ergebnis mit Begründung & Scores</li>
        </ul>
      </div>
      <div class="card">
        <h2>Deine Daten sind sicher</h2>
        <p>
          Nach Abschluss des Fragenkatalogs werden deine Antworten an einen Sachbearbeiter übermittelt.
          Dieser wird deine Angaben auswerten und sich mit Empfehlungen bei dir melden.
          Die Verarbeitung erfolgt vertraulich und sicher.
        </p>
      </div>
    </main>
  `,
  styles: [`
    .header { padding: 32px 0; }
    .subtitle { margin: 8px 0 16px; color: rgba(25,26,28,0.8); }
    .form-group { margin: 12px 0; }
    ul { margin: 0; padding-left: 18px; }
  `]
})
export class StartComponent {
  userName: string = '';
  userEmail: string = '';

  constructor(private router: Router) {}

  start(): void {
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
