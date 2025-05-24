import { APP_NAME, SENDER_EMAIL } from "@/constants";
import { Order } from "@/types";
import { Resend } from "resend";
import PurchaseReiceptEmail from "./purchase-receipt";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  console.log("aaa sendPurchaseReceipt");
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    subject: `Order confirmation ${order.id}`,
    to: order.user.email,
    react: <PurchaseReiceptEmail order={order} />,
  });
};
