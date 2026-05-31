import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, finalize, map, of, switchMap, tap } from 'rxjs';
import { CategorySummary, ProductSummary, WebshopApiService } from '../webshop-api.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <section class="rounded-lg border border-primary/10 bg-surface-container-low p-8 shadow-soft">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Produktübersicht</p>
        <h2 class="mt-3 text-3xl font-semibold">Alle Produkte</h2>
        <p class="mt-4 max-w-3xl text-secondary">
          Hier findest du das gesamte Sortiment. Über die Kategorien kannst du die Liste gezielt filtern.
        </p>
      </section>

      <section class="mt-6 flex flex-wrap gap-2" *ngIf="categories().length > 0">
        <ng-container *ngIf="categories().length > 0">
          <button
            type="button"
            (click)="setCategoryFilter(null)"
            class="rounded-full px-4 py-2 text-sm transition"
            [ngClass]="selectedCategorySlug() === null ? 'bg-primary text-on-primary shadow-soft' : 'bg-surface-container text-secondary hover:bg-primary/10 hover:text-primary'"
          >
            Alle
          </button>

          <button
            type="button"
            *ngFor="let category of categories()"
            (click)="setCategoryFilter(category.slug)"
            class="rounded-full px-4 py-2 text-sm transition"
            [ngClass]="selectedCategorySlug() === category.slug ? 'bg-primary text-on-primary shadow-soft' : 'bg-surface-container text-secondary hover:bg-primary/10 hover:text-primary'"
          >
            {{ category.name }}
          </button>
        </ng-container>
      </section>

      <section class="mt-8" *ngIf="isLoading()">
        <p class="text-sm text-secondary">Produkte werden geladen ...</p>
      </section>

      <section class="mt-8" *ngIf="errorMessage()">
        <p class="text-sm text-red-600">{{ errorMessage() }}</p>
      </section>

      <section class="mt-8" *ngIf="filteredProducts().length === 0 && !isLoading() && !errorMessage()">
        <p class="text-sm text-secondary">Keine Produkte für den gewählten Filter gefunden.</p>
      </section>

      <section class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" *ngIf="filteredProducts().length > 0">
        @if (filteredProducts().length > 0) {
          @for (product of filteredProducts(); track product.slug) {
            <article [routerLink]="['/products', product.slug]" class="cursor-pointer rounded-lg border border-primary/10 bg-surface-lowest p-5 shadow-soft transition duration-150 hover:scale-[0.99] hover:border-primary/20 hover:shadow-md">
              <div class="aspect-[4/3] overflow-hidden rounded-lg bg-primary/5 ring-1 ring-inset ring-primary/10">
                <img
                  *ngIf="product.primaryImageUrl"
                  [src]="resolveImageUrl(product.primaryImageUrl)"
                  [alt]="product.name"
                  class="h-full w-full object-cover"
                />
              </div>
              <p class="mt-4 text-xs uppercase tracking-[0.2em] text-secondary">{{ product.categoryName }}</p>
              <h3 class="mt-2 text-lg font-semibold">
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
          }
        }
      </section>
    </div>
  `
})
export class ProductsPageComponent implements OnInit {
  readonly categories = signal<CategorySummary[]>([]);
  readonly allProducts = signal<ProductWithCategory[]>([]);
  readonly selectedCategorySlug = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly filteredProducts = computed(() => {
    const products = this.allProducts();
    const selectedSlug = this.selectedCategorySlug();

    if (!selectedSlug) {
      return products;
    }

    return products.filter((product) => product.categorySlug === selectedSlug);
  });

  private readonly backendOrigin = 'http://localhost:8080';

  constructor(private readonly webshopApiService: WebshopApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  setCategoryFilter(categorySlug: string | null): void {
    this.selectedCategorySlug.set(categorySlug);
  }

  resolveImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.backendOrigin}${url}`;
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.webshopApiService
      .getCategories()
      .pipe(
        tap((categories) => this.categories.set(categories)),
        switchMap((categories) => {
          if (categories.length === 0) {
            return of([] as ProductWithCategory[]);
          }

          const categoryProductRequests = categories.map((category) =>
            this.webshopApiService.getProductsByCategory(category.slug)
          );

          return forkJoin(categoryProductRequests).pipe(
            map((categoryProducts) => {
              const mergedProducts = categoryProducts.flatMap((products, index) =>
                products.map((product) => ({
                  ...product,
                  categoryName: categories[index].name,
                  categorySlug: categories[index].slug
                }))
              );

              return this.uniqueBySlug(mergedProducts);
            }),
            catchError(() => {
              this.errorMessage.set('Produkte konnten nicht geladen werden.');
              return of([] as ProductWithCategory[]);
            })
          );
        }),
        catchError(() => {
          this.errorMessage.set('Kategorien konnten nicht geladen werden.');
          return of([] as ProductWithCategory[]);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((products) => {
        this.allProducts.set(products);
      });
  }

  private uniqueBySlug(products: ProductWithCategory[]): ProductWithCategory[] {
    const bySlug = new Map<string, ProductWithCategory>();
    for (const product of products) {
      bySlug.set(product.slug, product);
    }
    return Array.from(bySlug.values());
  }
}

type ProductWithCategory = ProductSummary & {
  categoryName: string;
};
