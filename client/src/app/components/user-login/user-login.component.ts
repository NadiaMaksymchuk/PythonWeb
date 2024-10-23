import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.auth.userLogin(this.loginForm.value).subscribe({
        next: (res) => {
          this.router.navigate(['/user-home']);
        },
        error: (err) => {
          this.errorMessage =
            err.error.msg || 'Невірні дані для входу. Спробуйте ще раз.';
        },
      });
    }
  }
}
