const secret = 'cron_incremental_refresh_secret_2026';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const url = `${BASE_URL}/api/refresh/incremental`;

async function seed() {
  console.log('Starting full cache seed...');
  // Loop up to 600 times (5 profiles per batch = 3000 profiles max)
  for (let i = 1; i <= 600; i++) {
    console.log(`[Batch ${i}] Triggering incremental refresh...`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-cron-secret': secret,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      console.log(`[Batch ${i}] Response:`, data);
      
      const isDone = data.attemptedUsers ? data.attemptedUsers.length === 0 : (!data.updatedUsers || data.updatedUsers.length === 0);
      if (isDone) {
        console.log('No more stale users. All caches are completely up to date!');
        break;
      }
    } catch (err) {
      console.error(`[Batch ${i}] Error:`, err);
    }
    // Wait 15 seconds between batches to respect GitHub search rate limits across tokens
    await new Promise(r => setTimeout(r, 15000));
  }
  console.log('Seeding process completed!');
}

seed();
