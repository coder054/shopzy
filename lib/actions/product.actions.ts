"use server";

import { LATEST_PRODUCTS_LIMIT } from "@/constants";
import { convertToPlainObject } from "../utils";
import { prisma } from "@/db/prisma";
import { equal } from "node:assert";

export async function getLatestProduct() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}
export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findFirst({
    where: { slug: slug },
  });

  return convertToPlainObject(data);
}
