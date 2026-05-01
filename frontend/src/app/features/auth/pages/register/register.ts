import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Auth } from '../../services/auth';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  createdUser = signal<User | null>(null);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      void this.router.navigateByUrl('/');
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const credentials = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.register(credentials).pipe(
      switchMap((user) => {
        this.createdUser.set(user);
        return this.authService.login({
          username: credentials.username,
          password: credentials.password,
        });
      }),
    ).subscribe({
      next: (response) => {
        this.successMessage.set(`Account created. Signed in as ${response.user.username}.`);
        this.authService.saveSession(response);
        this.submitting.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Registration failed. Check backend logs and payload.');
        this.submitting.set(false);
      },
    });
  }
}
