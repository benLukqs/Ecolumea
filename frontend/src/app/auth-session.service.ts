import { computed, Injectable, signal } from '@angular/core';
import { AuthUserView } from './webshop-api.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly tokenKey = 'ecolumea_auth_token';
  private readonly userKey = 'ecolumea_auth_user';
  private readonly tokenState = signal<string | null>(this.readToken());
  private readonly userState = signal<AuthUserView | null>(this.readUser());

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isLoggedIn = computed(() => this.tokenState() != null);

  getToken(): string | null {
    return this.tokenState();
  }

  getUser(): AuthUserView | null {
    return this.userState();
  }

  setSession(token: string, user: AuthUserView): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.tokenState.set(token);
    this.userState.set(user);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.tokenState.set(null);
    this.userState.set(null);
  }

  private readToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private readUser(): AuthUserView | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUserView;
    } catch {
      return null;
    }
  }
}
