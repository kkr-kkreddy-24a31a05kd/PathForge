/**
 * PathForge Persistence Verification Script
 * Validates persistent storage on MongoDB Atlas across server restarts.
 */

const baseURL = 'http://localhost:5000/api';

const run = async () => {
  const mode = process.argv[2] || '--verify-all';

  if (mode === '--create') {
    // 1. Login as company
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'company@pathforge.com', password: 'password123' })
    }).then(r => r.json());

    if (!loginRes.token) {
      console.error('Login failed');
      process.exit(1);
    }

    // 2. Create harmless test record
    const postRes = await fetch(`${baseURL}/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginRes.token}`
      },
      body: JSON.stringify({
        title: 'Persistence Test Opportunity 2026',
        description: 'Temporary verification record to confirm MongoDB Atlas data persistence across backend server restarts.',
        requiredSkills: ['MongoDB Atlas', 'Persistence'],
        location: 'Remote',
        locationType: 'Remote',
        stipend: 3000,
        stipendType: 'month',
        duration: '1 Month',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString()
      })
    }).then(r => r.json());

    if (!postRes.success || !postRes.internship._id) {
      console.error('Failed to create test internship:', postRes);
      process.exit(1);
    }

    const testId = postRes.internship._id;
    console.log(`RECORD_CREATED:${testId}`);
    process.exit(0);
  }

  if (mode.startsWith('--confirm=')) {
    const testId = mode.split('=')[1];
    
    // Fetch directly from public/student internships endpoint
    const res = await fetch(`${baseURL}/internships`).then(r => r.json());
    if (!res.success) {
      console.error('Failed to fetch internships');
      process.exit(1);
    }

    const found = res.internships.find(item => item._id === testId);
    if (!found) {
      console.error(`RECORD_NOT_FOUND:${testId}`);
      process.exit(1);
    }

    console.log(`RECORD_PERSISTED_CONFIRMED:${found.title}`);

    // Clean up test record after confirming persistence
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'company@pathforge.com', password: 'password123' })
    }).then(r => r.json());

    if (loginRes.token) {
      await fetch(`${baseURL}/internships/${testId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${loginRes.token}` }
      });
      console.log('RECORD_CLEANED_UP');
    }

    process.exit(0);
  }
};

run().catch(err => {
  console.error('Persistence test failed:', err);
  process.exit(1);
});
