"use server";

import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE, ROUTES } from "@/constants";
import { convertToPlainObject, formatError } from "../utils";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

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

export async function getAllProducts({
  category,
  page,
  query,
  limit = PAGE_SIZE,
}: {
  query: string;
  limit?: number;
  page: number;
  category: string;
}) {
  const data = await prisma.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  const dataCount = await prisma.product.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }
    await prisma.product.delete({ where: { id } });
    revalidatePath(ROUTES.admin.products.base);
    return {
      success: true,
      message: "product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
