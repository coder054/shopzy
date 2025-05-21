"use server";

import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE, ROUTES } from "@/constants";
import { convertToPlainObject, formatError } from "../utils";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};
  const data = await prisma.product.findMany({
    where: queryFilter,
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

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({
      data: product,
    });
    revalidatePath(ROUTES.admin.products.base);
    return {
      success: true,
      message: "product created successfully",
    };
  } catch (error) {
    return { message: formatError(error), success: false };
  }
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });
    if (!productExists) {
      throw new Error("product not found");
    }
    await prisma.product.update({
      data: product,
      where: { id: product.id },
    });
    revalidatePath(ROUTES.admin.products.base);
    return {
      success: true,
      message: "product updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get single product by id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
}

export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });
  return data;
}
