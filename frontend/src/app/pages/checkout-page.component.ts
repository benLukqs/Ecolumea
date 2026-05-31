import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../auth-session.service';
import {
  AccountAddressView,
  CartResponse,
  OrderConfirmationResponse,
  WebshopApiService
} from '../webshop-api.service';
import { CartSessionService } from '../cart-session.service';

interface AddressForm {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10" *ngIf="cart() as cart">
      <section class="shop-card-surface p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h2 class="mt-3 text-3xl font-semibold">Bestellung abschliessen</h2>
        <p class="mt-4 max-w-3xl text-secondary">
          MVP-Modus: Zahlungsstatus wird simuliert. Adresse, Versandanbieter und Bestellübersicht sind transparent dargestellt.
        </p>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div class="space-y-4">
          <div class="shop-card p-6">
            <h3 class="text-lg font-semibold">Lieferadresse</h3>
            <div *ngIf="isLoggedIn() && addresses().length > 1" class="mt-3">
              <label class="text-sm font-medium text-secondary" for="shippingAddressSelect">Gespeicherte Adresse</label>
              <select
                id="shippingAddressSelect"
                [(ngModel)]="selectedShippingAddressId"
                (ngModelChange)="onShippingAddressSelectionChange($event)"
                class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm"
              >
                <option *ngFor="let address of addresses()" [ngValue]="address.id">
                  {{ addressSummary(address) }}{{ address.isDefault ? ' (Standard)' : '' }}
                </option>
              </select>
              <p class="mt-2 text-xs text-secondary">Du kannst hier eine andere gespeicherte Lieferadresse auswählen.</p>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-secondary" for="shippingStreet">Strasse</label>
                <input id="shippingStreet" [(ngModel)]="shippingAddress.street" (ngModelChange)="onShippingAddressChange()" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="Strasse" />
              </div>
              <div>
                <label class="text-sm font-medium text-secondary" for="shippingHouseNumber">Hausnummer</label>
                <input id="shippingHouseNumber" [(ngModel)]="shippingAddress.houseNumber" (ngModelChange)="onShippingAddressChange()" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="Hausnummer" />
              </div>
              <div>
                <label class="text-sm font-medium text-secondary" for="shippingPostalCode">PLZ</label>
                <input id="shippingPostalCode" [(ngModel)]="shippingAddress.postalCode" (ngModelChange)="onShippingAddressChange()" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="PLZ" />
              </div>
              <div>
                <label class="text-sm font-medium text-secondary" for="shippingCity">Ort</label>
                <input id="shippingCity" [(ngModel)]="shippingAddress.city" (ngModelChange)="onShippingAddressChange()" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="Ort" />
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-secondary" for="shippingCountryCode">Land</label>
                <input id="shippingCountryCode" [(ngModel)]="shippingAddress.countryCode" (ngModelChange)="onShippingAddressChange()" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="DE" />
              </div>
            </div>
          </div>

          <div class="shop-card p-6">
            <h3 class="text-lg font-semibold">Versand</h3>
            <select [(ngModel)]="shippingProvider" class="mt-3 w-full rounded-md bg-surface-high px-3 py-2 text-sm">
              <option value="DHL_STANDARD">DHL Standard</option>
              <option value="HERMES_STANDARD">Hermes Standard</option>
            </select>
          </div>

          <div class="shop-card p-6">
            <h3 class="text-lg font-semibold">Rechnung & Zahlung</h3>
            <label class="mt-3 block text-sm font-medium text-secondary" for="guestEmail">E-Mail-Adresse für die Rechnung</label>
            <input
              id="guestEmail"
              [(ngModel)]="guestEmail"
              type="email"
              class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm"
              placeholder="E-Mail für Bestellbestätigung"
            />
            <label class="mt-4 flex items-center gap-2 text-sm text-secondary">
              <input [(ngModel)]="billingAddressDiffers" (ngModelChange)="onBillingAddressModeChange($event)" type="checkbox" />
              Rechnungsadresse weicht von der Lieferadresse ab
            </label>

            <div *ngIf="billingAddressDiffers" class="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label class="text-sm font-medium text-secondary" for="billingStreet">Strasse</label>
                <input id="billingStreet" [(ngModel)]="billingAddress.street" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="Strasse" />
              </div>
              <div>
                <label class="text-sm font-medium text-secondary" for="billingHouseNumber">Hausnummer</label>
                <input id="billingHouseNumber" [(ngModel)]="billingAddress.houseNumber" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="Hausnummer" />
              </div>
              <div>
                <label class="text-sm font-medium text-secondary" for="billingPostalCode">PLZ</label>
                <input id="billingPostalCode" [(ngModel)]="billingAddress.postalCode" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="PLZ" />
              </div>
              <div>
                <label class="text-sm font-medium text-secondary" for="billingCity">Ort</label>
                <input id="billingCity" [(ngModel)]="billingAddress.city" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="Ort" />
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-secondary" for="billingCountryCode">Land</label>
                <input id="billingCountryCode" [(ngModel)]="billingAddress.countryCode" class="mt-2 w-full rounded-md bg-surface-high px-3 py-2 text-sm" placeholder="DE" />
              </div>
            </div>
            <div class="mt-3 rounded-md border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-secondary">
              <div class="flex items-center justify-between gap-3">
                <span class="font-semibold uppercase tracking-[0.18em] text-xs text-secondary">Zahlungsmethode</span>
                <span class="inline-flex rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-on-primary shadow-sm">PayPal</span>
              </div>
            </div>
            <label *ngIf="!isLoggedIn()" class="mt-4 flex items-start gap-2 text-xs text-secondary">
              <input [(ngModel)]="guestPrivacyAccepted" type="checkbox" />
              <span>
                Ich stimme der
                <a routerLink="/datenschutz" class="font-semibold text-primary hover:underline">Datenschutzerklärung</a>
                zu.
              </span>
            </label>
          </div>
        </div>

        <aside class="shop-card-elevated h-fit p-6">
          <h3 class="text-lg font-semibold">Bestellübersicht</h3>
          <p *ngIf="cart.items.length === 0" class="mt-3 text-sm text-secondary">Dein Warenkorb ist leer.</p>
          <ul class="mt-4 space-y-2 text-sm">
            <li *ngFor="let item of cart.items" class="flex justify-between gap-3">
              <span class="text-secondary">{{ item.productName }} x{{ item.quantity }}</span>
              <span>{{ item.lineTotal | number: '1.2-2' }} {{ item.currency }}</span>
            </li>
          </ul>

          <div class="mt-4 border-t border-outline-variant/40 pt-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-secondary">Zwischensumme</span>
              <span>{{ cart.subtotalAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
            <div class="flex justify-between" *ngIf="cart.items.length > 0">
              <span class="text-secondary">Versand</span>
              <span>{{ cart.shippingAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
            <div class="flex justify-between text-base font-semibold">
              <span>Gesamt</span>
              <span class="inline-flex rounded-full bg-primary px-3 py-1 text-on-primary">{{ cart.totalAmount | number: '1.2-2' }} {{ cart.currency }}</span>
            </div>
          </div>

          <button
            (click)="submitOrder()"
            [disabled]="isSubmitting() || cart.items.length === 0"
            class="mt-5 w-full rounded-md bg-primary px-5 py-3 text-sm font-medium text-on-primary transition duration-150 hover:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Bestellung verbindlich abschicken
          </button>
          <p *ngIf="errorMessage()" class="mt-3 text-xs text-red-600">{{ errorMessage() }}</p>
          <div *ngIf="orderConfirmation() as confirmation" class="mt-4 rounded-md border border-primary/15 bg-primary/5 p-3 text-sm">
            <p class="font-semibold">Bestellung erfolgreich</p>
            <p class="mt-1 text-secondary">Bestellnummer: {{ confirmation.orderNumber }}</p>
            <p class="text-secondary">Status: {{ confirmation.orderStatus }} / {{ confirmation.paymentStatus }}</p>
          </div>
          <a routerLink="/cart" class="mt-3 inline-flex text-sm text-secondary hover:text-on-surface">Zurück zum Warenkorb</a>
        </aside>
      </section>
    </div>
  `
})
export class CheckoutPageComponent implements OnInit {
  readonly cart = signal<CartResponse | null>(null);
  readonly isLoggedIn = signal(false);
  readonly addresses = signal<AccountAddressView[]>([]);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly orderConfirmation = signal<OrderConfirmationResponse | null>(null);
  selectedShippingAddressId: number | null = null;
  guestEmail = '';
  shippingAddress: AddressForm = this.createEmptyAddress();
  billingAddress: AddressForm = this.createEmptyAddress();
  billingAddressDiffers = false;
  shippingProvider = 'DHL_STANDARD';
  guestPrivacyAccepted = false;

  constructor(
    private readonly api: WebshopApiService,
    private readonly cartSessionService: CartSessionService,
    private readonly authSessionService: AuthSessionService
  ) {}

  ngOnInit(): void {
    const authToken = this.authSessionService.getToken();
    this.isLoggedIn.set(authToken != null);

    const user = this.authSessionService.getUser();
    if (user?.email) {
      this.guestEmail = user.email;
    }

    const sessionKey = this.cartSessionService.getSessionKey();
    this.api.getCart(sessionKey).subscribe((cart) => {
      this.cartSessionService.updateSessionKey(cart.sessionKey);
      this.cart.set(cart);
    });

    if (authToken) {
      this.api.getAccountAddresses(authToken).subscribe((addresses) => {
        this.addresses.set(addresses);
        const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
        if (defaultAddress) {
          this.selectedShippingAddressId = defaultAddress.id;
          this.shippingAddress = this.addressToForm(defaultAddress);
          this.billingAddress = this.addressToForm(defaultAddress);
        }
      });
    }
  }

  submitOrder(): void {
    const cart = this.cart();
    if (!cart) {
      return;
    }
    if (cart.items.length === 0) {
      this.errorMessage.set('Der Warenkorb ist leer.');
      return;
    }
    const billingAddress = this.billingAddressDiffers ? this.billingAddress : this.shippingAddress;
    if (!this.isAddressComplete(this.shippingAddress) || !this.isAddressComplete(billingAddress) || !this.guestEmail.trim()) {
      this.errorMessage.set('Bitte E-Mail sowie alle Felder für Liefer- und Rechnungsadresse ausfüllen.');
      return;
    }
    if (!this.isLoggedIn() && !this.guestPrivacyAccepted) {
      this.errorMessage.set('Bitte stimme der Datenschutzerklärung zu.');
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const request = {
      sessionKey: this.cartSessionService.getSessionKey(),
      guestEmail: this.guestEmail.trim(),
      shippingAddressSnapshot: this.formatAddressSnapshot(this.shippingAddress),
      billingAddressSnapshot: this.formatAddressSnapshot(billingAddress),
      shippingProvider: this.shippingProvider,
      privacyAccepted: this.isLoggedIn() ? null : this.guestPrivacyAccepted
    };

    const authToken = this.authSessionService.getToken();
    const placeOrder$ = authToken
      ? this.api.placeOrderWithAuth(request, authToken)
      : this.api.placeOrder(request);

    placeOrder$.subscribe({
      next: (confirmation) => {
        this.orderConfirmation.set(confirmation);
        this.isSubmitting.set(false);
        this.reloadCart();
      },
      error: () => {
        this.errorMessage.set('Bestellung konnte nicht abgeschlossen werden. Bitte Eingaben prüfen und erneut versuchen.');
        this.isSubmitting.set(false);
      }
    });
  }

  private reloadCart(): void {
    const sessionKey = this.cartSessionService.getSessionKey();
    this.api.getCart(sessionKey).subscribe((cart) => {
      this.cartSessionService.updateSessionKey(cart.sessionKey);
      this.cart.set(cart);
    });
  }

  onShippingAddressSelectionChange(addressId: number | null): void {
    const selectedAddress = this.addresses().find((address) => address.id === addressId);
    if (!selectedAddress) {
      return;
    }

    this.selectedShippingAddressId = selectedAddress.id;
    this.shippingAddress = this.addressToForm(selectedAddress);
    if (!this.billingAddressDiffers) {
      this.billingAddress = this.addressToForm(selectedAddress);
    }
  }

  onBillingAddressModeChange(differs: boolean): void {
    this.billingAddressDiffers = differs;
    if (!differs) {
      this.billingAddress = { ...this.shippingAddress };
    }
  }

  onShippingAddressChange(): void {
    if (!this.billingAddressDiffers) {
      this.billingAddress = { ...this.shippingAddress };
    }
  }

  private addressToForm(address: AccountAddressView): AddressForm {
    return {
      street: address.street,
      houseNumber: address.houseNumber,
      postalCode: address.postalCode,
      city: address.city,
      countryCode: address.countryCode
    };
  }

  private createEmptyAddress(): AddressForm {
    return {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      countryCode: 'DE'
    };
  }

  private isAddressComplete(address: AddressForm): boolean {
    return [address.street, address.houseNumber, address.postalCode, address.city, address.countryCode].every((value) => value.trim().length > 0);
  }

  private formatAddressSnapshot(address: AddressForm): string {
    const parts = [
      `${address.street.trim()} ${address.houseNumber.trim()}`.trim(),
      `${address.postalCode.trim()} ${address.city.trim()}`.trim(),
      address.countryCode.trim().toUpperCase()
    ].filter((part) => part.length > 0);

    return parts.join(', ');
  }

  addressSummary(address: AccountAddressView): string {
    return `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}, ${address.countryCode}`;
  }
}
