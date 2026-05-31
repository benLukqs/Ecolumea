import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AuthSessionService } from '../auth-session.service';
import {
  AdminPasswordResetResponse,
  AdminRoleSummary,
  AdminUserSummary,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-7xl">
     
      <section class="mt-8 shop-card p-5">
        <p *ngIf="message()" class="mb-4 text-sm text-secondary">{{ message() }}</p>
        <p *ngIf="resetResult() as result" class="mb-4 shop-card-elevated p-3 text-sm">
          Temporäres Passwort für User #{{ result.userId }}: <span class="font-semibold">{{ result.temporaryPassword }}</span>
        </p>

        <div class="space-y-3">
          <article *ngFor="let user of users()" class="shop-card-elevated p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium">{{ user.email }}</p>
                <p class="mt-1 text-xs text-secondary">
                  {{ user.firstName || '-' }} {{ user.lastName || '-' }} · {{ user.active ? 'Aktiv' : 'Inaktiv' }}
                </p>
                <p class="mt-1 text-xs text-secondary">Rollen: {{ user.roles.join(', ') || '-' }}</p>
                <div class="mt-2 flex flex-wrap gap-2" *ngIf="roles().length > 0">
                  <button
                    *ngFor="let role of roles()"
                    (click)="toggleRole(user, role.code)"
                    [disabled]="isRoleChanging(user.id, role.code)"
                    class="rounded-md border border-primary/10 px-3 py-1 text-xs"
                    [ngClass]="hasRole(user, role.code)
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-high text-secondary hover:border-primary/20 hover:text-primary'"
                  >
                    {{ role.code }}
                  </button>
                </div>
              </div>
              <button
                (click)="resetPassword(user.id)"
                [disabled]="isResettingUserId() === user.id"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40"
              >
                Passwort zurücksetzen
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  `
})
export class AdminUsersPageComponent implements OnInit {
  readonly users = signal<AdminUserSummary[]>([]);
  readonly roles = signal<AdminRoleSummary[]>([]);
  readonly message = signal('');
  readonly resetResult = signal<AdminPasswordResetResponse | null>(null);
  readonly isResettingUserId = signal<number | null>(null);
  readonly roleChangeKey = signal<string | null>(null);
  private authToken: string | null = null;

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.authToken = this.authSession.getToken();
    if (!this.authToken) {
      this.message.set('Bitte anmelden, um Nutzer im Admin-Bereich zu verwalten.');
      return;
    }

    this.api.getAdminUsersWithAuth(this.authToken).subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: () => {
        this.message.set('Nutzer konnten nicht geladen werden.');
      }
    });

    this.api.getAdminRolesWithAuth(this.authToken).subscribe({
      next: (roles) => {
        this.roles.set(roles.filter((role) => role.active));
      },
      error: () => {
        this.message.set('Rollen konnten nicht geladen werden.');
      }
    });
  }

  resetPassword(userId: number): void {
    if (!this.authToken) {
      this.message.set('Bitte anmelden.');
      return;
    }

    this.isResettingUserId.set(userId);
    this.resetResult.set(null);
    this.message.set('');

    this.api.resetAdminUserPasswordWithAuth(userId, this.authToken).subscribe({
      next: (response) => {
        this.resetResult.set(response);
        this.isResettingUserId.set(null);
      },
      error: () => {
        this.message.set('Passwort konnte nicht zurückgesetzt werden.');
        this.isResettingUserId.set(null);
      }
    });
  }

  hasRole(user: AdminUserSummary, roleCode: string): boolean {
    return user.roles.includes(roleCode);
  }

  isRoleChanging(userId: number, roleCode: string): boolean {
    return this.roleChangeKey() === `${userId}:${roleCode}`;
  }

  toggleRole(user: AdminUserSummary, roleCode: string): void {
    if (!this.authToken) {
      this.message.set('Bitte anmelden.');
      return;
    }

    this.roleChangeKey.set(`${user.id}:${roleCode}`);
    this.message.set('');

    const request$ = user.roles.includes(roleCode)
      ? this.api.removeAdminUserRoleWithAuth(user.id, roleCode, this.authToken)
      : this.api.assignAdminUserRoleWithAuth(user.id, roleCode, this.authToken);

    request$.subscribe({
      next: (updatedUser) => {
        this.users.update((users) => users.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
        this.roleChangeKey.set(null);
      },
      error: (error) => {
        const backendMessage = error?.error?.message;
        this.message.set(backendMessage ? `Rollenänderung fehlgeschlagen: ${backendMessage}` : 'Rollenänderung fehlgeschlagen.');
        this.roleChangeKey.set(null);
      }
    });
  }
}
