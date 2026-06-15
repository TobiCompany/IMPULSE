import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/start.component').then(m => m.StartComponent) 
  },
  { 
    path: 'frage/:index',
    loadComponent: () => import('./pages/question.component').then(m => m.QuestionComponent)
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./pages/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'ergebnis',
    loadComponent: () => import('./pages/result.component').then(m => m.ResultComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
