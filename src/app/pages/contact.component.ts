import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export const CONTACT_KEY = 'fk_contact_pref';

export interface ContactPref {
  pref: 'email' | 'telefon' | 'beide';
  phone?: string;
}

export function loadContactPref(): ContactPref | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const OPTIONS: { id: ContactPref['pref']; label: string; icon: string; desc: string }[] = [
  { id: 'email',   icon: '✉️', label: 'Per E-Mail',            desc: 'Wir schreiben Ihnen an die angegebene Adresse.' },
  { id: 'telefon', icon: '📞', label: 'Per Telefon',           desc: 'Wir rufen Sie zurück — bitte Nummer angeben.'  },
  { id: 'beide',   icon: '✉️📞', label: 'E-Mail und Telefon', desc: 'Wir melden uns auf beiden Wegen.'              },
];

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, MatButtonModule, MatProgressBarModule],
  template: `
  <div class="container">
    <div class="progress">
      <mat-progress-bar mode="determinate" [value]="100"></mat-progress-bar>
      <small>Letzter Schritt</small>
    </div>

    <div class="card">
      <h2>Wie möchten Sie kontaktiert werden?</h2>
      <p class="sub">Unser Team meldet sich nach Auswertung Ihrer Antworten persönlich bei Ihnen.</p>

      <div class="options">
        <button
          *ngFor="let opt of options"
          class="option"
          mat-stroked-button
          [class.active]="selected() === opt.id"
          (click)="select(opt.id)">
          <span class="opt-icon">{{ opt.icon }}</span>
          <span class="opt-text">
            <strong>{{ opt.label }}</strong>
            <small>{{ opt.desc }}</small>
          </span>
        </button>
      </div>

      <div class="phone-wrap" *ngIf="showPhone()">
        <label class="phone-label" for="phone">Ihre Telefonnummer</label>
        <input
          id="phone"
          class="phone-input"
          type="tel"
          placeholder="+49 ..."
          [ngModel]="phone()"
          (ngModelChange)="phone.set($event)"
        />
      </div>

      <div class="actions">
        <button
          mat-raised-button
          color="primary"
          [disabled]="!selected()"
          (click)="submit()">
          Jetzt abschicken
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .container { display:flex; flex-direction:column; align-items:center; padding:16px; }
    .progress { width:100%; max-width:520px; margin-bottom:12px; }
    .card { background:#fff; border-radius:12px; padding:28px 24px; max-width:520px;
            width:100%; box-shadow:0 2px 16px rgba(0,0,0,.08); }

    h2 { font-size:1.15rem; font-weight:700; margin:0 0 6px; }
    .sub { font-size:.88rem; color:#666; margin:0 0 20px; }

    .options { display:grid; gap:10px; margin-bottom:16px; }
    .option {
      display:flex; align-items:center; gap:12px;
      padding:14px 16px; border-radius:12px;
      text-align:left; justify-content:flex-start;
      transition:all .18s;
    }
    .option.active { background:rgba(69,29,199,.85); color:#fff; border-color:#451DC7; }
    .opt-icon { font-size:1.4rem; flex-shrink:0; }
    .opt-text { display:flex; flex-direction:column; gap:2px; }
    .opt-text strong { font-size:.95rem; }
    .opt-text small { font-size:.78rem; opacity:.75; }
    .option.active .opt-text small { opacity:.85; }

    .phone-wrap { margin-bottom:16px; }
    .phone-label { display:block; font-size:.82rem; font-weight:600; margin-bottom:6px; color:#333; }
    .phone-input {
      width:100%; box-sizing:border-box;
      padding:10px 14px; border:1px solid #d1d5db; border-radius:8px;
      font-size:.95rem; outline:none; transition:border-color .15s;
    }
    .phone-input:focus { border-color:#451DC7; }

    .actions { display:flex; justify-content:flex-end; }
    ::ng-deep .mat-mdc-progress-bar-fill::after { background-color:#451DC7 !important; }
    ::ng-deep .mdc-linear-progress__bar-inner { background-color:#451DC7 !important; }
    ::ng-deep .mat-mdc-raised-button[color="primary"] { background-color:#451DC7 !important; }
  `]
})
export class ContactComponent {
  private router = inject(Router);

  options = OPTIONS;
  selected = signal<ContactPref['pref'] | ''>('');
  phone = signal<string>('');

  showPhone = computed(() => this.selected() === 'telefon' || this.selected() === 'beide');

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = loadContactPref();
      if (saved) {
        this.selected.set(saved.pref);
        this.phone.set(saved.phone ?? '');
      }
    }
  }

  select(pref: ContactPref['pref']) {
    this.selected.set(pref);
  }

  submit() {
    if (!this.selected()) return;
    if (typeof localStorage !== 'undefined') {
      const data: ContactPref = { pref: this.selected() as ContactPref['pref'] };
      if (this.showPhone() && this.phone().trim()) data.phone = this.phone().trim();
      localStorage.setItem(CONTACT_KEY, JSON.stringify(data));
    }
    this.router.navigate(['/ergebnis']);
  }
}
