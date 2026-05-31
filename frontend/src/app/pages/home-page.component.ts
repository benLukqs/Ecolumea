import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HomeResponse, WebshopApiService } from '../webshop-api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ng-container *ngIf="home() as home">
      <div class="mx-auto max-w-7xl px-6 py-5 lg:px-10">
        <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div class="rounded-lg border border-primary/20 bg-primary p-8 text-on-primary shadow-soft lg:p-10">
            <h2 class="max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl">
              Einzigartige Produkte mit Geschichte
            </h2>
            <p class="mt-6 max-w-2xl text-base leading-7 text-on-primary/80 lg:text-lg">
              Entdecken Sie handverlesene Upcycling-Schätze, die Stil und Nachhaltigkeit vereinen
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a class="rounded-md bg-on-primary px-5 py-3 text-sm font-medium text-primary transition duration-150 hover:scale-[0.98]" routerLink="/products">
                Upcycling-Produkte ansehen
              </a>
              <a class="rounded-md border border-on-primary/20 bg-transparent px-5 py-3 text-sm font-medium text-on-primary transition duration-150 hover:scale-[0.98] hover:bg-on-primary/10" routerLink="/categories">
                Kategorien ansehen
              </a>
            </div>
          </div>

          <div class="rounded-lg border border-primary/20 bg-primary/10 p-6 shadow-soft">
            <div class="rounded-lg border border-primary/20 bg-surface-lowest/70 p-5">
              <p class="text-xs uppercase tracking-[0.2em] text-primary">Sortiment Fokus</p>
              <ul class="mt-4 space-y-3 text-sm leading-6 text-on-surface">
                <li>• Aus alte Möbeln, Kisten, Flaschen und Textilien neu gestaltete Produkte</li>
                <li>• Jedes Produkt rettet Materialien vor der Entsorgung</li>
                <li>• Mit Liebe und Sorgfalt in lokalen Werkstätten kreiert</li>
                <li>• Jedes Stück ist ein Unikat mit eigener Geschichte</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="concept" class="mt-10 rounded-lg border border-primary/10 bg-surface-container p-8">
          <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Shop-Konzept</p>
          <h3 class="mt-3 text-2xl font-semibold">Upcycling statt Wegwerfen</h3>
          <p class="mt-4text-secondary">
            Jedes Stück erzählt seine eigene Geschichte und wurde aus wiederverwendeten Materialien gefertigt, um alte Dinge neu erstrahlen zu lassen. Aus alten Möbeln, Kisten, Flaschen oder Textilien entstehen
            neue Dinge mit klar erkennbarem Nutzen.
          </p>
        </section>

        <section id="featured" class="mt-10">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Featured Products</p>
              <h3 class="mt-2 text-2xl font-semibold">Unsere Highlights</h3>
            </div>
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article *ngFor="let product of home.featuredProducts" [routerLink]="['/products', product.slug]" class="cursor-pointer rounded-lg border border-primary/10 bg-surface-lowest p-5 shadow-soft transition duration-150 hover:scale-[0.99] hover:border-primary/20 hover:shadow-md">
              <div class="aspect-[4/3] overflow-hidden rounded-lg bg-primary/5 ring-1 ring-inset ring-primary/10">
                <img
                  *ngIf="product.primaryImageUrl"
                  [src]="resolveImageUrl(product.primaryImageUrl)"
                  [alt]="product.name"
                  class="h-full w-full object-cover"
                />
              </div>
              <p class="mt-4 text-xs uppercase tracking-[0.2em] text-secondary">{{ product.materialOrigin }}</p>
              <h4 class="mt-2 text-lg font-semibold">
                <a class="hover:text-primary" [routerLink]="['/products', product.slug]">{{ product.name }}</a>
              </h4>
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
          </div>
        </section>

        <section id="categories" class="mt-10">
          <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Kategorien</p>
          <h3 class="mt-2 text-2xl font-semibold">Stöbern Sie durch unsere vielfältigen Kollektionen</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-3">
            <article *ngFor="let category of home.categories" [routerLink]="['/categories', category.slug]" class="cursor-pointer rounded-lg border border-primary/10 bg-surface-container-low p-6 shadow-soft transition duration-150 hover:scale-[0.99] hover:border-primary/20 hover:shadow-md">
              <h4 class="text-lg font-semibold">
                <span class="hover:text-primary">{{ category.name }}</span>
              </h4>
              <p class="mt-2 text-sm text-secondary">{{ category.description }}</p>
            </article>
          </div>
        </section>

        <section id="sustainability" class="mt-10 rounded-lg border border-primary/10 bg-surface-container-highest p-8">
          <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Nachhaltigkeit</p>
          <h3 class="mt-2 text-2xl font-semibold">Gebrauchtes neu denken und sinnvoll weiterverwenden</h3>
          <ul class="mt-4 space-y-2 text-secondary">
            <li >• Materialherkunft sichtbar machen</li>
            <li >• Herstellungsprozess transparent machen</li>
            <li >• Wirkung und Herkunft klar kommunizieren</li>
          </ul>
        </section>
      </div>
    </ng-container>
  `
})
export class HomePageComponent {
  private readonly webshopApiService = inject(WebshopApiService);
  readonly home = toSignal<HomeResponse>(this.webshopApiService.getHome());
  private readonly backendOrigin = 'http://localhost:8080';

  resolveImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.backendOrigin}${url}`;
  }
}
