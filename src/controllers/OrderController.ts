import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import { log } from "console";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

const stripeWebhookhandler = async (req: Request, res: Response) => {
  // console.log("RECEIVED EVENT");
  // console.log("----------------------");
  // console.log("event", req.body);
  // res.send();

  let event;

  try {
    const sig = req.headers["stripe-signature"];

    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
    // stripe will verify that the request is comming form stripe webhook.
    // if the request is commming from webhook it will construct an event.
    // this endpoint will only work if the event is comming from stripe.
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error : ${error.message}`);
  }

  if (event?.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    console.log("API- creating stripe session");

    const CheckoutSessionRequest: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(
      CheckoutSessionRequest.restaurantId
    );

    if (!restaurant) {
      throw new Error("restaurant not found");
    }

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: CheckoutSessionRequest.deliveryDetails,
      cartItems: CheckoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    // while creating a mongoose new object it will automatically provide us the id. this is will be sent to stripe session for record.

    const lineItems = createLineItems(
      CheckoutSessionRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );

    if (!session.url) {
      //this url is the url of the hosted page of the stripe that we get while creating the session.
      return res
        .status(500)
        .json({ message: "error while creating stripe session" });
    }

    await newOrder.save(); // save new order record to the database.

    res.json({ url: session.url }); // this is the ready url that user will access to input the pin number.
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  //convert cart items into stripe line items.
  // 1.for each cart item get the menu item to see the prce
  // 2. convert each cart item to stripe line item.
  // return line item array.

  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      throw new Error(`menu item not found: ${cartItem.menuItemId}`);
    }

    const Line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "hkd",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return Line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  //Sessioni sjust a data that we are creating to use in the Stripe checkout page.
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "hkd",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

export default {
  createCheckoutSession,
  stripeWebhookhandler,
};
