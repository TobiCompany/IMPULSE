import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

const OPTIONS: { id: ContactPref['pref']; label: string; desc: string }[] = [
  { id: 'email',   label: 'Per E-Mail',          desc: 'Wir schreiben Ihnen an die angegebene Adresse.' },
  { id: 'telefon', label: 'Per Telefon',          desc: 'Wir rufen Sie zurück — bitte Nummer angeben.'  },
  { id: 'beide',   label: 'E-Mail und Telefon',   desc: 'Wir melden uns auf beiden Wegen.'              },
];

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, MatProgressBarModule],
  template: `
  <div class="page">
    <div class="card">

      <div class="progress-header">
        <span class="progress-label">Letzter Schritt</span>
        <span class="progress-pct">100%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>

      <h2>Wie möchten Sie kontaktiert werden?</h2>
      <p class="sub">Unser Team meldet sich nach Auswertung Ihrer Antworten persönlich bei Ihnen.</p>

      <div class="options">
        <button
          *ngFor="let opt of options"
          class="option"
          [class.active]="selected() === opt.id"
          (click)="select(opt.id)">
          <strong>{{ opt.label }}</strong>
          <span class="opt-desc">{{ opt.desc }}</span>
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
          class="submit-btn"
          [disabled]="!selected()"
          (click)="submit()">
          Jetzt abschicken
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px 16px; }
    .card { background:#fff; border-radius:16px; padding:28px 28px 24px; max-width:480px;
            width:100%; box-shadow:0 8px 40px rgba(0,0,0,.18); }

    .progress-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .progress-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#888; }
    .progress-pct { font-size:.72rem; font-weight:700; color:#451DC7; }
    .progress-track { height:6px; background:#e5e7eb; border-radius:99px; overflow:hidden; margin-bottom:22px; }
    .progress-fill { height:100%; width:100%; background:linear-gradient(90deg,#451DC7,#2d9e6b); border-radius:99px; }

    h2 { font-size:1.15rem; font-weight:700; margin:0 0 6px; }
    .sub { font-size:.88rem; color:#666; margin:0 0 20px; }

    .options { display:grid; gap:10px; margin-bottom:16px; }
    .option {
      display:flex; flex-direction:column; align-items:flex-start; gap:3px;
      padding:14px 18px; border-radius:12px; border:1.5px solid #d1d5db;
      background:#fff; cursor:pointer; text-align:left; width:100%;
      transition:border-color .15s, background .15s, color .15s;
    }
    .option:hover { border-color:#451DC7; }
    .option.active { background:rgba(69,29,199,.88); color:#fff; border-color:#451DC7; }
    .option strong { font-size:.95rem; font-weight:600; }
    .opt-desc { font-size:.78rem; opacity:.7; }
    .option.active .opt-desc { opacity:.85; }

    .phone-wrap { margin-bottom:16px; }
    .phone-label { display:block; font-size:.82rem; font-weight:600; margin-bottom:6px; color:#333; }
    .phone-input {
      width:100%; box-sizing:border-box;
      padding:10px 14px; border:1px solid #d1d5db; border-radius:8px;
      font-size:.95rem; outline:none; transition:border-color .15s;
    }
    .phone-input:focus { border-color:#451DC7; }

    .actions { display:flex; justify-content:flex-end; margin-top:4px; }
    .submit-btn {
      background:#451DC7; color:#fff; border:none; border-radius:8px;
      padding:11px 24px; font-size:.95rem; font-weight:600; cursor:pointer;
      transition:background .15s;
    }
    .submit-btn:hover:not(:disabled) { background:#3a17a8; }
    .submit-btn:disabled { background:#a0aec0; cursor:not-allowed; }
    ::ng-deep .mat-mdc-progress-bar-fill::after { background-color:#451DC7 !important; }
    ::ng-deep .mdc-linear-progress__bar-inner { background-color:#451DC7 !important; }
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
