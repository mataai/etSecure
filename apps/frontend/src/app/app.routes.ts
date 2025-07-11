import { Routes } from '@angular/router';
import { AppLayout, Dashboard, Documentation, Notfound } from './templates';
import { HomePage } from './pages/home/home.page';
import { StudentPage } from './pages/student/student.page';
import { AdminPage } from './pages/admin/admin-home.page';
import { LogoutPage, CallbackPage, LoginPage, SignupPage } from './pages/auth';
import { authGuard, groupsGuard } from './shared/guards';
import { UserShellComponent, AdminShellComponent } from './shared/components';
import { UsersListPage } from './pages/admin/user-list.page';

export const appRoutes: Routes = [
  { path: 'notfound', component: Notfound },
  {
    path: 'auth',
    children: [
      { path: 'logout', component: LogoutPage },
      { path: 'login', canActivate: [authGuard(false)], component: LoginPage },
      {
        path: 'signup',
        canActivate: [authGuard(false)],
        component: SignupPage,
      },
      {
        path: 'callback',
        canActivate: [authGuard(false)],
        component: CallbackPage,
      },
    ],
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [authGuard(), groupsGuard],
    children: [
      { path: '', component: AdminPage },
      { path: 'users', children: [{ path: '', component: UsersListPage }] },
      { path: '**', redirectTo: '/notfound', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: UserShellComponent,
    canActivateChild: [authGuard()],
    children: [
      { path: 'home', component: HomePage },
      { path: 'student', component: StudentPage },
      { path: '**', redirectTo: '/notfound', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: AppLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'documentation', component: Documentation },
      {
        path: 'uikit',
        loadChildren: () => import('./templates/pages/uikit/uikit.routes'),
      },
      {
        path: 'pages',
        loadChildren: () => import('./templates/pages/pages.routes'),
      },
      { path: '**', redirectTo: '/notfound' },
    ],
  },
];
