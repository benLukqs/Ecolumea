import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../auth-session.service';
import {
  AdminMediaProductOption,
  AdminProductImageView,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-admin-media-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl">
      
      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_480px]">
        <div class="shop-card p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold">Produktbilder</h3>
              <p class="text-xs text-secondary">Waehle ein Produkt und verwalte die Galerie.</p>
            </div>
          </div>

          <div class="mt-4">
            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Produkt</label>
            <select
              [ngModel]="selectedProductId()"
              (ngModelChange)="selectedProductId.set($event); onProductChange()"
              class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm"
            >
              <option *ngFor="let product of products()" [ngValue]="product.id">
                {{ product.name }} ({{ product.slug }})
              </option>
            </select>
          </div>

          <div class="mt-6">
            <p *ngIf="isLoadingImages()" class="text-sm text-secondary">Bilder werden geladen ...</p>
            <p *ngIf="!isLoadingImages() && images().length === 0" class="text-sm text-secondary">
              Keine Bilder vorhanden.
            </p>

            <div class="grid gap-4 sm:grid-cols-2" *ngIf="images().length > 0">
              <article *ngFor="let image of images()" class="rounded-lg border border-outline-variant/40 bg-surface-high p-3">
                <img
                  [src]="image.imageUrl"
                  [alt]="image.altText || image.title || 'Produktbild'"
                  class="h-40 w-full rounded-md object-cover"
                />
                <div class="mt-3">
                  <p class="text-sm font-medium">{{ image.title || 'Ohne Titel' }}</p>
                  <p class="text-xs text-secondary">{{ image.altText || 'Kein Alt-Text' }}</p>
                  <p class="mt-2 text-xs text-secondary">Sortierung: {{ image.sortOrder }}</p>
                  <p class="mt-1 text-xs" [class.text-primary]="image.isPrimary" [class.text-secondary]="!image.isPrimary">
                    {{ image.isPrimary ? 'Hauptbild' : 'Galeriebild' }}
                  </p>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    (click)="setPrimary(image)"
                    [disabled]="image.isPrimary || isUpdating()"
                    class="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary disabled:opacity-40"
                  >Hauptbild setzen</button>
                  <button
                    (click)="removeImage(image)"
                    [disabled]="isUpdating()"
                    class="rounded-md bg-surface-container px-3 py-1.5 text-xs"
                  >Loeschen</button>
                </div>
              </article>
            </div>
          </div>
        </div>

        <aside class="shop-card-elevated p-5">
          <h3 class="text-lg font-semibold">Bild hochladen</h3>
          <p class="mt-2 text-sm text-secondary">PNG oder JPG, max. 5 MB.</p>

          <div class="mt-4 grid gap-3">
            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Datei</label>
            <input
              #fileInput
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              class="rounded-md bg-surface-high px-3 py-2 text-sm"
            />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Titel</label>
            <input [(ngModel)]="form.title" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Alt-Text</label>
            <input [(ngModel)]="form.altText" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="text-xs uppercase tracking-[0.15em] text-secondary">Sortierung</label>
            <input [(ngModel)]="form.sortOrder" type="number" class="rounded-md bg-surface-high px-3 py-2 text-sm" />

            <label class="flex items-center gap-2 text-sm">
              <input [(ngModel)]="form.isPrimary" type="checkbox" />
              Als Hauptbild setzen
            </label>
          </div>

          <div class="mt-5 flex gap-2">
            <button
              (click)="uploadImage()"
              [disabled]="isUploading()"
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40"
            >Upload</button>
            <button
              (click)="resetForm()"
              class="rounded-md bg-surface-high px-4 py-2 text-sm"
            >Zuruecksetzen</button>
          </div>

          <p *ngIf="message()" class="mt-3 text-xs text-secondary">{{ message() }}</p>
        </aside>
      </section>
    </div>
  `
})
export class AdminMediaPageComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  readonly products = signal<AdminMediaProductOption[]>([]);
  readonly images = signal<AdminProductImageView[]>([]);
  readonly selectedProductId = signal<number | null>(null);
  readonly isLoadingImages = signal(false);
  readonly isUploading = signal(false);
  readonly isUpdating = signal(false);
  readonly message = signal('');

  form = {
    title: '',
    altText: '',
    sortOrder: 0,
    isPrimary: false
  };

  private authToken: string | null = null;
  private selectedFile: File | null = null;

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.authToken = this.authSession.getToken();
    if (!this.authToken) {
      this.message.set('Bitte anmelden, um Medien im Admin-Bereich zu verwalten.');
      return;
    }

    this.api.getAdminMediaProductsWithAuth(this.authToken).subscribe((products) => {
      this.products.set(products);
      if (products.length > 0) {
        this.selectedProductId.set(products[0].id);
        this.loadImages();
      }
    });
  }

  onProductChange(): void {
    this.loadImages();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  uploadImage(): void {
    if (!this.authToken) {
      this.message.set('Bitte anmelden.');
      return;
    }
    const selectedProductId = this.selectedProductId();
    if (!selectedProductId) {
      this.message.set('Bitte zuerst ein Produkt auswaehlen.');
      return;
    }
    if (!this.selectedFile) {
      this.message.set('Bitte eine Bilddatei auswaehlen.');
      return;
    }

    this.isUploading.set(true);
    this.message.set('');

    this.api.uploadAdminProductImageWithAuth(
      selectedProductId,
      this.selectedFile,
      this.form.title,
      this.form.altText,
      this.form.sortOrder,
      this.form.isPrimary,
      this.authToken
    ).subscribe({
      next: (image) => {
        this.isUploading.set(false);
        this.message.set('Bild hochgeladen.');
        this.images.set([image, ...this.images().filter((item) => item.id !== image.id)]);
        if (image.isPrimary) {
          this.images.update((images) => images.map((item) => ({
            ...item,
            isPrimary: item.id === image.id
          })));
        }
        this.resetForm();
      },
      error: () => {
        this.isUploading.set(false);
        this.message.set('Upload fehlgeschlagen.');
      }
    });
  }

  setPrimary(image: AdminProductImageView): void {
    if (!this.authToken) {
      return;
    }
    this.isUpdating.set(true);
    this.api.setAdminProductImagePrimaryWithAuth(image.id, this.authToken).subscribe({
      next: (updated) => {
        this.isUpdating.set(false);
        this.images.update((images) => images.map((item) => ({
          ...item,
          isPrimary: item.id === updated.id
        })));
      },
      error: () => {
        this.isUpdating.set(false);
        this.message.set('Hauptbild konnte nicht gesetzt werden.');
      }
    });
  }

  removeImage(image: AdminProductImageView): void {
    if (!this.authToken) {
      return;
    }
    this.isUpdating.set(true);
    this.api.deleteAdminProductImageWithAuth(image.id, this.authToken).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.images.update((images) => images.filter((item) => item.id !== image.id));
      },
      error: () => {
        this.isUpdating.set(false);
        this.message.set('Bild konnte nicht geloescht werden.');
      }
    });
  }

  resetForm(): void {
    this.form = {
      title: '',
      altText: '',
      sortOrder: 0,
      isPrimary: false
    };
    this.selectedFile = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private loadImages(): void {
    const selectedProductId = this.selectedProductId();
    if (!this.authToken || !selectedProductId) {
      return;
    }
    this.isLoadingImages.set(true);
    this.api.getAdminProductImagesWithAuth(selectedProductId, this.authToken).subscribe({
      next: (images) => {
        this.images.set(images);
        this.isLoadingImages.set(false);
      },
      error: () => {
        this.isLoadingImages.set(false);
        this.message.set('Bilder konnten nicht geladen werden.');
      }
    });
  }
}
