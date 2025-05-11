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
