import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ProductDetail, WebshopApiService } from '../webshop-api.service';
import { CartSessionService } from '../cart-session.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ng-container *ngIf="product() as product">
      <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <section class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div class="shop-card p-5">
            <div class="aspect-[4/3] overflow-hidden rounded-lg bg-surface-highest">
              <img
                *ngIf="product.primaryImageUrl"
                [src]="resolveImageUrl(product.primaryImageUrl)"
                [alt]="product.name"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2" *ngIf="product.galleryImageUrls.length > 1">
              <div *ngFor="let imageUrl of product.galleryImageUrls.slice(1, 5)" class="aspect-[4/3] overflow-hidden rounded-lg bg-surface-highest">
                <img [src]="resolveImageUrl(imageUrl)" [alt]="product.name" class="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div class="shop-card-surface p-8">
            <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">{{ product.categoryName }}</p>
            <h2 class="mt-3 text-3xl font-semibold">{{ product.name }}</h2>
            <div class="mt-4 flex flex-col gap-3">
              <p *ngIf="product.hasOffer" class="inline-flex w-fit rounded-full border border-primary/10 bg-tertiary-fixed px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-soft">Angebot<span *ngIf="product.appliedOfferName">: {{ product.appliedOfferName }}</span></p>
              <div class="flex flex-wrap items-end gap-3">
                <p *ngIf="product.hasOffer" class="text-lg text-secondary line-through">{{ product.price | number: '1.2-2' }} {{ product.currency }}</p>
                <p class="inline-flex rounded-full bg-primary-fixed px-4 py-2 text-2xl font-semibold text-on-primary-fixed shadow-soft">{{ (product.hasOffer ? product.offerPrice : product.price) | number: '1.2-2' }} {{ product.currency }}</p>
              </div>
            </div>
            <p class="mt-4 text-secondary">{{ product.longDescription }}</p>

            <div class="mt-6 grid gap-4 shop-card p-5">
              <div>
                <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">Materialherkunft</p>
                <p class="mt-1 text-sm">{{ product.materialOrigin }}</p>
              </div>
              <div>
                <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">Herstellungsprozess</p>
                <p class="mt-1 text-sm">{{ product.manufacturingProcess }}</p>
              </div>
              <div>
                <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">Nachhaltigkeitswirkung</p>
                <p class="mt-1 text-sm">{{ product.sustainabilityImpact }}</p>
              </div>
            </div>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <ng-container *ngIf="product.stockQuantity > 0; else soldOut">
                <button
                  (click)="addToCart(product.slug)"
                  class="rounded-md bg-primary px-5 py-3 text-sm font-medium text-on-primary transition duration-150 hover:scale-[0.98]"
                >
                  In den Warenkorb
                </button>
              </ng-container>
              <ng-template #soldOut>
                <div class="rounded-md border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                  Ausverkauft
                </div>
              </ng-template>
              <a class="rounded-md border border-primary/15 bg-surface-high px-5 py-3 text-sm font-medium text-on-surface hover:border-primary/30 hover:text-primary" routerLink="/categories">Zurück</a>
            </div>
          </div>
        </section>
      </div>
    </ng-container>
  `
})
export class ProductDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly webshopApiService = inject(WebshopApiService);
  private readonly cartSessionService = inject(CartSessionService);
  private readonly router = inject(Router);
  readonly product = toSignal<ProductDetail>(
    this.route.paramMap.pipe(
      switchMap((paramMap) => this.webshopApiService.getProductBySlug(paramMap.get('slug') ?? ''))
    )
  );
  private readonly backendOrigin = 'http://localhost:8080';

  addToCart(productSlug: string): void {
    const sessionKey = this.cartSessionService.getSessionKey();
    this.webshopApiService.addToCart(sessionKey, productSlug, 1).subscribe((cart) => {
      this.cartSessionService.updateSessionKey(cart.sessionKey);
      this.router.navigate(['/cart']);
    });
  }

  resolveImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.backendOrigin}${url}`;
  }
}
