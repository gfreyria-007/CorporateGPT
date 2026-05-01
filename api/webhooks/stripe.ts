/**
 * api/webhooks/stripe.ts — Stripe Webhook Handler
 * 
 * Handles subscription lifecycle events:
 * - checkout.session.completed: Payment successful, activate subscription
 * - customer.subscription.updated: Plan changes, status changes
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_failed: Payment failed, notify user
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.error('[StripeWebhook] Missing required environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.preview' as any,
});

interface FirestoreUser {
  uid: string;
  email: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan?: string;
  subscriptionStatus?: string;
  companyId?: string;
}

function getFirestore() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

async function updateUserSubscription(
  db: FirebaseFirestore.Firestore,
  userId: string,
  data: Partial<FirestoreUser>
) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    await userRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`[StripeWebhook] Updated user ${userId}:`, data);
  } else {
    console.warn(`[StripeWebhook] User ${userId} not found`);
  }
}

async function findUserByCustomerId(
  db: FirebaseFirestore.Firestore,
  customerId: string
): Promise<string | null> {
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    return usersSnapshot.docs[0].id;
  }
  return null;
}

async function findUserByEmail(
  db: FirebaseFirestore.Firestore,
  email: string
): Promise<string | null> {
  const usersSnapshot = await db.collection('users')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    return usersSnapshot.docs[0].id;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    const body = req.body;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[StripeWebhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  console.log(`[StripeWebhook] Received event: ${event.type}`);

  try {
    const db = getFirestore();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan = session.metadata?.plan || 'Starter';

        if (userId) {
          await updateUserSubscription(db, userId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan: plan,
            subscriptionStatus: 'active',
          });
        }

        console.log(`[StripeWebhook] Checkout completed for user ${userId}, plan: ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const statusMap: Record<Stripe.Subscription.Status, string> = {
          'active': 'active',
          'trialing': 'trialing',
          'past_due': 'past_due',
          'canceled': 'canceled',
          'unpaid': 'unpaid',
          'incomplete': 'incomplete',
          'incomplete_expired': 'canceled',
          'paused': 'paused',
        };

        const userId = await findUserByCustomerId(db, customerId);
        if (userId) {
          const priceId = subscription.items.data[0]?.price.id;
          let plan = 'Starter';
          
          if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) plan = 'Professional';
          else if (priceId === process.env.STRIPE_PRICE_FAMILY_STARTER) plan = 'Family Starter';
          else if (priceId === process.env.STRIPE_PRICE_FAMILY_MEGA) plan = 'Family Mega';
          else if (priceId === process.env.STRIPE_PRICE_JUNIOR_SOLO) plan = 'Junior Solo';

          await updateUserSubscription(db, userId, {
            stripeSubscriptionId: subscription.id,
            plan: plan,
            subscriptionStatus: statusMap[subscription.status] || subscription.status,
          });
        }

        console.log(`[StripeWebhook] Subscription updated for customer ${customerId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userId = await findUserByCustomerId(db, customerId);
        if (userId) {
          await updateUserSubscription(db, userId, {
            plan: 'free',
            subscriptionStatus: 'canceled',
          });
        }

        console.log(`[StripeWebhook] Subscription cancelled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userId = await findUserByCustomerId(db, customerId);
        if (userId) {
          await updateUserSubscription(db, userId, {
            subscriptionStatus: 'past_due',
          });

          const userDoc = await db.collection('users').doc(userId).get();
          const userData = userDoc.data() as FirestoreUser;
          
          if (userData?.email) {
            console.log(`[StripeWebhook] Payment failed - should send email to ${userData.email}`);
          }
        }

        console.log(`[StripeWebhook] Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`[StripeWebhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[StripeWebhook] Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}