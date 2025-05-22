import { ShippingAddress } from "@/types";
import { z } from "zod";
export const APP_NAME = "Shopzy";
export const APP_DESCRIPTION = "A modern shop";
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "";

export const ROUTES = {
  home: "/",
  cart: "/cart",
  signIn: "/sign-in",
  product: {
    detail: (slug: string) => `/product/${slug}`,
  },
  shippingAddress: "/shipping-address",
  paymentMethod: "/payment-method",
  placeOrder: "/place-order",
  order: {
    detail: (id: string) => `/order/${id}`,
  },
  admin: {
    overview: "/admin/overview",
    products: {
      base: "/admin/products",
      create: "/admin/products/create",
    },
    orders: "/admin/orders",
    users: "/admin/users",
  },
};

export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
  email: "",
  password: "",
};
export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

declare global {
  interface Window {
    z: typeof z;
  }
}

if (typeof window !== "undefined") {
  window.z = z;
}

export const shippingAddressDefaultValues: ShippingAddress = {
  fullName: "John Doe",
  streetAddress: "123 Main St",
  city: "Anytown",
  postalCode: "12345",
  country: "USA",
};

export const PAYMENT_METHODS = process.env.NEXT_PUBLIC_PAYMENT_METHODS
  ? process.env.NEXT_PUBLIC_PAYMENT_METHODS.split(", ")
  : [];

export const DEFAULT_PAYMENT_METHOD =
  process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10;

export const productDefaultValues = {
  name: "",
  slug: "",
  category: "",
  images: [],
  brand: "",
  description: "",
  price: "0",
  stock: 0,
  rating: "0",
  numReviews: "0",
  isFeatured: false,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};
