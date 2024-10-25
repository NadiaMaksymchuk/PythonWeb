import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { HomeUserComponent } from './components/home-user/home-user.component';
import { LandingComponent } from './components/landing/landing.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { StoredItemComponent } from './components/stored-item/stored-item.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'register', component: RegisterComponent },
  //   {
  //     path: 'home/admin',
  //     component: HomeAdminComponent,
  //     canActivate: [AuthGuard],
  //     data: { expectedRole: 'Адміністратор' }
  //   },
  //   {
  //     path: 'home/user',
  //     component: HomeUserComponent,
  //     canActivate: [AuthGuard]
  //   },
  {
    path: 'user-home',
    component: HomeUserComponent /*, canActivate: [AuthGuard] */,
  },
  {
    path: 'admin-home',
    component: HomeAdminComponent /*, canActivate: [AuthGuard] */,
  },
  { path: 'stored-items', component: StoredItemComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
