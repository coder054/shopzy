import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

import {
  approvePaypalOrder,
  createPaypalOrder,
} from "@/lib/actions/order.actions";
