import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from '../auth-session.service';
import { AdminNavItem, getDefaultAdminNavPath, getVisibleAdminNavItems } from './admin-navigation';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <section class="shop-card-surface p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Verwaltung</p>
        <h2 class="mt-3 text-3xl font-semibold">Admin-Bereich</h2>
        
      </section>

      <nav class="mt-6 flex flex-wrap gap-2 border-b border-outline-variant/40 pb-4">
        <a
          *ngFor="let item of visibleTabs()"
          [routerLink]="item.path"
          routerLinkActive="bg-primary text-on-primary shadow-soft"
          [routerLinkActiveOptions]="{ exact: true }"
          class="rounded-full px-4 py-2 transition hover:bg-primary/10 hover:text-primary"
        >
          {{ item.label }}
        </a>
      </nav>

      <router-outlet></router-outlet>
    </div>
  `
})
export class AdminShellComponent implements OnInit {
  readonly visibleTabs = signal<AdminNavItem[]>([]);

  constructor(
    private readonly authSession: AuthSessionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.visibleTabs.set(getVisibleAdminNavItems(this.authSession.getUser()));

    if (this.router.url === '/admin' || this.router.url === '/admin/') {
      const defaultTab = getDefaultAdminNavPath(this.authSession.getUser());
      this.router.navigate([defaultTab], { relativeTo: this.route, replaceUrl: true });
    }
  }
}
