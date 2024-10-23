import { Component, inject } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  userName: string = '';
  userRole: string | null = null;

  constructor(private auth: AuthService) {
    this.auth.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
      const token = this.auth.getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.name;
        this.userRole = payload.role;
      } else {
        this.userName = '';
        this.userRole = null;
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
