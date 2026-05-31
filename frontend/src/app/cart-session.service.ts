import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartSessionService {
  private readonly storageKey = 'ecolumea_cart_session_key';
  private readonly sessionKeyState = signal<string | null>(this.readSessionKey());

  readonly sessionKey = this.sessionKeyState.asReadonly();

  getSessionKey(): string {
    const existing = this.sessionKeyState();
    if (existing && existing.trim().length > 0) {
      return existing;
    }

    const generated = this.generateSessionKey();
    localStorage.setItem(this.storageKey, generated);
    this.sessionKeyState.set(generated);
    return generated;
  }

  updateSessionKey(sessionKey: string): void {
    if (sessionKey && sessionKey.trim().length > 0) {
      localStorage.setItem(this.storageKey, sessionKey);
      this.sessionKeyState.set(sessionKey);
    }
  }

  private readSessionKey(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  private generateSessionKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `sess-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
}
