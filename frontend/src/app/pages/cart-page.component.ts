import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartResponse, WebshopApiService } from '../webshop-api.service';
import { CartSessionService } from '../cart-session.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <section class="shop-card-surface p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Warenkorb</p>
        <h2 class="mt-3 text-3xl font-semibold">Deine ausgewählten Produkte</h2>
        <p class="mt-4 max-w-3xl text-secondary">Jetzt schnell kaufen bevor jemand anderes schneller ist.</p>
      </section>

      <section *ngIf="cart() as cart" class="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div class="space-y-4">
          <article *ngFor="let item of cart.items" class="shop-card p-5">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="text-lg font-semibold">
                  <a [routerLink]="['/products', item.productSlug]" class="hover:text-primary">{{ item.productName }}</a>
                </h3>
                <p class="mt-2 text-sm text-secondary">{{ item.unitPrice | number: '1.2-2' }} {{ item.currency }} pro Stück</p>
                <p class="mt-2 inline-flex rounded-full bg-primary px-3 py-1 text-sm font-medium text-on-primary">{{ item.lineTotal | number: '1.2-2' }} {{ item.currency }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="changeQuantity(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1"
                  class="h-9 w-9 rounded-md bg-surface-high text-sm font-semibold text-on-surface disabled:opacity-40">-</button>
                <span class="min-w-10 text-center text-sm">{{ item.quantity }}</span>
                <button (click)="changeQuantity(item.id, item.quantity + 1)"
                  class="h-9 w-9 rounded-md bg-surface-high text-sm font-semibold text-on-surface">+</button>
                <button (click)="removeItem(item.id)"
                  class="ml-2 rounded-md bg-surface-container px-3 py-2 text-xs text-secondary hover:text-on-surface">Entfernen</button>
              </div>
            </div>
          </article>

          <div *ngIf="cart.items.length === 0" class="shop-card p-6 text-sm text-secondary">
            Dein Warenkorb ist aktuell leer.
          </div>
        </div>

        <aside class="shop-card-elevated h-fit p-6">
          <h3 class="text-lg font-semibold">Bestellübersicht</h3>
          <div class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-secondary">Zwischensumme</span>
              <span>{{ cart.subtotalAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
            <div class="flex justify-between" *ngIf="cart.discountAmount > 0">
              <span class="text-secondary">Rabatt<span *ngIf="cart.appliedOfferName"> ({{ cart.appliedOfferName }})</span></span>
              <span class="text-primary">-{{ cart.discountAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
            <div class="flex justify-between" *ngIf="cart.items.length > 0">
              <span class="text-secondary">Versand</span>
              <span>{{ cart.shippingAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
            <div class="border-t border-primary/15 pt-2 flex justify-between text-base font-semibold">
              <span>Gesamt</span>
              <span class="inline-flex rounded-full bg-primary px-3 py-1 text-on-primary">{{ cart.totalAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
          </div>

          <p class="mt-4 text-xs text-secondary" *ngIf="cart.items.length > 0 && !cart.freeShippingReached">
            Kostenloser Versand ab {{ cart.freeShippingThreshold | number: '1.2-2' }} {{ cart.currency }}.
          </p>
          <p class="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs text-primary" *ngIf="cart.items.length > 0 && cart.freeShippingReached">
            Kostenloser Versand aktiviert.
          </p>

          <button
            routerLink="/checkout"
            [disabled]="cart.items.length === 0"
            class="mt-5 w-full rounded-md bg-primary px-5 py-3 text-sm font-medium text-on-primary transition duration-150 hover:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Zum Checkout
          </button>
        </aside>
      </section>
    </div>
  `
})
export class CartPageComponent implements OnInit {
  readonly cart = signal<CartResponse | null>(null);

  constructor(
    private readonly api: WebshopApiService,
    private readonly cartSessionService: CartSessionService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  changeQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) {
      return;
    }
    const sessionKey = this.cartSessionService.getSessionKey();
    this.api.updateCartItem(sessionKey, itemId, quantity).subscribe((cart) => {
      this.cartSessionService.updateSessionKey(cart.sessionKey);
      this.cart.set(cart);
    });
  }

  removeItem(itemId: number): void {
    const sessionKey = this.cartSessionService.getSessionKey();
    this.api.removeCartItem(sessionKey, itemId).subscribe((cart) => {
      this.cartSessionService.updateSessionKey(cart.sessionKey);
      this.cart.set(cart);
    });
  }

  private loadCart(): void {
    const sessionKey = this.cartSessionService.getSessionKey();
    this.api.getCart(sessionKey).subscribe((cart) => {
      this.cartSessionService.updateSessionKey(cart.sessionKey);
      this.cart.set(cart);
    });
  }
}
