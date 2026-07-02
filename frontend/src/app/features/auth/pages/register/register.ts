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
      if (this.form.invalid) {
        this.errorMessage.set('Please fix the highlighted fields before creating the account.');
      }
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
        this.errorMessage.set(this.getErrorMessage(error));
        this.submitting.set(false);
      },
    });
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  controlError(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return `${this.prettyLabel(controlName)} is required.`;
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return 'Password must be at least 6 characters long.';
    }

    return 'This field is invalid.';
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const backendMessage = this.extractBackendMessage(error.error);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.';
    }

    if (error.status === 409) {
      return 'Username or email already exists.';
    }

    if (error.status === 400) {
      return 'Please check the submitted data and try again.';
    }

    return 'Registration failed. Please try again.';
  }

  private extractBackendMessage(payload: unknown): string | null {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      return payload.trim() || null;
    }

    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = (payload as { message?: unknown }).message;
      return typeof message === 'string' && message.trim() ? message : null;
    }

    return null;
  }

  private prettyLabel(controlName: keyof typeof this.form.controls): string {
    switch (controlName) {
      case 'username':
        return 'Username';
      case 'email':
        return 'Email';
      case 'password':
        return 'Password';
      default:
        return controlName;
    }
  }
}
