import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthSessionService } from '../auth-session.service';
import {
  AdminCategoryView,
  AdminOfferUpsertRequest,
  AdminOfferView,
  AdminProductView,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-admin-offers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl ">
     
      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_560px]">
        <div class="shop-card p-5">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold">Angebote</h3>
            <button (click)="startCreate()" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary">Neu</button>
          </div>

          <div class="mt-4 space-y-3">
            <button
              *ngFor="let offer of offers()"
              (click)="selectOffer(offer.id)"
              class="w-full rounded-md bg-surface-container px-4 py-3 text-left transition hover:bg-surface-high"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium">{{ offer.name }}</p>
                <p class="text-xs text-secondary">{{ offer.active ? 'Aktiv' : 'Inaktiv' }}</p>
              </div>
              <p class="mt-1 text-xs text-secondary">{{ offer.discountType }} {{ offer.discountValue }}</p>
              <p class="mt-1 text-xs text-secondary">{{ offer.targetType }} / {{ getTargetLabel(offer) }}</p>
            </button>
          </div>
        </div>

        <aside class="shop-card-elevated p-5" [attr.data-form-revision]="formRevision()">
          <h3 class="text-lg font-semibold">{{ editingMode() === 'create' ? 'Neues Angebot' : 'Angebot bearbeiten' }}</h3>

          <div class="mt-4 grid gap-3">
            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Name</label>
            <input [(ngModel)]="form.name" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Beschreibung</label>
            <textarea [(ngModel)]="form.description" rows="2" class="rounded-md bg-surface-high px-3 py-2 text-sm"></textarea>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Rabatttyp</label>
                <select [(ngModel)]="form.discountType" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm">
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="FIXED">FIXED</option>
                </select>
              </div>
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Rabattwert</label>
                <input [(ngModel)]="form.discountValue" type="number" step="0.01" min="0" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm" />
              </div>
            </div>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Target Typ</label>
            <select [(ngModel)]="form.targetType" (ngModelChange)="onTargetTypeChanged()" class="rounded-md bg-surface-high px-3 py-2 text-sm">
              <option value="CATEGORY">CATEGORY</option>
              <option value="PRODUCT">PRODUCT</option>
            </select>

            <div *ngIf="form.targetType === 'CATEGORY'">
              <label class="text-xs uppercase tracking-[0.15em] text-secondary">Zielkategorie</label>
              <select [(ngModel)]="form.targetCategoryId" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm">
                <option [ngValue]="null">Bitte wählen</option>
                <option *ngFor="let category of categories()" [ngValue]="category.id">{{ category.name }}</option>
              </select>
            </div>

            <div *ngIf="form.targetType === 'PRODUCT'">
              <label class="text-xs uppercase tracking-[0.15em] text-secondary">Zielprodukt</label>
              <select [(ngModel)]="form.targetProductId" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm">
                <option [ngValue]="null">Bitte wählen</option>
                <option *ngFor="let product of products()" [ngValue]="product.id">{{ product.name }}</option>
              </select>
            </div>

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Teaser Text</label>
            <input [(ngModel)]="form.teaserText" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Start</label>
                <input [(ngModel)]="form.startsAt" type="datetime-local" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-xs uppercase tracking-[0.15em] text-secondary">Ende</label>
                <input [(ngModel)]="form.endsAt" type="datetime-local" class="mt-1 w-full rounded-md bg-surface-high px-3 py-2 text-sm" />
              </div>
            </div>

            <label class="flex items-center gap-2 text-sm">
              <input [(ngModel)]="form.active" type="checkbox" /> Aktiv
            </label>
          </div>

          <div class="mt-5 flex gap-2">
            <button (click)="save()" [disabled]="isSaving()" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40">{{ editingMode() === 'create' ? 'Anlegen' : 'Speichern' }}</button>
            <button (click)="resetForm()" class="rounded-md bg-surface-high px-4 py-2 text-sm">Zurücksetzen</button>
          </div>
          <p *ngIf="message()" class="mt-3 text-xs text-secondary">{{ message() }}</p>
        </aside>
      </section>
    </div>
  `
})
export class AdminOffersPageComponent implements OnInit {
  readonly offers = signal<AdminOfferView[]>([]);
  readonly categories = signal<AdminCategoryView[]>([]);
  readonly products = signal<AdminProductView[]>([]);
  readonly editingMode = signal<'create' | 'edit'>('create');
  readonly editingOfferId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly message = signal('');
  readonly formRevision = signal(0);
  private authToken: string | null = null;

  form: AdminOfferUpsertRequest = this.createEmptyForm();

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.authToken = this.authSession.getToken();
    if (!this.authToken) {
      this.message.set('Bitte anmelden, um Angebote im Admin-Bereich zu verwalten.');
      return;
    }

    forkJoin({
      categories: this.api.getAdminCategoriesWithAuth(this.authToken),
      products: this.api.getAdminProductsWithAuth(this.authToken)
    }).subscribe({
      next: ({ categories, products }) => {
        this.categories.set(categories);
        this.products.set(products);
        this.reloadOffers();
      },
      error: () => {
        this.message.set('Kategorien oder Produkte konnten nicht geladen werden.');
      }
    });
  }

  startCreate(): void {
    this.editingMode.set('create');
    this.editingOfferId.set(null);
    this.resetForm();
  }

  selectOffer(id: number): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminOfferByIdWithAuth(id, this.authToken).subscribe((offer) => {
      this.editingMode.set('edit');
      this.editingOfferId.set(offer.id);
      this.form = {
        name: offer.name,
        description: offer.description ?? '',
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        targetType: offer.targetType,
        targetCategoryId: offer.targetCategoryId,
        targetProductId: offer.targetProductId,
        teaserText: offer.teaserText ?? '',
        startsAt: this.toDateTimeLocal(offer.startsAt),
        endsAt: this.toDateTimeLocal(offer.endsAt),
        active: offer.active
      };
      this.markFormChanged();
      this.message.set('');
    });
  }

  onTargetTypeChanged(): void {
    if (this.form.targetType === 'CATEGORY') {
      this.form.targetProductId = null;
    } else {
      this.form.targetCategoryId = null;
    }
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.message.set('Name ist erforderlich.');
      return;
    }
    if (this.form.targetType === 'CATEGORY' && this.form.targetCategoryId == null) {
      this.message.set('Bitte eine Zielkategorie auswählen.');
      return;
    }
    if (this.form.targetType === 'PRODUCT' && this.form.targetProductId == null) {
      this.message.set('Bitte ein Zielprodukt auswählen.');
      return;
    }

    this.isSaving.set(true);
    this.message.set('');

    if (!this.authToken) {
      this.isSaving.set(false);
      this.message.set('Bitte anmelden.');
      return;
    }

    const payload: AdminOfferUpsertRequest = {
      ...this.form,
      startsAt: this.emptyToNull(this.form.startsAt),
      endsAt: this.emptyToNull(this.form.endsAt)
    };

    if (this.editingMode() === 'create') {
      this.api.createAdminOfferWithAuth(payload, this.authToken).subscribe({
        next: (offer) => {
          this.isSaving.set(false);
          this.message.set(`Angebot angelegt: ${offer.name}`);
          this.editingMode.set('edit');
          this.editingOfferId.set(offer.id);
          this.reloadOffers();
        },
        error: () => {
          this.isSaving.set(false);
          this.message.set('Angebot konnte nicht angelegt werden.');
        }
      });
      return;
    }

    const editingOfferId = this.editingOfferId();
    if (editingOfferId === null) {
      this.isSaving.set(false);
      this.message.set('Kein Angebot ausgewählt.');
      return;
    }

    this.api.updateAdminOfferWithAuth(editingOfferId, payload, this.authToken).subscribe({
      next: (offer) => {
        this.isSaving.set(false);
        this.message.set(`Angebot aktualisiert: ${offer.name}`);
        this.reloadOffers();
      },
      error: () => {
        this.isSaving.set(false);
        this.message.set('Angebot konnte nicht aktualisiert werden.');
      }
    });
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.markFormChanged();
  }

  getTargetLabel(offer: AdminOfferView): string {
    if (offer.targetType === 'CATEGORY') {
      const category = this.categories().find((item) => item.id === offer.targetCategoryId);
      return category ? category.name : offer.targetCategoryId ? `#${offer.targetCategoryId}` : 'Unbekannt';
    }
    const product = this.products().find((item) => item.id === offer.targetProductId);
    return product ? product.name : offer.targetProductId ? `#${offer.targetProductId}` : 'Unbekannt';
  }

  private reloadOffers(): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminOffersWithAuth(this.authToken).subscribe((offers) => {
      this.offers.set(offers);
    });
  }

  private createEmptyForm(): AdminOfferUpsertRequest {
    return {
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      targetType: 'CATEGORY',
      targetCategoryId: null,
      targetProductId: null,
      teaserText: '',
      startsAt: null,
      endsAt: null,
      active: true
    };
  }

  private emptyToNull(value: string | null): string | null {
    if (value == null || value.trim().length === 0) {
      return null;
    }
    return value;
  }

  private toDateTimeLocal(value: string | null): string | null {
    if (!value) {
      return null;
    }
    if (value.includes('T')) {
      return value.length >= 16 ? value.slice(0, 16) : value;
    }
    return value.replace(' ', 'T').slice(0, 16);
  }

  private markFormChanged(): void {
    this.formRevision.update((revision) => revision + 1);
  }
}
