import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { WebshopApiService } from './webshop-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <header class="fixed inset-x-0 top-0 z-50 shrink-0 border-b border-outline-variant/40 bg-surface/95 backdrop-blur shadow-sm">
        <div class="relative mx-auto max-w-7xl px-6 py-3 lg:px-10">
          <div class="grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[auto_1fr] lg:gap-6">
            <a routerLink="/" class="inline-flex items-center gap-0 flex-none" (click)="closeMenu()">
              <img src="assets/logo.svg" alt="Ecolumea" class="h-10 w-10 object-contain" />
              <span class="inline-flex h-10 items-center rounded-full bg-primary px-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-on-primary shadow-soft whitespace-nowrap">Ecolumea</span>
            </a>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-secondary shadow-sm transition hover:bg-primary/10 hover:text-primary lg:hidden"
              (click)="toggleMenu()"
              [attr.aria-expanded]="menuOpen()"
              aria-label="Navigation öffnen"
            >
              <span class="sr-only">Navigation</span>
              <span class="flex flex-col gap-1">
                <span class="h-0.5 w-5 rounded-full bg-current"></span>
                <span class="h-0.5 w-5 rounded-full bg-current"></span>
                <span class="h-0.5 w-5 rounded-full bg-current"></span>
              </span>
            </button>

            <nav class="hidden min-w-0 flex-wrap items-center gap-2 text-sm text-secondary lg:flex lg:justify-end">
              <a routerLink="/categories" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary">Kategorien</a>
              <a routerLink="/products" routerLinkActive="bg-primary text-on-primary shadow-soft" [routerLinkActiveOptions]="{ exact: true }" class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary">Alle Produkte</a>
              <a routerLink="/cart" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary">Warenkorb</a>
              <a routerLink="/admin" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary" *ngIf="canAccessAdminArea()">Verwaltung</a>
              <a routerLink="/account" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary" *ngIf="isLoggedIn()">Mein Konto</a>
              <a routerLink="/auth" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary" *ngIf="!isLoggedIn()">Anmelden</a>
              <button class="rounded-full px-3 py-1.5 transition hover:bg-primary/10 hover:text-primary" *ngIf="isLoggedIn()" (click)="logout()">Abmelden</button>
            </nav>
          </div>

          <nav *ngIf="menuOpen()" class="mt-4 grid gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-3 py-3 text-sm text-secondary shadow-lg lg:hidden">
            <a routerLink="/categories" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-xl px-3 py-2 transition hover:bg-primary/10 hover:text-primary" (click)="closeMenu()">Kategorien</a>
            <a routerLink="/products" routerLinkActive="bg-primary text-on-primary shadow-soft" [routerLinkActiveOptions]="{ exact: true }" class="rounded-xl px-3 py-2 transition hover:bg-primary/10 hover:text-primary" (click)="closeMenu()">Alle Produkte</a>
            <a routerLink="/cart" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-xl px-3 py-2 transition hover:bg-primary/10 hover:text-primary" (click)="closeMenu()">Warenkorb</a>
            <a routerLink="/admin" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-xl px-3 py-2 transition hover:bg-primary/10 hover:text-primary" *ngIf="canAccessAdminArea()" (click)="closeMenu()">Verwaltung</a>
            <a routerLink="/account" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-xl px-3 py-2 transition hover:bg-primary/10 hover:text-primary" *ngIf="isLoggedIn()" (click)="closeMenu()">Mein Konto</a>
            <a routerLink="/auth" routerLinkActive="bg-primary text-on-primary shadow-soft" class="rounded-xl px-3 py-2 transition hover:bg-primary/10 hover:text-primary" *ngIf="!isLoggedIn()" (click)="closeMenu()">Anmelden</a>
            <button class="rounded-xl px-3 py-2 text-left transition hover:bg-primary/10 hover:text-primary" *ngIf="isLoggedIn()" (click)="logout()">Abmelden</button>
          </nav>
        </div>
      </header>

      <main class="flex-1 min-h-[calc(100vh-18rem)] pt-36 sm:pt-32 lg:pt-28">
        <router-outlet></router-outlet>
      </main>

      <footer class="mt-12 border-t border-on-primary/10 bg-primary text-on-primary">
        <div class="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-2 lg:px-10">
          <section>
            <h2 class="text-2xl font-semibold">Ecolumea GmbH</h2>
            <p class="mt-3 max-w-xl text-sm leading-6 text-on-primary/80">
              Ecolumea ist ein lokales MVP-Projekt mit rein demonstrativem Charakter. Die folgenden Angaben sind nicht real.
            </p>
          </section>

          <section>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-on-primary">Kontakt & Rechtliches</p>
            <div class="mt-3 space-y-2 text-sm text-on-primary/80">
              <p>E-Mail: hallo&#64;ecolumea.de</p>
              <p>Telefon: +49 30 12345678</p>
              <p>Öffnungszeiten: Mo-Fr 09:00-17:00 Uhr</p>
            </div>
            <div class="mt-5 flex flex-wrap gap-2 text-sm">
              <a routerLink="/impressum" class="rounded-full border border-on-primary/20 px-3 py-1.5 text-on-primary transition hover:bg-on-primary/10">Impressum</a>
              <a routerLink="/datenschutz" class="rounded-full border border-on-primary/20 px-3 py-1.5 text-on-primary transition hover:bg-on-primary/10">Datenschutz</a>
              <a routerLink="/agb" class="rounded-full border border-on-primary/20 px-3 py-1.5 text-on-primary transition hover:bg-on-primary/10">AGB</a>
              <a routerLink="/widerruf" class="rounded-full border border-on-primary/20 px-3 py-1.5 text-on-primary transition hover:bg-on-primary/10">Widerruf</a>
              <a routerLink="/kontakt" class="rounded-full border border-on-primary/20 px-3 py-1.5 text-on-primary transition hover:bg-on-primary/10">Kontakt</a>
            </div>
          </section>
        </div>

        <div class="border-t border-on-primary/10">
          <div class="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-on-primary/80 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p>2026 Ecolumea GmbH</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  private readonly authSessionService = inject(AuthSessionService);
  private readonly api = inject(WebshopApiService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly isLoggedIn = this.authSessionService.isLoggedIn;
  readonly canAccessAdminArea = computed(() => this.canManageOrders() || this.canManageProducts() || this.isSuperAdmin());

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  canManageProducts(): boolean {
    return this.hasRole('ADMIN_PRODUCT') || this.hasRole('SUPER_ADMIN');
  }

  canManageOrders(): boolean {
    return this.hasRole('ADMIN_ORDER') || this.hasRole('SUPER_ADMIN');
  }

  logout(): void {
    const token = this.authSessionService.getToken();
    if (token) {
      this.api.logout(token).subscribe({
        next: () => {
          this.authSessionService.clearSession();
          this.closeMenu();
          this.router.navigate(['/auth']);
        },
        error: () => {
          this.authSessionService.clearSession();
          this.closeMenu();
          this.router.navigate(['/auth']);
        }
      });
      return;
    }
    this.authSessionService.clearSession();
    this.closeMenu();
    this.router.navigate(['/auth']);
  }

  private hasRole(role: string): boolean {
    const user = this.authSessionService.user();
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  private isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }
}
