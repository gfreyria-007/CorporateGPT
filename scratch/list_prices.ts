import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

async function listPrices() {
  try {
    const prices = await stripe.prices.list({
      limit: 20,
      expand: ['data.product']
    });

    console.log('--- STRIPE PRICES FOUND ---');
    prices.data.forEach(price => {
      const product = price.product as Stripe.Product;
      console.log(`Product: ${product.name} | Price ID: ${price.id} | Amount: ${price.unit_amount / 100} ${price.currency}`);
    });
    console.log('---------------------------');
  } catch (error) {
    console.error('Error listing prices:', error.message);
  }
}

listPrices();
