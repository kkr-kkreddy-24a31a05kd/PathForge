const testRunner = async () => {
  const baseURL = 'http://localhost:5000/api';

  console.log('🧪 Starting PathForge Automated API Test Suite...\n');

  const assert = (condition, msg) => {
    if (!condition) {
      console.error(`❌ FAILED: ${msg}`);
      process.exit(1);
    } else {
      console.log(`✅ PASSED: ${msg}`);
    }
  };

  // 1. Health Check
  const healthRes = await fetch(`${baseURL}/health`).then(r => r.json());
  assert(healthRes.status === 'online', 'Server health check is online');

  // 2. Auth: Login as Student
  const studentLogin = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@pathforge.com', password: 'password123' })
  }).then(r => r.json());
  assert(studentLogin.success && studentLogin.token, 'Student login succeeded with JWT token');
  const studentToken = studentLogin.token;

  // 3. Auth: Login as Company
  const companyLogin = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'company@pathforge.com', password: 'password123' })
  }).then(r => r.json());
  assert(companyLogin.success && companyLogin.user.isApproved === true, 'Approved Company login succeeded');
  const companyToken = companyLogin.token;

  // 4. Auth: Login as Admin
  const adminLogin = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pathforge.com', password: 'password123' })
  }).then(r => r.json());
  assert(adminLogin.success && adminLogin.user.role === 'admin', 'Admin login succeeded');
  const adminToken = adminLogin.token;

  // 5. Test Unapproved Company Guard
  const uniqueCompanyEmail = `pending_${Date.now()}@quantumleap.ai`;
  const pendingRegister = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Quantum AI',
      email: uniqueCompanyEmail,
      password: 'password123',
      role: 'company',
      companyName: 'Quantum AI Inc',
      industry: 'Artificial Intelligence',
      location: 'Austin, TX'
    })
  }).then(r => r.json());
  assert(pendingRegister.success && pendingRegister.user.isApproved === false, 'Pending company registered as unapproved');
  const pendingToken = pendingRegister.token;
  const pendingId = pendingRegister.user.id;

  // Attempting to post an internship as unapproved company should be blocked with 403
  const blockedPost = await fetch(`${baseURL}/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pendingToken}`
    },
    body: JSON.stringify({
      title: 'Quantum Dev Intern',
      description: 'Quantum algorithms',
      requiredSkills: ['Python', 'Qiskit'],
      location: 'Austin, TX',
      stipend: 5000,
      deadline: '2026-12-01'
    })
  });
  assert(blockedPost.status === 403, 'Unapproved company blocked from posting internships (403)');

  // 6. Admin Approves the Company
  const approveRes = await fetch(`${baseURL}/admin/companies/${pendingId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ isApproved: true })
  }).then(r => r.json());
  assert(approveRes.success && approveRes.company.isApproved === true, 'Admin successfully approved pending company');

  // 7. Browse Internships with Student Context (Dynamic Match Scoring)
  const internshipsRes = await fetch(`${baseURL}/internships`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  }).then(r => r.json());
  assert(internshipsRes.success && internshipsRes.internships.length > 0, 'Fetched internships list');
  const firstJob = internshipsRes.internships[0];
  assert(typeof firstJob.matchScore === 'number', `Dynamic match score calculated: ${firstJob.matchScore}%`);

  // 8. Resume Keyword Match Checker Endpoint
  const resumeCheckRes = await fetch(`${baseURL}/applications/check-resume-score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      internshipId: firstJob._id,
      resumeText: 'Experienced in React, Node.js, Express, and MongoDB. Built full-stack web applications.'
    })
  }).then(r => r.json());
  assert(resumeCheckRes.success && resumeCheckRes.matchScore > 0, `Resume score checker returned ${resumeCheckRes.matchScore}% match`);

  // 9. Analytics Endpoints
  const adminAnalytics = await fetch(`${baseURL}/analytics/admin`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  assert(adminAnalytics.success && adminAnalytics.analytics.placementFunnel.length > 0, 'Admin analytics funnel generated');

  const companyAnalytics = await fetch(`${baseURL}/analytics/company`, {
    headers: { 'Authorization': `Bearer ${companyToken}` }
  }).then(r => r.json());
  assert(companyAnalytics.success && Array.isArray(companyAnalytics.analytics.applicationsOverTime), 'Company analytics timeline generated');

  console.log('\n🎉 ALL 9 AUTOMATED BACKEND API TESTS PASSED SUCCESSFULLY!\n');
};

testRunner().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
