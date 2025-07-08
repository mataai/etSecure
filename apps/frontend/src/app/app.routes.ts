import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Documentation } from './pages/documentation/documentation';
import { Landing } from './pages/landing/landing';
import { Notfound } from './pages/notfound/notfound';

import { HomePage } from './pages/home/home.page';
import { StudentPage } from './pages/student/student.page';
import { AdminPage } from './pages/admin/admin.page';
import { LoginPage } from './pages/login/login.page';
import { SignupPage } from './pages/login/signup.page';

export const appRoutes: Routes = [
  { path: '', component: LoginPage },
  { path: 'signup', component: SignupPage },
  {
    path: '',
    component: AppLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      {
        path: 'uikit',
        loadChildren: () => import('./pages/uikit/uikit.routes'),
      },
      { path: 'documentation', component: Documentation },
      { path: 'pages', loadChildren: () => import('./pages/pages.routes') },
    ],
  },
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  { path: 'home', component: HomePage },
  { path: 'student', component: StudentPage },
  { path: 'admin', component: AdminPage },
  { path: '**', redirectTo: '' },
];
