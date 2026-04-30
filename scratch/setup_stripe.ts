import Stripe from 'stripe';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

async function setupStripe() {
  try {
    console.log('--- CREATING PRODUCTS AND PRICES ---');

    // 1. Starter Plan
    const starterProduct = await stripe.products.create({ name: 'Starter Plan - Corporate GPT' });
    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 23300, // $233.00 MXN
      currency: 'mxn',
      recurring: { interval: 'month' },
    });
    console.log(`Starter Price created: ${starterPrice.id}`);

    // 2. Professional Plan
    const profProduct = await stripe.products.create({ name: 'Professional Plan - Corporate GPT' });
    const profPrice = await stripe.prices.create({
      product: profProduct.id,
      unit_amount: 19100, // $191.00 MXN
      currency: 'mxn',
      recurring: { interval: 'month' },
    });
    console.log(`Professional Price created: ${profPrice.id}`);

    // 3. Top-Up Credits
    const topupProduct = await stripe.products.create({ name: 'Top-Up 50,000 Tokens' });
    const topupPrice = await stripe.prices.create({
      product: topupProduct.id,
      unit_amount: 5000, // $50.00 MXN
      currency: 'mxn',
    });
    console.log(`Top-Up Price created: ${topupPrice.id}`);

    // Update .env file
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(/STRIPE_PRICE_STARTER=.*/, `STRIPE_PRICE_STARTER=${starterPrice.id}`);
    envContent = envContent.replace(/STRIPE_PRICE_PROFESSIONAL=.*/, `STRIPE_PRICE_PROFESSIONAL=${profPrice.id}`);
    envContent = envContent.replace(/STRIPE_PRICE_TOPUP=.*/, `STRIPE_PRICE_TOPUP=${topupPrice.id}`);
    
    fs.writeFileSync(envPath, envContent);
    console.log('--- .env UPDATED SUCCESSFULLY ---');

  } catch (error) {
    console.error('Error setting up Stripe:', error.message);
  }
}

setupStripe();
