import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { auth } from "@/auth";
import Stripe from "stripe";

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
  let client_secret = null;

  // check if using stripe and not paid
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    // initial stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    // create a new payment intent

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: {
        orderId: order.id,
      },
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={
        {
          ...order,
          shippingAddress: order.shippingAddress as any,
        } as any
      }
      paypalClientId={process.env.PAYPAL_CLIENT_ID || ""}
      stripeClientSecret={client_secret || ""}
      isAdmin={session?.user?.role === "admin"}
    />
  );
};

export default OrderDetailsPage;
