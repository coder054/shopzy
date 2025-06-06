"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { PAGE_SIZE, ROUTES } from "@/constants";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { paypal } from "../paypal";
import { PaymentResult, ShippingAddress } from "@/types";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceipt } from "@/email";

export const createOrder = async () => {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("User is not authenticated");
    }
    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const user = await getUserById(userId);
    if (!cart?.items?.length) {
      return {
        success: false,
        message: "your cart is empty",
        redirectTo: ROUTES.cart,
      };
    }
    if (!user?.address) {
      return {
        success: false,
        message: "no shipping address",
        redirectTo: ROUTES.shippingAddress,
      };
    }
    if (!user?.paymentMethod) {
      return {
        success: false,
        message: "no payment method",
        redirectTo: ROUTES.paymentMethod,
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });
    // create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({ data: order });

      // create order items from the cart items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      // clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });
    if (!insertedOrderId) {
      throw new Error("Order not created");
    }
    return {
      success: true,
      message: "Order created",
      redirectTo: ROUTES.order.detail(insertedOrderId),
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: true,
    },
  });
  return convertToPlainObject(data);
}
export async function createPaypalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "",
          },
        },
      });
      return {
        success: true,
        message: "Paypal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string },
) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      throw new Error("Order not found");
    }

    // check if order is already paid
    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("error in paypal payment");
    }
    // todo update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        email_address: captureData.payer.email_address,
        status: captureData.status,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });
    revalidatePath(ROUTES.order.detail(orderId));

    return {
      success: true,
      message: "your order has been successfully paid by paypal",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  console.log("aaa updateOrderToPaid");
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
    },
  });
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    throw new Error("order is already paid");
  }
  // transaction to update the order and update the product quantities
  await prisma.$transaction(async (tx) => {
    // update all item quantities in the database
    for (const item of order.orderItems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: { stock: { increment: -item.qty } },
      });
    }
    // set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });
  // get the updated order after the transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: true,
    },
  });
  if (!updatedOrder) {
    throw new Error("order not found");
  }
  console.log("aaa updatedOrder", updatedOrder);

  sendPurchaseReceipt({
    order: {
      ...(updatedOrder as any),
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });
}

// Get User Orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

export async function getOrderSummary() {
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: "rr",
    totalSales: Number(entry.totalSales),
  }));

  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true },
      },
    },
    take: 6,
  });
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestOrders,
    salesData,
  };
}

export async function getAllOrders({
  page,
  limit = PAGE_SIZE,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const data = await prisma.order.findMany({
    where:
      query && query !== "all"
        ? {
            user: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          }
        : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });
  const dataCount = await prisma.order.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: {
        id,
      },
    });
    revalidatePath(ROUTES.admin.orders);
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(ROUTES.order.detail(orderId));
    return { success: true, message: "order paid successfully" };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      throw new Error("order not found");
    }
    if (!order.isPaid) {
      throw new Error("order is not paid");
    }
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });
    revalidatePath(ROUTES.order.detail(orderId));
    return { success: true, message: "order delivered successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
