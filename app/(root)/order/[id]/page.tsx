import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import OrderDetailsTable from "./order-details-table";
import { auth } from "@/auth";

export const metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();
  const session = await auth();

  return (
    <OrderDetailsTable
      order={
        {
          ...order,
          shippingAddress: order.shippingAddress as any,
        } as any
      }
      paypalClientId={process.env.PAYPAL_CLIENT_ID || ""}
      isAdmin={session?.user?.role === "admin"}
    />
  );
  return <>Order Details Form</>;
};

export default OrderDetailsPage;
