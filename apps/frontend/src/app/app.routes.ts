import { Routes } from '@angular/router';
import { Notfound } from './templates';
import { HomePage } from './pages/home/home.page';
import { AdminPage } from './pages/admin/admin-home.page';
import { LogoutPage, CallbackPage, LoginPage, SignupPage } from './pages/auth';
import { authGuard, groupsGuard } from './shared/guards';
import { UserShellComponent, AdminShellComponent } from './shared/components';
import { UsersListPage } from './pages/admin/user-list.page';
import { RoomsListPage } from './pages/admin/room-list.page';
import { UserDetailsPage } from './pages/admin/user-details.page';
import { RoomDetailsPage } from './pages/admin/room-details.page';
import { ProfilePage } from './pages/profile/profile.page';
import { ServiceAccountsListPage } from './pages/admin/service-accounts/service-accounts-list.page';
import { ServiceAccountDetailsPage } from './pages/admin/service-accounts/service-account-details.page';

export const appRoutes: Routes = [
  { path: 'notfound', component: Notfound },
  {
    path: 'auth',
    children: [
      { path: 'logout', component: LogoutPage },
      { path: 'login', canActivate: [authGuard(false)], component: LoginPage },
      {
        path: 'signup',
        component: SignupPage,
      },
      {
        path: 'callback',
        component: CallbackPage,
      },
    ],
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [authGuard(), groupsGuard(['etsecure_admin'])],
    children: [
      { path: '', component: AdminPage },
      {
        path: 'users',
        children: [
          { path: '', component: UsersListPage },
          { path: ':id', component: UserDetailsPage },
        ],
      },
      {
        path: 'rooms',
        children: [
          { path: '', component: RoomsListPage },
          { path: ':id', component: RoomDetailsPage },
        ],
      },
      {
        path: 'service-accounts',
        children: [
          { path: '', component: ServiceAccountsListPage },
          { path: ':id', component: ServiceAccountDetailsPage },
        ],
      },
      { path: '**', redirectTo: '/notfound', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: UserShellComponent,
    canActivateChild: [authGuard()],
    children: [
      { path: 'home', component: HomePage },
      { path: 'profile', component: ProfilePage },
      {
        path: 'bypass',
        loadComponent: () =>
          import('./pages/bypass/bypass.page').then((m) => m.BypassPage),
      },
      { path: '**', redirectTo: '/home', pathMatch: 'full' },
    ],
  },
];
