import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../auth-session.service';
import {
  AdminCategoryOption,
  AdminProductUpsertRequest,
  AdminProductView,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl">
     

      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_520px]">
        <div class="shop-card p-5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold">Produkte</h3>
            <button
              (click)="startCreate()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            >Neu</button>
          </div>

          <div class="mt-4 space-y-3">
            <p *ngIf="isLoadingProducts()" class="text-sm text-secondary">Produkte werden geladen ...</p>
            <p *ngIf="!isLoadingProducts() && products().length === 0 && !message()" class="text-sm text-secondary">
              Keine Produkte gefunden.
            </p>
            <button
              *ngFor="let product of products()"
              (click)="selectProduct(product.id)"
              class="w-full rounded-md bg-surface-container px-4 py-3 text-left transition hover:bg-surface-high"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium">{{ product.name }}</p>
                <p class="text-xs text-secondary">{{ product.slug }}</p>
              </div>
              <p class="mt-1 text-xs text-secondary">{{ product.categoryName }}</p>
              <p class="mt-2 text-sm text-primary">{{ product.price | number: '1.2-2' }} {{ product.currency }}</p>
              <p class="mt-1 text-xs text-secondary">{{ product.active ? 'Aktiv' : 'Inaktiv' }} / {{ product.featured ? 'Featured' : 'Normal' }}</p>
              <p class="mt-1 text-xs text-secondary">Bestand: {{ product.stockQuantity }}</p>
            </button>
          </div>
        </div>

        <aside class="shop-card-elevated p-5" [attr.data-form-revision]="formRevision()">
          <h3 class="text-lg font-semibold">{{ editingMode() === 'create' ? 'Neues Produkt' : 'Produkt bearbeiten' }}</h3>

          <div class="mt-4 grid gap-3">
            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Kategorie</label>
            <select [(ngModel)]="form.categoryId" class="rounded-md bg-surface-high px-3 py-2 text-sm">
              <option *ngFor="let category of categories()" [ngValue]="category.id">{{ category.name }}</option>
            </select>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Name</label>
            <input [(ngModel)]="form.name" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Slug</label>
            <input [(ngModel)]="form.slug" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Kurzbeschreibung</label>
            <textarea [(ngModel)]="form.shortDescription" rows="2" class="rounded-md bg-surface-high px-3 py-2 text-sm"></textarea>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Langbeschreibung</label>
            <textarea [(ngModel)]="form.longDescription" rows="4" class="rounded-md bg-surface-high px-3 py-2 text-sm"></textarea>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Preis</label>
                <input [(ngModel)]="form.price" type="number" step="0.01" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Währung</label>
                <input [(ngModel)]="form.currency" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm" />
              </div>
            </div>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Materialherkunft</label>
            <input [(ngModel)]="form.materialOrigin" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Herstellungsprozess</label>
            <input [(ngModel)]="form.manufacturingProcess" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Nachhaltigkeitswirkung</label>
            <textarea [(ngModel)]="form.sustainabilityImpact" rows="2" class="rounded-md bg-surface-high px-3 py-2 text-sm"></textarea>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center gap-2 text-sm">
                <input [(ngModel)]="form.active" type="checkbox" /> Aktiv
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input [(ngModel)]="form.featured" type="checkbox" /> Featured
              </label>
            </div>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Bestand</label>
            <input [(ngModel)]="form.stockQuantity" type="number" min="0" step="1" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
          </div>

          <div class="mt-5 flex gap-2">
            <button
              (click)="save()"
              [disabled]="isSaving()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40"
            >
              {{ editingMode() === 'create' ? 'Anlegen' : 'Speichern' }}
            </button>
            <button
              (click)="resetForm()"
              class="rounded-md bg-surface-high px-4 py-2 text-sm"
            >Zurücksetzen</button>
          </div>
          <p *ngIf="message()" class="mt-3 text-xs text-secondary">{{ message() }}</p>
        </aside>
      </section>
    </div>
  `
})
export class AdminProductsPageComponent implements OnInit {
  readonly products = signal<AdminProductView[]>([]);
  readonly categories = signal<AdminCategoryOption[]>([]);
  readonly editingMode = signal<'create' | 'edit'>('create');
  readonly editingProductId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly isLoadingProducts = signal(false);
  readonly message = signal('');
  readonly formRevision = signal(0);
  private authToken: string | null = null;

  form: AdminProductUpsertRequest = this.createEmptyForm();

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.authToken = this.authSession.getToken();
    if (!this.authToken) {
      this.message.set('Bitte anmelden, um Produkte im Admin-Bereich zu verwalten.');
      return;
    }

    this.api.getAdminProductCategoriesWithAuth(this.authToken).subscribe((categories) => {
      this.categories.set(categories);
      if (categories.length > 0 && !this.form.categoryId) {
        this.form.categoryId = categories[0].id;
        this.markFormChanged();
      }
    });
    this.reloadProducts();
  }

  startCreate(): void {
    this.editingMode.set('create');
    this.editingProductId.set(null);
    this.resetForm();
  }

  selectProduct(id: number): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminProductByIdWithAuth(id, this.authToken).subscribe((product) => {
      this.editingMode.set('edit');
      this.editingProductId.set(product.id);
      this.form = {
        categoryId: product.categoryId,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription ?? '',
        longDescription: product.longDescription ?? '',
        price: product.price,
        currency: product.currency,
        materialOrigin: product.materialOrigin ?? '',
        manufacturingProcess: product.manufacturingProcess ?? '',
        sustainabilityImpact: product.sustainabilityImpact ?? '',
        featured: product.featured,
        active: product.active,
        stockQuantity: product.stockQuantity
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
      this.api.createAdminProductWithAuth(this.form, this.authToken).subscribe({
        next: (product) => {
          this.isSaving.set(false);
          this.message.set(`Produkt angelegt: ${product.name}`);
          this.editingMode.set('edit');
          this.editingProductId.set(product.id);
          this.reloadProducts();
        },
        error: () => {
          this.isSaving.set(false);
          this.message.set('Produkt konnte nicht angelegt werden.');
        }
      });
      return;
    }

    const editingProductId = this.editingProductId();
    if (editingProductId === null) {
      this.isSaving.set(false);
      this.message.set('Kein Produkt ausgewählt.');
      return;
    }

    this.api.updateAdminProductWithAuth(editingProductId, this.form, this.authToken).subscribe({
      next: (product) => {
        this.isSaving.set(false);
        this.message.set(`Produkt aktualisiert: ${product.name}`);
        this.reloadProducts();
      },
      error: () => {
        this.isSaving.set(false);
        this.message.set('Produkt konnte nicht aktualisiert werden.');
      }
    });
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    const categories = this.categories();
    if (categories.length > 0) {
      this.form.categoryId = categories[0].id;
    }
    this.markFormChanged();
  }

  private reloadProducts(): void {
    if (!this.authToken) {
      return;
    }
    this.isLoadingProducts.set(true);
    this.api.getAdminProductsWithAuth(this.authToken).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.isLoadingProducts.set(false);
        this.message.set('Produkte konnten nicht geladen werden.');
      }
    });
  }

  private createEmptyForm(): AdminProductUpsertRequest {
    return {
      categoryId: 0,
      name: '',
      slug: '',
      shortDescription: '',
      longDescription: '',
      price: 0,
      currency: 'EUR',
      materialOrigin: '',
      manufacturingProcess: '',
      sustainabilityImpact: '',
      featured: false,
      active: true,
      stockQuantity: 0
    };
  }

  private markFormChanged(): void {
    this.formRevision.update((revision) => revision + 1);
  }
}
