export interface AdminNavItem {
  path: string;
  label: string;
  roles: string[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: 'orders', label: 'Bestellungen', roles: ['ADMIN_ORDER', 'SUPER_ADMIN'] },
  { path: 'products', label: 'Produkte', roles: ['ADMIN_PRODUCT', 'SUPER_ADMIN'] },
  { path: 'media', label: 'Medien', roles: ['ADMIN_PRODUCT', 'SUPER_ADMIN'] },
  { path: 'categories', label: 'Kategorien', roles: ['ADMIN_PRODUCT', 'SUPER_ADMIN'] },
  { path: 'offers', label: 'Angebote', roles: ['ADMIN_PRODUCT', 'SUPER_ADMIN'] },
  { path: 'users', label: 'Nutzer', roles: ['SUPER_ADMIN'] }
];

export function hasAnyRole(user: { roles?: string[] } | null, roles: string[]): boolean {
  if (!user || !user.roles) {
    return false;
  }

  const userRoles = user.roles;
  return roles.some((role) => userRoles.includes(role));
}

export function getVisibleAdminNavItems(user: { roles?: string[] } | null): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => hasAnyRole(user, item.roles));
}

export function getDefaultAdminNavPath(user: { roles?: string[] } | null): string {
  const firstVisibleTab = getVisibleAdminNavItems(user)[0];
  return firstVisibleTab ? firstVisibleTab.path : 'orders';
}
