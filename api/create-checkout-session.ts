import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Verify Stripe secret key exists first
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[STRIPE] STRIPE_SECRET_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Stripe no configurado en el servidor. Contacta al administrador.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24-preview' as any,
  });

  try {
    const { plan, qty, userId } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan no especificado' });
    }

    // 2. Map plan names to Stripe Price IDs — these MUST be set in Vercel env vars
    const planPrices: Record<string, string | undefined> = {
      'Starter':        process.env.STRIPE_PRICE_STARTER,
      'Professional':   process.env.STRIPE_PRICE_PROFESSIONAL,
      'Top-Up':         process.env.STRIPE_PRICE_TOPUP,
      'Family Starter': process.env.STRIPE_PRICE_FAMILY_STARTER,
      'Family Mega':    process.env.STRIPE_PRICE_FAMILY_MEGA,
      'Junior Solo':    process.env.STRIPE_PRICE_JUNIOR_SOLO,
    };

    const targetPrice = planPrices[plan];

    // 3. Guard: if price ID is missing, fail fast with a clear message
    if (!targetPrice) {
      const missingKey = `STRIPE_PRICE_${plan.toUpperCase().replace(/[ -]/g, '_')}`;
      console.error(`[STRIPE] Missing env var: ${missingKey} for plan "${plan}"`);
      return res.status(500).json({
        error: `El precio para el plan "${plan}" no está configurado. Contacta al administrador.`,
        debug_missing_key: missingKey
      });
    }

    const isTopUp = plan === 'Top-Up';
    const quantity = plan === 'Professional'
      ? Math.max(10, parseInt(qty || '10'))
      : 1;

    console.log(`[STRIPE] Creating session for plan: ${plan}, priceId: ${targetPrice}, userId: ${userId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: targetPrice, quantity }],
      mode: isTopUp ? 'payment' : 'subscription',
      success_url: `${process.env.APP_URL || 'https://corporategpt.catalizia.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.APP_URL || 'https://corporategpt.catalizia.com'}/pricing`,
      metadata: {
        plan,
        qty: quantity.toString(),
        userId: userId || 'anonymous',
        role: plan === 'Professional' ? 'admin' : 'user'
      }
    });

    console.log(`[STRIPE] Session created: ${session.id}`);
    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('[STRIPE ERROR]:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

