import { Routes } from '@angular/router';
import { renderMode } from '@angular/ssr';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/start.component').then(m => m.StartComponent) 
  },

  { 
    path: 'frage/:index',
    loadComponent: () => import('./pages/question.component').then(m => m.QuestionComponent),
    // Wichtig: Prerendering für diese Parameter-Route deaktivieren
    providers: [renderMode('server')] 
    // Alternativ statt 'server': renderMode('client'), falls du kein SSR willst
  },

  { 
    path: 'ergebnis', 
    loadComponent: () => import('./pages/result.component').then(m => m.ResultComponent) 
  },

  { path: '**', redirectTo: '' }
];

