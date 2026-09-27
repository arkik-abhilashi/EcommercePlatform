import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

export const stripe = process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.startsWith("your_")
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export default stripe;