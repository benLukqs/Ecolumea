import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../auth-session.service';
import {
  AdminOrderDetailResponse,
  AdminOrderListItem,
  WebshopApiService
} from '../webshop-api.service';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl">      

      <section class="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div class="shop-card p-5">
          <h3 class="text-lg font-semibold">Bestellungen</h3>
          <div class="mt-4 space-y-3">
            <button
              *ngFor="let order of orders()"
              (click)="selectOrder(order.id)"
              class="w-full rounded-md bg-surface-container px-4 py-3 text-left transition hover:bg-surface-high"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium">{{ order.orderNumber }}</p>
                <p class="text-xs text-secondary">{{ order.createdAt }}</p>
              </div>
              <p class="mt-1 text-xs text-secondary">{{ order.guestEmail || 'Gastbestellung' }}</p>
              <p class="mt-2 text-sm text-primary">{{ order.totalAmount | number: '1.2-2' }} {{ order.currency }}</p>
              <p class="mt-1 text-xs text-secondary">{{ order.orderStatus }} / {{ order.paymentStatus }} / {{ order.shippingProvider }}</p>
            </button>
          </div>
        </div>

        <aside class="shop-card-elevated p-5" *ngIf="selectedOrder() as selectedOrder">
          <h3 class="text-lg font-semibold">Bestelldetail</h3>
          <p class="mt-2 text-sm text-secondary">{{ selectedOrder.orderNumber }}</p>

          <div class="mt-4 space-y-2 text-sm">
            <p><span class="text-secondary">Status:</span> {{ selectedOrder.orderStatus }}</p>
            <p><span class="text-secondary">Zahlung:</span> {{ selectedOrder.paymentStatus }}</p>
            <p><span class="text-secondary">Versand:</span> {{ selectedOrder.shippingProvider }}</p>
          </div>

          <div class="mt-4 shop-card p-3">
            <p class="text-xs uppercase tracking-[0.2em] text-secondary">Status ändern</p>
            <div class="mt-2 flex gap-2">
              <select [(ngModel)]="selectedNextStatus" class="w-full rounded-md bg-surface-high px-3 py-2 text-sm">
                <option *ngFor="let status of orderStatuses" [value]="status">{{ status }}</option>
              </select>
              <button
                (click)="updateStatus()"
                [disabled]="isUpdatingStatus()"
                class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40"
              >
                Speichern
              </button>
            </div>
            <p *ngIf="statusMessage()" class="mt-2 text-xs text-secondary">{{ statusMessage() }}</p>
          </div>

          <div class="mt-4 shop-card p-3">
            <p class="text-xs uppercase tracking-[0.2em] text-secondary">Lieferadresse</p>
            <p class="mt-1 whitespace-pre-line text-sm">{{ selectedOrder.shippingAddressSnapshot }}</p>
          </div>

          <div class="mt-3 shop-card p-3">
            <p class="text-xs uppercase tracking-[0.2em] text-secondary">Rechnungsadresse</p>
            <p class="mt-1 whitespace-pre-line text-sm">{{ selectedOrder.billingAddressSnapshot }}</p>
          </div>

          <div class="mt-4">
            <p class="text-xs uppercase tracking-[0.2em] text-secondary">Positionen</p>
            <ul class="mt-2 space-y-2 text-sm">
              <li *ngFor="let item of selectedOrder.items" class="flex justify-between gap-3">
                <span>{{ item.productNameSnapshot }} x{{ item.quantity }}</span>
                <span>{{ item.lineTotalSnapshot | number: '1.2-2' }} {{ selectedOrder.currency }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-4 border-t border-outline-variant/40 pt-3 space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-secondary">Zwischensumme</span>
              <span>{{ selectedOrder.subtotalAmount | number: '1.2-2' }} {{ selectedOrder.currency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary">Versand</span>
              <span>{{ selectedOrder.shippingAmount | number: '1.2-2' }} {{ selectedOrder.currency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary">Rabatt</span>
              <span>{{ selectedOrder.discountAmount | number: '1.2-2' }} {{ selectedOrder.currency }}</span>
            </div>
            <div class="flex justify-between text-base font-semibold">
              <span>Gesamt</span>
              <span class="text-primary">{{ selectedOrder.totalAmount | number: '1.2-2' }} {{ selectedOrder.currency }}</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  `
})
export class AdminOrdersPageComponent implements OnInit {
  readonly orders = signal<AdminOrderListItem[]>([]);
  readonly selectedOrder = signal<AdminOrderDetailResponse | null>(null);
  orderStatuses: string[] = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'];
  selectedNextStatus = 'PLACED';
  readonly isUpdatingStatus = signal(false);
  readonly statusMessage = signal('');
  readonly authMessage = signal('');
  private authToken: string | null = null;

  constructor(
    private readonly api: WebshopApiService,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.authToken = this.authSession.getToken();
    if (!this.authToken) {
      this.authMessage.set('Bitte anmelden, um die Admin-Bestellungen zu sehen.');
      return;
    }

    this.api.getAdminOrdersWithAuth(this.authToken).subscribe((orders) => {
      this.orders.set(orders);
      if (orders.length > 0) {
        this.selectOrder(orders[0].id);
      }
    });
  }

  selectOrder(id: number): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminOrderByIdWithAuth(id, this.authToken).subscribe((detail) => {
      this.selectedOrder.set(detail);
      this.selectedNextStatus = detail.orderStatus;
      this.statusMessage.set('');
    });
  }

  updateStatus(): void {
    const selectedOrder = this.selectedOrder();
    if (!selectedOrder) {
      return;
    }

    this.isUpdatingStatus.set(true);
    this.statusMessage.set('');
    if (!this.authToken) {
      this.statusMessage.set('Bitte anmelden.');
      this.isUpdatingStatus.set(false);
      return;
    }
    this.api.updateAdminOrderStatusWithAuth(selectedOrder.id, { orderStatus: this.selectedNextStatus }, this.authToken).subscribe({
      next: (detail) => {
        this.selectedOrder.set(detail);
        this.selectedNextStatus = detail.orderStatus;
        this.statusMessage.set('Status aktualisiert.');
        this.isUpdatingStatus.set(false);
        this.reloadOrders();
      },
      error: () => {
        this.statusMessage.set('Status konnte nicht aktualisiert werden.');
        this.isUpdatingStatus.set(false);
      }
    });
  }

  private reloadOrders(): void {
    if (!this.authToken) {
      return;
    }
    this.api.getAdminOrdersWithAuth(this.authToken).subscribe((orders) => {
      this.orders.set(orders);
    });
  }
}
