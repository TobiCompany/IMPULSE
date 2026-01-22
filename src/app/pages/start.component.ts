
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
    <header class="header">
      <div class="container">
        <h1>Welcher Testprozess passt?</h1>
        <p class="subtitle">
          Beantworte 21 Fragen, um eine Empfehlung für den passenden Testprozess zu erhalten.
        </p>
        <form #startForm="ngForm" (ngSubmit)="start(startForm)">
          <div class="form-group">
            <mat-form-field appearance="outline">
              <mat-label>Ihr Name</mat-label>
              <input matInput name="name" [(ngModel)]="userName" placeholder="Max Mustermann">
            </mat-form-field>
          </div>
          <div class="form-group">
            <mat-form-field appearance="outline">
              <mat-label>Ihre E-Mail-Adresse</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="userEmail" placeholder="name@beispiel.de" #emailModel="ngModel" required email>
              <mat-error *ngIf="emailModel.invalid && (emailModel.dirty || emailModel.touched || startForm.submitted)">
                {{ emailModel.errors?.['required'] ? 'E-Mail ist erforderlich' : 'Ungültige E-Mail-Adresse' }}
              </mat-error>
            </mat-form-field>
          </div>
          <button mat-raised-button color="primary" type="submit" [disabled]="startForm.invalid">Los geht’s</button>
        </form>
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
    .header { padding: 32px 0; color: white; }
    .header h1 { color: white; }
    .subtitle { margin: 8px 0 16px; color: rgba(255,255,255,0.9); }
    .form-group { margin: 12px 0; }
    .form-group ::ng-deep .mat-mdc-form-field-label,
    .form-group ::ng-deep .mdc-floating-label { color: white !important; }
    .form-group ::ng-deep .mat-mdc-text-field-wrapper input { color: white !important; }
    .form-group ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    .form-group ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    .form-group ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing { border-color: white !important; }
    .form-group ::ng-deep .mdc-notched-outline__leading,
    .form-group ::ng-deep .mdc-notched-outline__notch,
    .form-group ::ng-deep .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.5) !important; }
    ul { margin: 0; padding-left: 18px; }
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
