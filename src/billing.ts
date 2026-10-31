import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });

export async function createCustomer(email: string): Promise<string> {
  const customer = await stripe.customers.create({ email });
  if (customer.tax_exempt === "exempt") console.log("tax exempt customer", customer.id);
  return customer.id;
}

export async function startCheckout(priceId: string, returnUrl: string): Promise<string | null> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded",
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: returnUrl,
  });
  if (session.ui_mode === "embedded") return session.client_secret;
  return session.url;
}
