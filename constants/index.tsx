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
