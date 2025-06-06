import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { formatCurrency } from "@/lib/utils";
import { ShippingAddress } from "@/types";
import { ROUTES } from "@/constants";
import { Nothing } from "@/lib/Maybe";
import { headers } from "next/headers";

import queryString from "query-string";
import PlaceOrderForm from "./place-order-form";

export const metadata = {
  title: "Place Order",
};

const PlaceOrderPage = async () => {
  const headersList = await headers();
  const pathname = headersList.get("x-current-path") || "";
  const cart = await getMyCart();

  const user = await getCurrentUser();

  if (user instanceof Nothing) {
    const target = queryString.stringifyUrl({
      url: ROUTES.signIn,
      query: { callbackUrl: pathname },
    });
    return redirect(target);
  }
  if (!cart || cart.items.length === 0) redirect(ROUTES.cart);
  if (!user.value.address) redirect(ROUTES.shippingAddress);
  if (!user.value.paymentMethod) redirect(ROUTES.paymentMethod);

  const userAddress = user.value.address as ShippingAddress;

  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl">Place Order</h1>

      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city},{" "}
                {userAddress.postalCode}, {userAddress.country}{" "}
              </p>
              <div className="mt-3">
                <Link href={ROUTES.shippingAddress}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>{" "}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{user.value.paymentMethod}</p>
              <div className="mt-3">
                <Link href={ROUTES.paymentMethod}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>{" "}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={ROUTES.product.detail(item.slug)}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Link href={ROUTES.cart}>
                <Button variant="outline">Edit</Button>
              </Link>
            </CardContent>
          </Card>{" "}
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm />
            </CardContent>
          </Card>
        </div>{" "}
      </div>
    </>
  );
};

export default PlaceOrderPage;
