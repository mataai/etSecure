import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Documentation } from './pages/documentation/documentation';
import { Notfound } from './pages/notfound/notfound';
import { HomePage } from './pages/home/home.page';
import { StudentPage } from './pages/student/student.page';
import { AdminPage } from './pages/admin/admin.page';
import { LoginPage } from './pages/login/login.page';
import { SignupPage } from './pages/login/signup.page';
import { authGuard } from './shared/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginPage },
      { path: 'signup', component: SignupPage },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivateChild: [
      authGuard, // Ensure user is authenticated before accessing these routes
    ],
    children: [
      {
        path: 'admin',
        children: [{ path: 'admin', component: AdminPage }],
      },
      { path: 'home', component: HomePage },
      { path: 'student', component: StudentPage },
      { path: '**', redirectTo: '/auth/login', pathMatch: 'full' },
    ],
  },
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
      { path: '**', redirectTo: 'notfound' },
    ],
  },
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: 'notfound' },
];
