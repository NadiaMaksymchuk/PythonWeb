import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../../app.routes';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [NgIf],
  templateUrl: './home-user.component.html',
  styleUrl: './home-user.component.css'
})
export class HomeUserComponent {
  userEmail: string | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.customerAuth().subscribe({
      next: (email: string) => {
        this.userEmail = email;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Unauthorized or session expired. Please log in again.';
        this.userEmail = null; 
        console.error(err);
      }
    });
  }
}
