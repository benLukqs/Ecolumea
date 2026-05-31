import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ProductSummary, WebshopApiService } from '../webshop-api.service';

@Component({
  selector: 'app-category-products-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ng-container *ngIf="products() as products">
      <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <section class="rounded-lg border border-primary/10 bg-surface-container-low p-8 shadow-soft">
          <h2 class="text-3xl font-semibold">Produkte in dieser Kategorie</h2>
        
        </section>

        <section class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article *ngFor="let product of products" [routerLink]="['/products', product.slug]" class="cursor-pointer rounded-lg border border-primary/10 bg-surface-lowest p-5 shadow-soft transition duration-150 hover:scale-[0.99] hover:border-primary/20 hover:shadow-md">
            <div class="aspect-[4/3] overflow-hidden rounded-lg bg-primary/5 ring-1 ring-inset ring-primary/10">
              <img
                *ngIf="product.primaryImageUrl"
                [src]="resolveImageUrl(product.primaryImageUrl)"
                [alt]="product.name"
                class="h-full w-full object-cover"
              />
            </div>
            <h3 class="mt-4 text-lg font-semibold">
              <span class="hover:text-primary">{{ product.name }}</span>
            </h3>
            <p class="mt-2 text-sm text-secondary">{{ product.shortDescription }}</p>
            <div class="mt-4 flex flex-col gap-2">
              <p *ngIf="product.hasOffer" class="inline-flex w-fit rounded-full border border-primary/10 bg-tertiary-fixed px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-soft">
                Angebot<span *ngIf="product.appliedOfferName">: {{ product.appliedOfferName }}</span>
              </p>
              <div class="flex items-baseline gap-3">
                <p *ngIf="product.hasOffer" class="text-sm text-secondary line-through">{{ product.price | number: '1.2-2' }} {{ product.currency }}</p>
                <p class="inline-flex rounded-full bg-primary-fixed px-4 py-2 text-sm font-semibold text-on-primary-fixed shadow-soft">
                  {{ (product.hasOffer ? product.offerPrice : product.price) | number: '1.2-2' }} {{ product.currency }}
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </ng-container>
  `
})
export class CategoryProductsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly webshopApiService = inject(WebshopApiService);
  readonly products = toSignal(
    this.route.paramMap.pipe(
      switchMap((paramMap) => this.webshopApiService.getProductsByCategory(paramMap.get('slug') ?? ''))
    ),
    { initialValue: [] as ProductSummary[] }
  );
  private readonly backendOrigin = 'http://localhost:8080';

  resolveImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.backendOrigin}${url}`;
  }
}
