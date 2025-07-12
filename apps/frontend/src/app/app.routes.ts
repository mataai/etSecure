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
      { path: '**', redirectTo: '/home', pathMatch: 'full' },
    ],
  },
];
