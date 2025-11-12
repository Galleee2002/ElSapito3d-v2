import { lazy } from "react";

export const HomePage = lazy(() => import("./HomePage"));
export const ProductsPage = lazy(() => import("./ProductsPage"));
export const AdminPage = lazy(() => import("./AdminPage"));
export const CartPage = lazy(() => import("./CartPage"));
export const PaymentSuccessPage = lazy(() => import("./PaymentSuccessPage"));
export const PaymentFailurePage = lazy(() => import("./PaymentFailurePage"));
export const PaymentPendingPage = lazy(() => import("./PaymentPendingPage"));
