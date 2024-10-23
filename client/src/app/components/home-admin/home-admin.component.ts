import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../../app.routes';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [NgIf],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})
export class HomeAdminComponent {
  adminEmail: string | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.adminAuth().subscribe({
      next: (email: string) => {
        this.adminEmail = email;
        this.errorMessage = null;
      },
      error: (err) => {
        if (err.error && err.error.detail && err.error.detail.message) {
          this.errorMessage = err.error.detail.message;
        } else {
          this.errorMessage = 'Unauthorized or session expired. Please log in again.';
        }
        this.adminEmail = null;
        console.error(err);
      }
    });
  }
}
