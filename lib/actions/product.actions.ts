"use server";

import { LATEST_PRODUCTS_LIMIT } from "@/constants";
import { convertToPlainObject } from "../utils";
import { prisma } from "@/db/prisma";

export async function getLatestProduct() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}
