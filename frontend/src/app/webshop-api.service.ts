import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategorySummary {
  name: string;
  slug: string;
  description: string;
  sustainabilityAspect: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductSummary {
  name: string;
  slug: string;
  shortDescription: string;
  primaryImageUrl: string | null;
  stockQuantity: number;
  price: number;
  currency: string;
  offerPrice: number;
  discountAmount: number;
  appliedOfferName: string | null;
  hasOffer: boolean;
  materialOrigin: string;
  manufacturingProcess: string;
  sustainabilityImpact: string;
  featured: boolean;
  categorySlug: string;
}

export interface ProductDetail {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  primaryImageUrl: string | null;
  galleryImageUrls: string[];
  stockQuantity: number;
  price: number;
  currency: string;
  offerPrice: number;
  discountAmount: number;
  appliedOfferName: string | null;
  hasOffer: boolean;
  materialOrigin: string;
  manufacturingProcess: string;
  sustainabilityImpact: string;
  featured: boolean;
  categorySlug: string;
  categoryName: string;
}

export interface HomeResponse {
  concept: string;
  featuredProducts: ProductSummary[];
  categories: CategorySummary[];
  sustainability: string[];
}

export interface CartItem {
  id: number;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface CartResponse {
  cartId: number;
  sessionKey: string;
  items: CartItem[];
  subtotalAmount: number;
  discountAmount: number;
  appliedOfferName: string | null;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  freeShippingThreshold: number;
  freeShippingReached: boolean;
}

export interface PlaceOrderRequest {
  sessionKey: string;
  guestEmail: string;
  shippingAddressSnapshot: string;
  billingAddressSnapshot: string;
  shippingProvider: string;
  privacyAccepted: boolean | null;
}

export interface AuthUserView {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface AuthResponse {
  authToken: string;
  user: AuthUserView;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  privacyAccepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AccountAddressView {
  id: number;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
  isDefault: boolean;
}

export interface AccountAddressUpsertRequest {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
  isDefault: boolean;
}

export interface AccountOrderHistoryItem {
  id: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingProvider: string;
  createdAt: string;
}

export interface OrderConfirmationResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingProvider: string;
}

export interface AdminOrderListItem {
  id: number;
  orderNumber: string;
  guestEmail: string;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingProvider: string;
  createdAt: string;
}

export interface AdminOrderItemView {
  id: number;
  productNameSnapshot: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineTotalSnapshot: number;
}

export interface AdminOrderDetailResponse {
  id: number;
  orderNumber: string;
  guestEmail: string;
  shippingAddressSnapshot: string;
  billingAddressSnapshot: string;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingProvider: string;
  createdAt: string;
  items: AdminOrderItemView[];
}

export interface AdminUpdateOrderStatusRequest {
  orderStatus: string;
}

export interface AdminProductView {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  currency: string;
  materialOrigin: string;
  manufacturingProcess: string;
  sustainabilityImpact: string;
  featured: boolean;
  active: boolean;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
}

export interface AdminCategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface AdminProductUpsertRequest {
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  currency: string;
  materialOrigin: string;
  manufacturingProcess: string;
  sustainabilityImpact: string;
  featured: boolean;
  active: boolean;
  stockQuantity: number;
}

export interface AdminMediaProductOption {
  id: number;
  name: string;
  slug: string;
}

export interface AdminProductImageView {
  id: number;
  productId: number;
  fileName: string;
  title: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  imageUrl: string;
}

export interface AdminCategoryView {
  id: number;
  name: string;
  slug: string;
  description: string;
  sustainabilityAspect: string;
  sortOrder: number;
  active: boolean;
}

export interface AdminCategoryUpsertRequest {
  name: string;
  slug: string;
  description: string;
  sustainabilityAspect: string;
  sortOrder: number;
  active: boolean;
}

export interface AdminOfferView {
  id: number;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  targetType: string;
  targetCategoryId: number | null;
  targetProductId: number | null;
  teaserText: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

export interface AdminOfferUpsertRequest {
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  targetType: string;
  targetCategoryId: number | null;
  targetProductId: number | null;
  teaserText: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}


export interface AdminUserSummary {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  active: boolean;
  roles: string[];
}

export interface AdminPasswordResetResponse {
  userId: number;
  temporaryPassword: string;
}

export interface AdminRoleSummary {
  code: string;
  name: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class WebshopApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private readonly httpClient: HttpClient) {}

  getHome(): Observable<HomeResponse> {
    return this.httpClient.get<HomeResponse>(`${this.baseUrl}/home`);
  }

  getCategories(): Observable<CategorySummary[]> {
    return this.httpClient.get<CategorySummary[]>(`${this.baseUrl}/catalog/categories`);
  }

  getFeaturedProducts(): Observable<ProductSummary[]> {
    return this.httpClient.get<ProductSummary[]>(`${this.baseUrl}/catalog/featured`);
  }

  getProductsByCategory(slug: string): Observable<ProductSummary[]> {
    return this.httpClient.get<ProductSummary[]>(`${this.baseUrl}/catalog/categories/${slug}/products`);
  }

  getCategoryBySlug(slug: string): Observable<CategorySummary> {
    return this.httpClient.get<CategorySummary>(`${this.baseUrl}/catalog/categories/${slug}`);
  }

  getProductBySlug(slug: string): Observable<ProductDetail> {
    return this.httpClient.get<ProductDetail>(`${this.baseUrl}/catalog/products/${slug}`);
  }

  getCart(sessionKey: string): Observable<CartResponse> {
    return this.httpClient.get<CartResponse>(`${this.baseUrl}/cart`, { params: { sessionKey } });
  }

  addToCart(sessionKey: string, productSlug: string, quantity: number): Observable<CartResponse> {
    return this.httpClient.post<CartResponse>(`${this.baseUrl}/cart/items`, { sessionKey, productSlug, quantity });
  }

  updateCartItem(sessionKey: string, itemId: number, quantity: number): Observable<CartResponse> {
    return this.httpClient.patch<CartResponse>(`${this.baseUrl}/cart/items/${itemId}`, { sessionKey, quantity });
  }

  removeCartItem(sessionKey: string, itemId: number): Observable<CartResponse> {
    return this.httpClient.delete<CartResponse>(`${this.baseUrl}/cart/items/${itemId}`, { params: { sessionKey } });
  }

  placeOrder(request: PlaceOrderRequest): Observable<OrderConfirmationResponse> {
    return this.httpClient.post<OrderConfirmationResponse>(`${this.baseUrl}/checkout/orders`, request);
  }

  placeOrderWithAuth(request: PlaceOrderRequest, authToken: string): Observable<OrderConfirmationResponse> {
    return this.httpClient.post<OrderConfirmationResponse>(`${this.baseUrl}/checkout/orders`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.baseUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.baseUrl}/auth/login`, request);
  }

  me(authToken: string): Observable<AuthUserView> {
    return this.httpClient.get<AuthUserView>(`${this.baseUrl}/auth/me`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  logout(authToken: string): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/auth/logout`, {}, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAccountAddresses(authToken: string): Observable<AccountAddressView[]> {
    return this.httpClient.get<AccountAddressView[]>(`${this.baseUrl}/account/addresses`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  createAccountAddress(authToken: string, request: AccountAddressUpsertRequest): Observable<AccountAddressView> {
    return this.httpClient.post<AccountAddressView>(`${this.baseUrl}/account/addresses`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  updateAccountAddress(authToken: string, id: number, request: AccountAddressUpsertRequest): Observable<AccountAddressView> {
    return this.httpClient.put<AccountAddressView>(`${this.baseUrl}/account/addresses/${id}`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAccountOrders(authToken: string): Observable<AccountOrderHistoryItem[]> {
    return this.httpClient.get<AccountOrderHistoryItem[]>(`${this.baseUrl}/account/orders`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminOrders(): Observable<AdminOrderListItem[]> {
    throw new Error('Use getAdminOrdersWithAuth(authToken)');
  }

  getAdminOrdersWithAuth(authToken: string): Observable<AdminOrderListItem[]> {
    return this.httpClient.get<AdminOrderListItem[]>(`${this.baseUrl}/admin/orders`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminOrderById(id: number): Observable<AdminOrderDetailResponse> {
    throw new Error('Use getAdminOrderByIdWithAuth(id, authToken)');
  }

  getAdminOrderByIdWithAuth(id: number, authToken: string): Observable<AdminOrderDetailResponse> {
    return this.httpClient.get<AdminOrderDetailResponse>(`${this.baseUrl}/admin/orders/${id}`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  updateAdminOrderStatus(id: number, request: AdminUpdateOrderStatusRequest): Observable<AdminOrderDetailResponse> {
    throw new Error('Use updateAdminOrderStatusWithAuth(id, request, authToken)');
  }

  updateAdminOrderStatusWithAuth(id: number, request: AdminUpdateOrderStatusRequest, authToken: string): Observable<AdminOrderDetailResponse> {
    return this.httpClient.patch<AdminOrderDetailResponse>(`${this.baseUrl}/admin/orders/${id}/status`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminProducts(): Observable<AdminProductView[]> {
    throw new Error('Use getAdminProductsWithAuth(authToken)');
  }

  getAdminProductsWithAuth(authToken: string): Observable<AdminProductView[]> {
    return this.httpClient.get<AdminProductView[]>(`${this.baseUrl}/admin/products`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminProductById(id: number): Observable<AdminProductView> {
    throw new Error('Use getAdminProductByIdWithAuth(id, authToken)');
  }

  getAdminProductByIdWithAuth(id: number, authToken: string): Observable<AdminProductView> {
    return this.httpClient.get<AdminProductView>(`${this.baseUrl}/admin/products/${id}`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminProductCategories(): Observable<AdminCategoryOption[]> {
    throw new Error('Use getAdminProductCategoriesWithAuth(authToken)');
  }

  getAdminProductCategoriesWithAuth(authToken: string): Observable<AdminCategoryOption[]> {
    return this.httpClient.get<AdminCategoryOption[]>(`${this.baseUrl}/admin/products/categories`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminMediaProducts(): Observable<AdminMediaProductOption[]> {
    throw new Error('Use getAdminMediaProductsWithAuth(authToken)');
  }

  getAdminMediaProductsWithAuth(authToken: string): Observable<AdminMediaProductOption[]> {
    return this.httpClient.get<AdminMediaProductOption[]>(`${this.baseUrl}/admin/media/products`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminProductImagesWithAuth(productId: number, authToken: string): Observable<AdminProductImageView[]> {
    return this.httpClient.get<AdminProductImageView[]>(`${this.baseUrl}/admin/media/products/${productId}/images`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  uploadAdminProductImageWithAuth(
    productId: number,
    file: File,
    title: string,
    altText: string,
    sortOrder: number,
    isPrimary: boolean,
    authToken: string
  ): Observable<AdminProductImageView> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    if (altText) {
      formData.append('altText', altText);
    }
    formData.append('sortOrder', String(sortOrder ?? 0));
    formData.append('isPrimary', String(isPrimary));

    return this.httpClient.post<AdminProductImageView>(`${this.baseUrl}/admin/media/products/${productId}/images`, formData, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  setAdminProductImagePrimaryWithAuth(imageId: number, authToken: string): Observable<AdminProductImageView> {
    return this.httpClient.put<AdminProductImageView>(`${this.baseUrl}/admin/media/images/${imageId}/primary`, {}, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  deleteAdminProductImageWithAuth(imageId: number, authToken: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/admin/media/images/${imageId}`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  createAdminProduct(request: AdminProductUpsertRequest): Observable<AdminProductView> {
    throw new Error('Use createAdminProductWithAuth(request, authToken)');
  }

  createAdminProductWithAuth(request: AdminProductUpsertRequest, authToken: string): Observable<AdminProductView> {
    return this.httpClient.post<AdminProductView>(`${this.baseUrl}/admin/products`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  updateAdminProduct(id: number, request: AdminProductUpsertRequest): Observable<AdminProductView> {
    throw new Error('Use updateAdminProductWithAuth(id, request, authToken)');
  }

  updateAdminProductWithAuth(id: number, request: AdminProductUpsertRequest, authToken: string): Observable<AdminProductView> {
    return this.httpClient.put<AdminProductView>(`${this.baseUrl}/admin/products/${id}`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminCategories(): Observable<AdminCategoryView[]> {
    throw new Error('Use getAdminCategoriesWithAuth(authToken)');
  }

  getAdminCategoriesWithAuth(authToken: string): Observable<AdminCategoryView[]> {
    return this.httpClient.get<AdminCategoryView[]>(`${this.baseUrl}/admin/categories`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminCategoryById(id: number): Observable<AdminCategoryView> {
    throw new Error('Use getAdminCategoryByIdWithAuth(id, authToken)');
  }

  getAdminCategoryByIdWithAuth(id: number, authToken: string): Observable<AdminCategoryView> {
    return this.httpClient.get<AdminCategoryView>(`${this.baseUrl}/admin/categories/${id}`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  createAdminCategory(request: AdminCategoryUpsertRequest): Observable<AdminCategoryView> {
    throw new Error('Use createAdminCategoryWithAuth(request, authToken)');
  }

  createAdminCategoryWithAuth(request: AdminCategoryUpsertRequest, authToken: string): Observable<AdminCategoryView> {
    return this.httpClient.post<AdminCategoryView>(`${this.baseUrl}/admin/categories`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  updateAdminCategory(id: number, request: AdminCategoryUpsertRequest): Observable<AdminCategoryView> {
    throw new Error('Use updateAdminCategoryWithAuth(id, request, authToken)');
  }

  updateAdminCategoryWithAuth(id: number, request: AdminCategoryUpsertRequest, authToken: string): Observable<AdminCategoryView> {
    return this.httpClient.put<AdminCategoryView>(`${this.baseUrl}/admin/categories/${id}`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminOffers(): Observable<AdminOfferView[]> {
    throw new Error('Use getAdminOffersWithAuth(authToken)');
  }

  getAdminOffersWithAuth(authToken: string): Observable<AdminOfferView[]> {
    return this.httpClient.get<AdminOfferView[]>(`${this.baseUrl}/admin/offers`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminOfferById(id: number): Observable<AdminOfferView> {
    throw new Error('Use getAdminOfferByIdWithAuth(id, authToken)');
  }

  getAdminOfferByIdWithAuth(id: number, authToken: string): Observable<AdminOfferView> {
    return this.httpClient.get<AdminOfferView>(`${this.baseUrl}/admin/offers/${id}`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  createAdminOffer(request: AdminOfferUpsertRequest): Observable<AdminOfferView> {
    throw new Error('Use createAdminOfferWithAuth(request, authToken)');
  }

  createAdminOfferWithAuth(request: AdminOfferUpsertRequest, authToken: string): Observable<AdminOfferView> {
    return this.httpClient.post<AdminOfferView>(`${this.baseUrl}/admin/offers`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  updateAdminOffer(id: number, request: AdminOfferUpsertRequest): Observable<AdminOfferView> {
    throw new Error('Use updateAdminOfferWithAuth(id, request, authToken)');
  }

  updateAdminOfferWithAuth(id: number, request: AdminOfferUpsertRequest, authToken: string): Observable<AdminOfferView> {
    return this.httpClient.put<AdminOfferView>(`${this.baseUrl}/admin/offers/${id}`, request, {
      headers: { 'X-Auth-Token': authToken }
    });
  }


  getAdminUsersWithAuth(authToken: string): Observable<AdminUserSummary[]> {
    return this.httpClient.get<AdminUserSummary[]>(`${this.baseUrl}/admin/users`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  getAdminRolesWithAuth(authToken: string): Observable<AdminRoleSummary[]> {
    return this.httpClient.get<AdminRoleSummary[]>(`${this.baseUrl}/admin/users/roles`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  resetAdminUserPasswordWithAuth(userId: number, authToken: string): Observable<AdminPasswordResetResponse> {
    return this.httpClient.post<AdminPasswordResetResponse>(`${this.baseUrl}/admin/users/${userId}/reset-password`, {}, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  assignAdminUserRoleWithAuth(userId: number, roleCode: string, authToken: string): Observable<AdminUserSummary> {
    return this.httpClient.post<AdminUserSummary>(`${this.baseUrl}/admin/users/${userId}/roles/${roleCode}`, {}, {
      headers: { 'X-Auth-Token': authToken }
    });
  }

  removeAdminUserRoleWithAuth(userId: number, roleCode: string, authToken: string): Observable<AdminUserSummary> {
    return this.httpClient.delete<AdminUserSummary>(`${this.baseUrl}/admin/users/${userId}/roles/${roleCode}`, {
      headers: { 'X-Auth-Token': authToken }
    });
  }
}
