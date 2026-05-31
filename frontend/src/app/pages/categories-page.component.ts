import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CategorySummary, WebshopApiService } from '../webshop-api.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <section class="rounded-lg border border-primary/10 bg-surface-container-low p-8 shadow-soft">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Kategorienübersicht</p>
        <h2 class="mt-3 text-3xl font-semibold">Unsere Kategorien</h2>
        <p class="mt-4 max-w-3xl text-secondary">
          Entdecken Sie handgefertigte Upcycling-Produkte aus verschiedenen Bereichen
        </p>
      </section>

      <section class="mt-8 grid gap-4 md:grid-cols-3">
        <article *ngFor="let category of categories()" [routerLink]="['/categories', category.slug]" class="cursor-pointer rounded-lg border border-primary/10 bg-surface-lowest p-6 shadow-soft transition duration-150 hover:scale-[0.99] hover:border-primary/20 hover:shadow-md">
          <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">{{ category.slug }}</p>
          <h3 class="mt-2 text-xl font-semibold">
            <span class="hover:text-primary">{{ category.name }}</span>
          </h3>
          <p class="mt-3 text-sm text-secondary">{{ category.description }}</p>
          <p class="mt-4 text-sm text-secondary">{{ category.sustainabilityAspect }}</p>
        </article>
      </section>
    </div>
  `
})
export class CategoriesPageComponent {
  private readonly webshopApiService = inject(WebshopApiService);
  readonly categories = toSignal(this.webshopApiService.getCategories(), { initialValue: [] as CategorySummary[] });
}
