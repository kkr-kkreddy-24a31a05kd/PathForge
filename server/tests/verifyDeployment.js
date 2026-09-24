import http from 'http';

const runTests = async () => {
  const baseURL = 'http://localhost:5000';
  console.log('🔍 Testing PathForge server endpoints against:', baseURL);

  const check = (desc, cond) => {
    if (!cond) {
      console.error(`❌ FAILED: ${desc}`);
      process.exit(1);
    }
    console.log(`✅ PASSED: ${desc}`);
  };

  // 1. Test GET /
  const rootRes = await fetch(`${baseURL}/`);
  const rootData = await rootRes.json();
  check('GET / status is 200', rootRes.status === 200);
  check('GET / success is true', rootData.success === true);
  check('GET / message is "PathForge API is running"', rootData.message === 'PathForge API is running');
  check('GET / service is "PathForge API"', rootData.service === 'PathForge API');

  // 2. Test GET /health
  const healthRes = await fetch(`${baseURL}/health`);
  const healthData = await healthRes.json();
  check('GET /health status is 200', healthRes.status === 200);
  check('GET /health status is "ok"', healthData.status === 'ok');
  check('GET /health service is "PathForge API"', healthData.service === 'PathForge API');

  // 3. Test GET /api/health (backward compatibility)
  const apiHealthRes = await fetch(`${baseURL}/api/health`);
  const apiHealthData = await apiHealthRes.json();
  check('GET /api/health status is 200', apiHealthRes.status === 200);
  check('GET /api/health status is "online"', apiHealthData.status === 'online');

  // 4. Test unknown route returns JSON 404
  const notFoundRes = await fetch(`${baseURL}/unknown-endpoint-xyz`);
  const notFoundData = await notFoundRes.json();
  check('GET /unknown-endpoint-xyz status is 404', notFoundRes.status === 404);
  check('GET /unknown-endpoint-xyz returns JSON success: false', notFoundData.success === false);
  check('GET /unknown-endpoint-xyz returns message: "API route not found"', notFoundData.message === 'API route not found');

  // 5. Test CORS preflight & headers
  const corsRes = await fetch(`${baseURL}/health`, {
    headers: { 'Origin': 'https://kkr-kkreddy-24a31a05kd.github.io' }
  });
  const allowOrigin = corsRes.headers.get('access-control-allow-origin');
  check('CORS Access-Control-Allow-Origin header is set for GitHub Pages', allowOrigin === 'https://kkr-kkreddy-24a31a05kd.github.io');

  // 6. Test public stats endpoint
  const statsRes = await fetch(`${baseURL}/api/admin/stats`);
  const statsData = await statsRes.json();
  check('GET /api/admin/stats status is 200', statsRes.status === 200);
  check('GET /api/admin/stats success is true', statsData.success === true);

  // 7. Test public internships endpoint
  const internshipsRes = await fetch(`${baseURL}/api/internships`);
  const internshipsData = await internshipsRes.json();
  check('GET /api/internships status is 200', internshipsRes.status === 200);
  check('GET /api/internships returns array', Array.isArray(internshipsData.internships));

  // 8. Test Auth Login with demo user
  const loginRes = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@pathforge.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  check('POST /api/auth/login status is 200', loginRes.status === 200);
  check('POST /api/auth/login returns token', Boolean(loginData.token));

  console.log('\n✨ ALL DEPLOYMENT VERIFICATION TESTS PASSED SUCCESSFULLY! ✨\n');
};

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
