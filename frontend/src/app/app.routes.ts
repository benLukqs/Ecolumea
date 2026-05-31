import { Routes } from '@angular/router';
import { CategoriesPageComponent } from './pages/categories-page.component';
import { CategoryProductsPageComponent } from './pages/category-products-page.component';
import { CartPageComponent } from './pages/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page.component';
import { AdminOrdersPageComponent } from './admin/admin-orders-page.component';
import { AdminProductsPageComponent } from './admin/admin-products-page.component';
import { AdminMediaPageComponent } from './admin/admin-media-page.component';
import { AdminCategoriesPageComponent } from './admin/admin-categories-page.component';
import { AdminOffersPageComponent } from './admin/admin-offers-page.component';
import { AdminUsersPageComponent } from './admin/admin-users-page.component';
import { AdminShellComponent } from './admin/admin-shell.component';
import { AuthPageComponent } from './pages/auth-page.component';
import { AccountPageComponent } from './pages/account-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { ProductsPageComponent } from './pages/products-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page.component';
import {
  AgbPageComponent,
  ContactPageComponent,
  PrivacyPolicyPageComponent,
  ImpressumPageComponent,
  WiderrufPageComponent
} from './pages/legal/legal-pages.component';
import { requireAnyRole } from './admin-role.guard';

export const appRoutes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: 'categories', component: CategoriesPageComponent },
  { path: 'categories/:slug', component: CategoryProductsPageComponent },
  { path: 'products/:slug', component: ProductDetailPageComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [requireAnyRole(['ADMIN_ORDER', 'ADMIN_PRODUCT', 'SUPER_ADMIN'])],
    children: [
      {
        path: 'orders',
        component: AdminOrdersPageComponent,
        canActivate: [requireAnyRole(['ADMIN_ORDER', 'SUPER_ADMIN'])]
      },
      {
        path: 'products',
        component: AdminProductsPageComponent,
        canActivate: [requireAnyRole(['ADMIN_PRODUCT', 'SUPER_ADMIN'])]
      },
      {
        path: 'media',
        component: AdminMediaPageComponent,
        canActivate: [requireAnyRole(['ADMIN_PRODUCT', 'SUPER_ADMIN'])]
      },
      {
        path: 'categories',
        component: AdminCategoriesPageComponent,
        canActivate: [requireAnyRole(['ADMIN_PRODUCT', 'SUPER_ADMIN'])]
      },
      {
        path: 'offers',
        component: AdminOffersPageComponent,
        canActivate: [requireAnyRole(['ADMIN_PRODUCT', 'SUPER_ADMIN'])]
      },
      {
        path: 'users',
        component: AdminUsersPageComponent,
        canActivate: [requireAnyRole(['SUPER_ADMIN'])]
      }
    ]
  },
  { path: 'auth', component: AuthPageComponent },
  { path: 'account', component: AccountPageComponent },
  { path: 'impressum', component: ImpressumPageComponent },
  { path: 'datenschutz', component: PrivacyPolicyPageComponent },
  { path: 'agb', component: AgbPageComponent },
  { path: 'widerruf', component: WiderrufPageComponent },
  { path: 'kontakt', component: ContactPageComponent },
  { path: '**', redirectTo: '' }
];
