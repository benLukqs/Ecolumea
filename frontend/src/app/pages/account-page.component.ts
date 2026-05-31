import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { signal } from '@angular/core';
import { AuthSessionService } from '../auth-session.service';
import {
  AccountAddressUpsertRequest,
  AccountAddressView,
  AccountOrderHistoryItem,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-7xl px-6 py-10 lg:px-10" *ngIf="isLoggedIn(); else loginHint">
      <section class="shop-card-surface p-8">
        <p class="text-sm uppercase tracking-[0.2em] text-secondary">Mein Konto</p>
        <h2 class="mt-3 text-3xl font-semibold">Adressen und Bestellhistorie</h2>
      </section>

      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div class="shop-card p-6">
          <h3 class="text-lg font-semibold">Adressen</h3>
          <div class="mt-4 space-y-3" *ngIf="addresses().length > 0">
            <article *ngFor="let address of addresses()" class="shop-card-elevated p-3">
              <p class="text-sm font-medium">{{ address.street }} {{ address.houseNumber }} <span *ngIf="address.isDefault" class="text-primary">(Standard)</span></p>
              <p class="mt-1 text-xs text-secondary">{{ address.postalCode }} {{ address.city }}, {{ address.countryCode }}</p>
              <button (click)="editAddress(address)" class="mt-2 rounded-md bg-surface-high px-3 py-1 text-xs">Bearbeiten</button>
            </article>
          </div>

          <div class="mt-5 grid gap-2">
            <input [(ngModel)]="form.street" placeholder="Strasse" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="form.houseNumber" placeholder="Hausnummer" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="form.postalCode" placeholder="PLZ" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="form.city" placeholder="Ort" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <input [(ngModel)]="form.countryCode" placeholder="Land (DE)" class="rounded-md bg-surface-high px-3 py-2 text-sm" />
            <label class="text-sm"><input [(ngModel)]="form.isDefault" type="checkbox" /> Als Standard setzen</label>
            <button (click)="saveAddress()" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary">{{ editingAddressId() !== null ? 'Aktualisieren' : 'Anlegen' }}</button>
          </div>
        </div>

        <div class="shop-card p-6">
          <h3 class="text-lg font-semibold">Bestellhistorie</h3>
          <div class="mt-4 space-y-3" *ngIf="orders().length > 0">
            <article *ngFor="let order of orders()" class="shop-card-elevated p-3">
              <p class="text-sm font-medium">{{ order.orderNumber }}</p>
              <p class="mt-1 text-xs text-secondary">{{ order.createdAt }} / {{ order.orderStatus }} / {{ order.paymentStatus }}</p>
              <p class="mt-1 text-sm text-primary">{{ order.totalAmount | number: '1.2-2' }} {{ order.currency }}</p>
            </article>
          </div>
        </div>
      </section>

      <p *ngIf="message()" class="mt-4 text-sm text-secondary">{{ message() }}</p>
      <p *ngIf="error()" class="mt-2 text-sm text-red-600">{{ error() }}</p>
    </div>

    <ng-template #loginHint>
      <div class="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <section class="shop-card-surface p-8">
          <h2 class="text-2xl font-semibold">Bitte anmelden</h2>
          <p class="mt-3 text-secondary">Für Konto- und Bestellübersicht bitte zuerst anmelden.</p>
          <a routerLink="/auth" class="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary">Zu Anmeldung</a>
        </section>
      </div>
    </ng-template>
  `
})
export class AccountPageComponent implements OnInit {
  readonly isLoggedIn = signal(false);
  readonly addresses = signal<AccountAddressView[]>([]);
  readonly orders = signal<AccountOrderHistoryItem[]>([]);
  readonly editingAddressId = signal<number | null>(null);
  readonly message = signal('');
  readonly error = signal('');

  form: AccountAddressUpsertRequest = {
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    countryCode: 'DE',
    isDefault: false
  };

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSessionService: AuthSessionService
  ) {}

  ngOnInit(): void {
    const token = this.authSessionService.getToken();
    this.isLoggedIn.set(token != null);
    if (token) {
      this.reloadAll(token);
    }
  }

  editAddress(address: AccountAddressView): void {
    this.editingAddressId.set(address.id);
    this.form = {
      street: address.street,
      houseNumber: address.houseNumber,
      postalCode: address.postalCode,
      city: address.city,
      countryCode: address.countryCode,
      isDefault: address.isDefault
    };
  }

  saveAddress(): void {
    const token = this.authSessionService.getToken();
    if (!token) {
      this.error.set('Nicht angemeldet.');
      return;
    }

    const editingAddressId = this.editingAddressId();
    if (editingAddressId !== null) {
      this.api.updateAccountAddress(token, editingAddressId, this.form).subscribe({
        next: () => {
          this.message.set('Adresse aktualisiert.');
          this.error.set('');
          this.editingAddressId.set(null);
          this.resetForm();
          this.reloadAll(token);
        },
        error: () => {
          this.error.set('Adresse konnte nicht aktualisiert werden.');
        }
      });
      return;
    }

    this.api.createAccountAddress(token, this.form).subscribe({
      next: () => {
        this.message.set('Adresse angelegt.');
        this.error.set('');
        this.resetForm();
        this.reloadAll(token);
      },
      error: () => {
        this.error.set('Adresse konnte nicht angelegt werden.');
      }
    });
  }

  private reloadAll(token: string): void {
    forkJoin({
      addresses: this.api.getAccountAddresses(token),
      orders: this.api.getAccountOrders(token)
    }).subscribe({
      next: ({ addresses, orders }) => {
        this.addresses.set(addresses);
        this.orders.set(orders);
      },
      error: () => {
        this.error.set('Kontodaten konnten nicht geladen werden.');
      }
    });
  }

  private resetForm(): void {
    this.form = {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      countryCode: 'DE',
      isDefault: false
    };
  }
}
