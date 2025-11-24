export const navigateTo = (path: string): void => {
  window.location.href = path;
};

export const NAVIGATION_PATHS = {
  HOME: "/",
  PRODUCTS: "/productos",
  CART: "/carrito",
  CONTACT: "/contacto",
  ADMIN: "/admin",
} as const;

