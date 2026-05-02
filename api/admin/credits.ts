import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_UIDS = (process.env.ADMIN_UIDS || '').split(',').filter(Boolean);

async function verifyAdmin(req: VercelRequest): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return false;
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    const decoded = await admin.auth().verifyIdToken(token);
    return ADMIN_UIDS.includes(decoded.uid);
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access denied' });
  }

  try {
    const admin = await import('firebase-admin');
    const db = admin.apps[0].firestore();
    
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartMs = weekStart.getTime();

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    const usersToday = usersSnapshot.docs.filter(d => {
      const data = d.data();
      return data.lastActive > todayStartMs;
    }).length;
    
    const usersThisWeek = usersSnapshot.docs.filter(d => {
      const data = d.data();
      return data.lastActive > weekStartMs;
    }).length;

    // Get flagged/banned users
    const flaggedUsers = usersSnapshot.docs.filter(d => {
      const data = d.data();
      return data.flagged === true || data.banned === true;
    }).map(d => ({ id: d.id, ...d.data() }));

    // Get image counts
    let imagesToday = 0;
    let imagesThisWeek = 0;
    let queriesToday = 0;
    let queriesThisWeek = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const quota = userData.quota;
      if (quota) {
        imagesToday += quota.imagesUsedToday || 0;
        imagesThisWeek += quota.imagesUsedWeek || 0;
        queriesToday += quota.queriesUsedToday || 0;
        queriesThisWeek += quota.queriesUsedWeek || 0;
      }
    }

    // Get credit balance
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    let creditBalance = 0;
    let creditUsage = 0;
    
    if (GEMINI_API_KEY) {
      try {
        const creditRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const creditData = await creditRes.json();
        creditBalance = creditData.models?.length ? 100 : 0; // Placeholder - real API needs different endpoint
      } catch (e) {
        console.error('Credit check failed:', e);
      }
    }

    // Top power users this week
    const powerUsers = usersSnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.quota?.queriesUsedWeek || 0) - (a.quota?.queriesUsedWeek || 0))
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        email: u.email,
        queries: u.quota?.queriesUsedWeek || 0,
        images: u.quota?.imagesUsedWeek || 0,
        role: u.role,
        flagged: u.flagged,
        banned: u.banned
      }));

    return res.status(200).json({
      data: {
        total_users: totalUsers,
        users_today: usersToday,
        users_this_week: usersThisWeek,
        images_today: imagesToday,
        images_this_week: imagesThisWeek,
        queries_today: queriesToday,
        queries_this_week: queriesThisWeek,
        flagged_count: flaggedUsers.length,
        flagged_users: flaggedUsers.slice(0, 20),
        power_users: powerUsers,
        credit_balance: creditBalance,
        credit_usage: creditUsage,
        as_of: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}