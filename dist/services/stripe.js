import Stripe from "stripe";
const stripeSingleton = () => new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = globalThis.stripe ?? stripeSingleton();
export default stripe;
if (process.env.NODE_ENV !== "production")
    globalThis.stripe = stripe;
