import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../auth-session.service';
import { WebshopApiService } from '../webshop-api.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <section class="rounded-lg border border-primary/20 bg-surface-container-low p-8 shadow-soft ring-1 ring-inset ring-primary/5">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Konto</p>
        <h2 class="mt-3 text-3xl font-semibold">Anmelden oder registrieren</h2>
      </section>

      <section class="mt-8 grid gap-6 md:grid-cols-2">
        <div class="rounded-lg border border-primary/20 bg-surface-lowest p-6 shadow-soft ring-1 ring-inset ring-primary/5">
          <h3 class="text-lg font-semibold">Anmeldung</h3>
          <form class="mt-4 grid gap-3" (ngSubmit)="login()">
            <input
              [(ngModel)]="loginEmail"
              name="loginEmail"
              type="email"
              placeholder="E-Mail"
              class="rounded-md bg-surface-high px-3 py-2 text-sm"              
            />
            <input
              [(ngModel)]="loginPassword"
              name="loginPassword"
              type="password"
              placeholder="Passwort"
              class="rounded-md bg-surface-high px-3 py-2 text-sm"
              (keydown.enter)="login()"
            />
            <button type="submit" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-soft">Anmelden</button>
          </form>
        </div>

        <div class="rounded-lg border border-primary/20 bg-surface-lowest p-6 shadow-soft ring-1 ring-inset ring-primary/5">
          <h3 class="text-lg font-semibold">Registrierung</h3>
          <div class="mt-4 grid gap-3">
            <input [(ngModel)]="registerFirstName" placeholder="Vorname" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="registerLastName" placeholder="Nachname" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="registerEmail" type="email" placeholder="E-Mail" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="registerPassword" type="password" placeholder="Passwort (min. 8 Zeichen)" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <label class="flex items-start gap-2 text-xs text-secondary">
              <input [ngModel]="registerPrivacyAccepted()" (ngModelChange)="registerPrivacyAccepted.set($event)" type="checkbox" />
              <span>
                Ich stimme der
                <a routerLink="/datenschutz" class="font-semibold text-primary hover:underline">Datenschutzerklärung</a>
                zu.
              </span>
            </label>
            <button (click)="register()" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-soft">Registrieren</button>
          </div>
        </div>
      </section>

      <p *ngIf="message()" class="mt-4 text-sm text-secondary">{{ message() }}</p>
      <p *ngIf="error()" class="mt-2 text-sm text-red-600">{{ error() }}</p>
    </div>
  `
})
export class AuthPageComponent {
  loginEmail = '';
  loginPassword = '';
  registerFirstName = '';
  registerLastName = '';
  registerEmail = '';
  registerPassword = '';
  readonly registerPrivacyAccepted = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSessionService: AuthSessionService,
    private readonly router: Router
  ) {}

  login(): void {
    this.error.set('');
    this.message.set('');
    this.api.login({ email: this.loginEmail.trim(), password: this.loginPassword }).subscribe({
      next: (response) => {
        this.authSessionService.setSession(response.authToken, response.user);
        this.message.set('Erfolgreich angemeldet.');
        this.router.navigate(['/account']);
      },
      error: () => {
        this.error.set('Anmeldung fehlgeschlagen.');
      }
    });
  }

  register(): void {
    this.error.set('');
    this.message.set('');
    if (!this.registerPrivacyAccepted()) {
      this.error.set('Bitte stimme der Datenschutzerklärung zu.');
      return;
    }
    this.api.register({
      email: this.registerEmail.trim(),
      password: this.registerPassword,
      firstName: this.registerFirstName.trim(),
      lastName: this.registerLastName.trim(),
      privacyAccepted: this.registerPrivacyAccepted()
    }).subscribe({
      next: (response) => {
        this.authSessionService.setSession(response.authToken, response.user);
        this.message.set('Registrierung erfolgreich.');
        this.router.navigate(['/account']);
      },
      error: () => {
        this.error.set('Registrierung fehlgeschlagen.');
      }
    });
  }
}
