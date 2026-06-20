// list_users.ts
/**
 * List all documents in the Firestore collection "users".
 *
 * Usage: npx ts-node list_users.ts
 *
 * Prerequisites:
 *   - npm i firebase-admin
 *   - Set GOOGLE_APPLICATION_CREDENTIALS env var to a service‑account JSON key.
 */

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config(); // Load .env if present (project already uses it)

// Initialize the Admin SDK only once.
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

async function listAllUsers() {
  try {
    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      console.log("🟡 No documents found in collection 'users'.");
      return;
    }

    console.log(`✅ Found ${snapshot.size} document(s) in "users":\n`);
    snapshot.forEach(doc => {
      console.log(`📄 ${doc.id}`);
      console.log("   Data:", JSON.stringify(doc.data(), null, 2));
      console.log("---");
    });
  } catch (err) {
    console.error("❌ Error reading collection 'users':", (err as Error).message);
  }
}

listAllUsers().then(() => process.exit());
