import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../auth-session.service';
import {
  AdminCategoryUpsertRequest,
  AdminCategoryView,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl ">
      
      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_480px]">
        <div class="shop-card p-5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold">Kategorien</h3>
            <button (click)="startCreate()" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary">Neu</button>
          </div>

          <div class="mt-4 space-y-3">
            <button
              *ngFor="let category of categories()"
              (click)="selectCategory(category.id)"
              class="w-full rounded-md bg-surface-container px-4 py-3 text-left transition hover:bg-surface-high"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium">{{ category.name }}</p>
                <p class="text-xs text-secondary">#{{ category.sortOrder }}</p>
              </div>
              <p class="mt-1 text-xs text-secondary">{{ category.slug }}</p>
              <p class="mt-1 text-xs text-secondary">{{ category.active ? 'Aktiv' : 'Inaktiv' }}</p>
            </button>
          </div>
        </div>

        <aside class="shop-card-elevated p-5" [attr.data-form-revision]="formRevision()">
          <h3 class="text-lg font-semibold">{{ editingMode() === 'create' ? 'Neue Kategorie' : 'Kategorie bearbeiten' }}</h3>

          <div class="mt-4 grid gap-3">
            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Name</label>
            <input [(ngModel)]="form.name" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Slug</label>
            <input [(ngModel)]="form.slug" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Beschreibung</label>
            <textarea [(ngModel)]="form.description" rows="3" class="rounded-md bg-surface-high px-3 py-2 text-sm"></textarea>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Nachhaltigkeitsaspekt</label>
            <textarea [(ngModel)]="form.sustainabilityAspect" rows="2" class="rounded-md bg-surface-high px-3 py-2 text-sm"></textarea>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Sortierung</label>
                <input [(ngModel)]="form.sortOrder" type="number" min="0" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm" />
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-2 text-sm">
                  <input [(ngModel)]="form.active" type="checkbox" /> Aktiv
                </label>
              </div>
            </div>
          </div>

          <div class="mt-5 flex gap-2">
            <button
              (click)="save()"
              [disabled]="isSaving()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40"
            >{{ editingMode() === 'create' ? 'Anlegen' : 'Speichern' }}</button>
            <button (click)="resetForm()" class="rounded-md bg-surface-high px-4 py-2 text-sm">Zurücksetzen</button>
          </div>
          <p *ngIf="message()" class="mt-3 text-xs text-secondary">{{ message() }}</p>
        </aside>
      </section>
    </div>
  `
})
export class AdminCategoriesPageComponent implements OnInit {
  readonly categories = signal<AdminCategoryView[]>([]);
  readonly editingMode = signal<'create' | 'edit'>('create');
  readonly editingCategoryId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly message = signal('');
  readonly formRevision = signal(0);
  private authToken: string | null = null;

  form: AdminCategoryUpsertRequest = this.createEmptyForm();

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.authToken = this.authSession.getToken();
    if (!this.authToken) {
      this.message.set('Bitte anmelden, um Kategorien im Admin-Bereich zu verwalten.');
      return;
    }
    this.reloadCategories();
  }

  startCreate(): void {
    this.editingMode.set('create');
    this.editingCategoryId.set(null);
    this.resetForm();
  }

  selectCategory(id: number): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminCategoryByIdWithAuth(id, this.authToken).subscribe((category) => {
      this.editingMode.set('edit');
      this.editingCategoryId.set(category.id);
      this.form = {
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        sustainabilityAspect: category.sustainabilityAspect ?? '',
        sortOrder: category.sortOrder,
        active: category.active
      };
      this.markFormChanged();
      this.message.set('');
    });
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.slug.trim()) {
      this.message.set('Name und Slug sind erforderlich.');
      return;
    }

    this.isSaving.set(true);
    this.message.set('');

    if (!this.authToken) {
      this.isSaving.set(false);
      this.message.set('Bitte anmelden.');
      return;
    }

    if (this.editingMode() === 'create') {
      this.api.createAdminCategoryWithAuth(this.form, this.authToken).subscribe({
        next: (category) => {
          this.isSaving.set(false);
          this.message.set(`Kategorie angelegt: ${category.name}`);
          this.editingMode.set('edit');
          this.editingCategoryId.set(category.id);
          this.reloadCategories();
        },
        error: () => {
          this.isSaving.set(false);
          this.message.set('Kategorie konnte nicht angelegt werden.');
        }
      });
      return;
    }

    const editingCategoryId = this.editingCategoryId();
    if (editingCategoryId === null) {
      this.isSaving.set(false);
      this.message.set('Keine Kategorie ausgewählt.');
      return;
    }

    this.api.updateAdminCategoryWithAuth(editingCategoryId, this.form, this.authToken).subscribe({
      next: (category) => {
        this.isSaving.set(false);
        this.message.set(`Kategorie aktualisiert: ${category.name}`);
        this.reloadCategories();
      },
      error: () => {
        this.isSaving.set(false);
        this.message.set('Kategorie konnte nicht aktualisiert werden.');
      }
    });
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.markFormChanged();
  }

  private reloadCategories(): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminCategoriesWithAuth(this.authToken).subscribe((categories) => {
      this.categories.set(categories);
    });
  }

  private createEmptyForm(): AdminCategoryUpsertRequest {
    return {
      name: '',
      slug: '',
      description: '',
      sustainabilityAspect: '',
      sortOrder: 0,
      active: true
    };
  }

  private markFormChanged(): void {
    this.formRevision.update((revision) => revision + 1);
  }
}
