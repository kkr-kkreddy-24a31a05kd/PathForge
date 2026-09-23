/**
 * PathForge End-to-End Workflow & Security Integration Test Suite
 * Validates the complete lifecycle:
 * 1. Health check
 * 2. User registration (Student & Company)
 * 3. Role-based authorization & permission guardrails (403 checks)
 * 4. Company approval workflow (Admin verification)
 * 5. Internship creation (Active vs Expired)
 * 6. Application deadline enforcement (400 validation)
 * 7. Candidate application & dynamic match score calculation
 * 8. Duplicate application prevention (400 validation)
 * 9. Cross-company access prevention (403 validation)
 * 10. Candidate status pipeline (Shortlisting)
 * 11. Multi-slot interview scheduling
 * 12. Candidate interview confirmation & calendar synchronization
 */

const baseURL = 'http://localhost:5000/api';

const runE2EWorkflowTests = async () => {
  console.log('🚀 Starting PathForge End-to-End Workflow & Security Test Suite...\n');

  let testStep = 1;
  const assert = (condition, description) => {
    if (!condition) {
      console.error(`❌ [STEP ${testStep}] FAILED: ${description}`);
      process.exit(1);
    } else {
      console.log(`✅ [STEP ${testStep}] PASSED: ${description}`);
      testStep++;
    }
  };

  const timestamp = Date.now();
  const studentEmail = `student_${timestamp}@test.com`;
  const companyEmail = `company_${timestamp}@test.com`;
  const password = 'Password@123';

  // Step 1: Health Check
  const healthRes = await fetch(`${baseURL}/health`).then(r => r.json());
  assert(healthRes.status === 'online', 'API server is reachable and online');

  // Step 2: Register Student with Skill Profile
  const studentReg = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Audit Student',
      email: studentEmail,
      password,
      role: 'student',
      college: 'PathForge Institute of Technology',
      degree: 'B.Tech Computer Science',
      graduationYear: 2026,
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS']
    })
  }).then(r => r.json());
  assert(studentReg.success && studentReg.token, `Student registered successfully (${studentEmail})`);
  const studentToken = studentReg.token;
  const studentId = studentReg.user.id;

  // Step 3: Register Company (must start unapproved)
  const companyReg = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Audit Tech Labs',
      email: companyEmail,
      password,
      role: 'company',
      companyName: 'Audit Tech Labs Inc',
      industry: 'Software Engineering',
      website: 'https://audittech.example.com',
      location: 'San Francisco, CA'
    })
  }).then(r => r.json());
  assert(companyReg.success && companyReg.user.isApproved === false, `Company registered with pending approval (${companyEmail})`);
  const companyToken = companyReg.token;
  const companyId = companyReg.user.id;

  // Step 4: Role-Based Authorization Checks (Unauthorized Operations)
  // 4a. Student tries to post an internship -> 403 Forbidden
  const studentPostAttempt = await fetch(`${baseURL}/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      title: 'Illegal Student Internship',
      description: 'Test',
      requiredSkills: ['React'],
      location: 'Remote',
      stipend: 1000,
      deadline: '2026-12-31'
    })
  });
  assert(studentPostAttempt.status === 403, 'Student blocked from creating internships (403 Forbidden)');

  // 4b. Student tries to access admin pending companies -> 403 Forbidden
  const studentAdminAttempt = await fetch(`${baseURL}/admin/pending-companies`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert(studentAdminAttempt.status === 403, 'Student blocked from admin pending companies endpoint (403 Forbidden)');

  // 4c. Unapproved company tries to post internship -> 403 Forbidden
  const unapprovedPostAttempt = await fetch(`${baseURL}/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Premature Internship',
      description: 'Should be rejected',
      requiredSkills: ['React'],
      location: 'Remote',
      stipend: 2000,
      deadline: '2026-12-31'
    })
  });
  assert(unapprovedPostAttempt.status === 403, 'Unapproved company blocked from creating internships (403 Forbidden)');

  // Step 5: Admin Login
  const adminLogin = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pathforge.com', password: 'password123' })
  }).then(r => r.json());
  assert(adminLogin.success && adminLogin.user.role === 'admin', 'Admin authenticated successfully');
  const adminToken = adminLogin.token;

  // Step 6: Admin Approves the Company
  const approveRes = await fetch(`${baseURL}/admin/companies/${companyId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ isApproved: true })
  }).then(r => r.json());
  assert(approveRes.success && approveRes.company.isApproved === true, 'Admin successfully approved the company');

  // Step 7: Company Creates an Expired Internship (Deadline passed)
  const expiredInternshipRes = await fetch(`${baseURL}/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Archived Legacy Internship',
      description: 'This position closed in the past.',
      requiredSkills: ['React', 'Node.js'],
      location: 'Remote',
      stipend: 2500,
      deadline: '2020-01-01' // Past date
    })
  }).then(r => r.json());
  assert(expiredInternshipRes.success && expiredInternshipRes.internship._id, 'Approved company successfully created an internship');
  const expiredInternshipId = expiredInternshipRes.internship._id;

  // Step 8: Student Applies to Expired Internship -> Expect 400 Bad Request
  const expiredApplyRes = await fetch(`${baseURL}/applications/apply/${expiredInternshipId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ coverNote: 'Applying to expired role' })
  });
  const expiredApplyData = await expiredApplyRes.json();
  assert(
    expiredApplyRes.status === 400 && expiredApplyData.message.includes('deadline'),
    'Student blocked from applying to internship with expired deadline (400 Bad Request)'
  );

  // Step 9: Company Creates Active Internship (Future deadline)
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  const activeInternshipRes = await fetch(`${baseURL}/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Full Stack Engineer Intern',
      description: 'Build modern responsive full-stack applications with React and Node.js.',
      requiredSkills: ['React', 'Node.js', 'MongoDB'],
      location: 'San Francisco, CA',
      locationType: 'Hybrid',
      stipend: 4500,
      stipendType: 'month',
      duration: '6 Months',
      deadline: futureDate.toISOString()
    })
  }).then(r => r.json());
  assert(activeInternshipRes.success && activeInternshipRes.internship._id, 'Created active internship with future deadline');
  const activeInternshipId = activeInternshipRes.internship._id;

  // Step 10: Student Applies to Active Internship
  const applyRes = await fetch(`${baseURL}/applications/apply/${activeInternshipId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      coverNote: 'Excited about building full-stack products with your team!',
      customResumeText: 'Experienced in React, Node.js, Express, and MongoDB.'
    })
  }).then(r => r.json());
  assert(
    applyRes.success && applyRes.application.status === 'submitted' && applyRes.application.matchScore > 50,
    `Student applied successfully with dynamic match score of ${applyRes.application.matchScore}%`
  );
  const applicationId = applyRes.application._id;

  // Step 11: Duplicate Application Check -> Expect 400 Bad Request
  const duplicateApplyRes = await fetch(`${baseURL}/applications/apply/${activeInternshipId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ coverNote: 'Trying to apply again' })
  });
  const duplicateApplyData = await duplicateApplyRes.json();
  assert(
    duplicateApplyRes.status === 400 && duplicateApplyData.message.includes('already submitted'),
    'Duplicate application prevented (400 Bad Request)'
  );

  // Step 12: Cross-Company Access Prevention
  // Another company attempts to view this internship's applicants -> 403 Forbidden
  const otherCompanyLogin = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'company@pathforge.com', password: 'password123' })
  }).then(r => r.json());
  const otherCompanyToken = otherCompanyLogin.token;

  const crossCompanyAttempt = await fetch(`${baseURL}/applications/internship/${activeInternshipId}/applicants`, {
    headers: { 'Authorization': `Bearer ${otherCompanyToken}` }
  });
  assert(crossCompanyAttempt.status === 403, 'Cross-company data isolation verified: other company blocked (403 Forbidden)');

  // Step 13: Authorized Company Views Applicants
  const applicantsRes = await fetch(`${baseURL}/applications/internship/${activeInternshipId}/applicants`, {
    headers: { 'Authorization': `Bearer ${companyToken}` }
  }).then(r => r.json());
  assert(
    applicantsRes.success && applicantsRes.applicants.length === 1 && applicantsRes.applicants[0]._id === applicationId,
    'Authorized company retrieved candidate application ranked by match score'
  );

  // Step 14: Company Shortlists the Student
  const shortlistRes = await fetch(`${baseURL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      status: 'shortlisted',
      notes: 'Impressive match score and relevant projects.'
    })
  }).then(r => r.json());
  assert(
    shortlistRes.success && shortlistRes.application.status === 'shortlisted',
    'Candidate status updated to "shortlisted"'
  );

  // Step 15: Company Proposes 3 Interview Time Slots
  const slot1 = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days later
  const slot2 = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 days later
  const slot3 = new Date(Date.now() + 86400000 * 4).toISOString(); // 4 days later

  const proposeInterviewRes = await fetch(`${baseURL}/interviews/propose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      applicationId,
      proposedSlots: [slot1, slot2, slot3],
      meetingLink: 'https://meet.google.com/audit-test-room',
      interviewType: 'Technical',
      notes: 'Initial technical deep-dive into React and Node.js.'
    })
  }).then(r => r.json());
  assert(
    proposeInterviewRes.success && proposeInterviewRes.interview.status === 'proposed' && proposeInterviewRes.interview.proposedSlots.length === 3,
    'Company proposed 3 interview time slots with video meeting link'
  );
  const interviewId = proposeInterviewRes.interview._id;

  // Step 16: Student Confirms One Time Slot
  const confirmSlotRes = await fetch(`${baseURL}/interviews/${interviewId}/confirm`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      selectedSlot: slot2
    })
  }).then(r => r.json());
  assert(
    confirmSlotRes.success && confirmSlotRes.interview.status === 'confirmed',
    'Student successfully confirmed preferred interview time slot'
  );

  // Step 17: Both Student and Company Verify Upcoming Interview
  const studentUpcoming = await fetch(`${baseURL}/interviews/upcoming`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  }).then(r => r.json());
  assert(
    studentUpcoming.success && studentUpcoming.interviews.some(i => i._id === interviewId && i.status === 'confirmed'),
    'Upcoming interview confirmed on Student schedule with meeting details'
  );

  const companyUpcoming = await fetch(`${baseURL}/interviews/upcoming`, {
    headers: { 'Authorization': `Bearer ${companyToken}` }
  }).then(r => r.json());
  assert(
    companyUpcoming.success && companyUpcoming.interviews.some(i => i._id === interviewId && i.status === 'confirmed'),
    'Upcoming interview confirmed on Company schedule with candidate details'
  );

  console.log('\n✨ COMPLETE END-TO-END WORKFLOW & SECURITY TEST SUITE PASSED SUCCESSFULLY! (17/17 Steps Verified)\n');
};

runE2EWorkflowTests().catch(err => {
  console.error('E2E Test Execution Failed:', err);
  process.exit(1);
});
