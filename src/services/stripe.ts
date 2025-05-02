import Stripe from "stripe";

const stripeSingleton = () => new Stripe(process.env.STRIPE_SECRET_KEY as string);

declare global {
  // eslint-disable-next-line no-var
  var stripe: undefined | ReturnType<typeof stripeSingleton>;
}

const stripe = globalThis.stripe ?? stripeSingleton();

export default stripe;

if (process.env.NODE_ENV !== "production") globalThis.stripe = stripe;
