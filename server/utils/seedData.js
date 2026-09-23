import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Notification from '../models/Notification.js';
import { calculateMatchScore } from './matchCalculator.js';

export const seedDatabase = async () => {
  try {
    if (process.env.SEED_DEMO_DATA === 'false') {
      console.log('ℹ️ Demo seeding skipped (SEED_DEMO_DATA=false)');
      return;
    }

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('🌱 Database already populated. Skipping initial seed.');
      return;
    }

    console.log('🌱 Seeding initial demo accounts, internships, and platform data...');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Dr. Eleanor Vance (Academic Director)',
      email: 'admin@pathforge.com',
      password: 'password123',
      role: 'admin',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    });

    // 2. Create Approved Company 1
    const company1 = await User.create({
      name: 'Marcus Thorne',
      email: 'company@pathforge.com',
      password: 'password123',
      role: 'company',
      isApproved: true,
      companyDetails: {
        companyName: 'Apex Cloud Systems',
        website: 'https://apexcloud.example.com',
        industry: 'Enterprise Software & Cloud',
        location: 'San Francisco, CA (Remote Friendly)',
        description: 'Pioneering next-generation distributed systems and high-throughput cloud infrastructure.',
        size: '250-500'
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    // 3. Create Approved Company 2
    const company2 = await User.create({
      name: 'Priya Sharma',
      email: 'tech@innovate.io',
      password: 'password123',
      role: 'company',
      isApproved: true,
      companyDetails: {
        companyName: 'Innovate AI Labs',
        website: 'https://innovateai.example.com',
        industry: 'Artificial Intelligence & Robotics',
        location: 'Boston, MA (Hybrid)',
        description: 'Developing applied foundation models for scientific discovery and automated workflows.',
        size: '50-100'
      },
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    });

    // 4. Create Pending Company (Requires Admin Verification)
    const pendingCompany = await User.create({
      name: 'Jordan Blake',
      email: 'founder@quantumleap.ai',
      password: 'password123',
      role: 'company',
      isApproved: false, // Core feature 4: needs admin approval!
      companyDetails: {
        companyName: 'QuantumLeap AI',
        website: 'https://quantumleap.example.com',
        industry: 'Quantum Computing & Algorithms',
        location: 'Austin, TX',
        description: 'Building quantum-classical hybrid algorithms for high-speed portfolio optimization.',
        size: '10-25'
      },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    });

    // 5. Create Demo Student (Alex Rivera)
    const student1 = await User.create({
      name: 'Alex Rivera',
      email: 'student@pathforge.com',
      password: 'password123',
      role: 'student',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      studentDetails: {
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Docker', 'Express'],
        resumeLink: 'https://alexrivera-portfolio.dev/resume.pdf',
        resumeText: 'Passionate full-stack developer with 2+ years of hands-on experience building modern web applications with React, Node.js, Express, and MongoDB. Strong proficiency in TypeScript, RESTful API design, database modeling, and Tailwind CSS. Built real-time collaboration tools and scalable microservices.',
        headline: 'Senior CS Student | Full-Stack & Systems Enthusiast',
        bio: 'Fourth-year Computer Science student at Stanford with passion for scalable backend architectures and crisp web interfaces.',
        phone: '+1 (555) 234-5678',
        education: [
          {
            institution: 'Stanford University',
            degree: 'B.S. in Computer Science',
            fieldOfStudy: 'Software Systems',
            year: '2025',
            gpa: '3.89'
          }
        ]
      }
    });

    // 6. Create Demo Student 2 (Sarah Chen)
    const student2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
      password: 'password123',
      role: 'student',
      isApproved: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      studentDetails: {
        skills: ['Python', 'PyTorch', 'Machine Learning', 'SQL', 'FastAPI', 'Pandas'],
        resumeLink: 'https://sarahchen.io/resume.pdf',
        resumeText: 'Data science and ML researcher with focus on computer vision and neural networks using Python, PyTorch, and SQL.',
        headline: 'AI & Machine Learning Graduate Student',
        bio: 'Master of Science candidate exploring deep learning architectures and distributed model training.',
        phone: '+1 (555) 876-5432',
        education: [
          {
            institution: 'Carnegie Mellon University',
            degree: 'M.S. in Intelligent Information Systems',
            fieldOfStudy: 'Artificial Intelligence',
            year: '2025',
            gpa: '3.94'
          }
        ]
      }
    });

    // 7. Seed Internships
    const internship1 = await Internship.create({
      company: company1._id,
      title: 'Full-Stack Software Engineering Intern',
      description: 'Join our core platform engineering pod to design and implement mission-critical web applications. You will collaborate directly with staff architects on high-volume microservices and dynamic user interfaces.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      location: 'San Francisco, CA',
      locationType: 'Hybrid',
      stipend: 4500,
      stipendType: 'month',
      currency: '$',
      duration: '3 Months (Summer)',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      openings: 3,
      applicantsCount: 2
    });

    const internship2 = await Internship.create({
      company: company1._id,
      title: 'Cloud DevOps & Systems Intern',
      description: 'Work alongside our infrastructure team to automate container orchestration, observability metrics, and resilient multi-region Kubernetes deployments.',
      requiredSkills: ['Docker', 'Kubernetes', 'Go', 'Linux', 'AWS'],
      location: 'Remote',
      locationType: 'Remote',
      stipend: 4800,
      stipendType: 'month',
      currency: '$',
      duration: '4 Months',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      openings: 2,
      applicantsCount: 1
    });

    const internship3 = await Internship.create({
      company: company2._id,
      title: 'Applied AI & Deep Learning Research Intern',
      description: 'Conduct exploratory research on transformer architectures, fine-tuning large language models on proprietary multi-modal datasets, and optimizing inference latencies.',
      requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'FastAPI'],
      location: 'Boston, MA',
      locationType: 'Hybrid',
      stipend: 5200,
      stipendType: 'month',
      currency: '$',
      duration: '6 Months',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      openings: 2,
      applicantsCount: 1
    });

    const internship4 = await Internship.create({
      company: company2._id,
      title: 'Frontend UI/UX Systems Intern',
      description: 'Help build our next-generation design system components and responsive analytics dashboards with React, Tailwind CSS, and WebGL visualizations.',
      requiredSkills: ['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
      location: 'Remote',
      locationType: 'Remote',
      stipend: 4200,
      stipendType: 'month',
      currency: '$',
      duration: '3 Months',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      openings: 1,
      applicantsCount: 1
    });

    // 8. Seed Applications with calculated match scores
    const match1 = calculateMatchScore(student1.studentDetails.skills, student1.studentDetails.resumeText, internship1.requiredSkills);
    const app1 = await Application.create({
      internship: internship1._id,
      student: student1._id,
      company: company1._id,
      matchScore: match1.matchScore, // 100% match!
      matchedSkills: match1.matchedSkills,
      missingSkills: match1.missingSkills,
      status: 'shortlisted',
      coverNote: 'Excited to apply for this full-stack role. My experience building high-performance MERN web apps aligns directly with your stack.',
      resumeSnapshot: student1.studentDetails.resumeText,
      statusNotes: 'Top-tier portfolio and perfect 100% skill match. Selected for technical interview.',
      statusHistory: [
        { status: 'submitted', updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), notes: 'Application received' },
        { status: 'shortlisted', updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), notes: 'Selected for technical interview' }
      ]
    });

    const match2 = calculateMatchScore(student1.studentDetails.skills, student1.studentDetails.resumeText, internship4.requiredSkills);
    await Application.create({
      internship: internship4._id,
      student: student1._id,
      company: company2._id,
      matchScore: match2.matchScore,
      matchedSkills: match2.matchedSkills,
      missingSkills: match2.missingSkills,
      status: 'submitted',
      coverNote: 'Love the AI labs mission and looking forward to contributing to design engineering.',
      resumeSnapshot: student1.studentDetails.resumeText,
      statusHistory: [
        { status: 'submitted', updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), notes: 'Under initial review' }
      ]
    });

    // Student 2 application to AI internship
    const match3 = calculateMatchScore(student2.studentDetails.skills, student2.studentDetails.resumeText, internship3.requiredSkills);
    await Application.create({
      internship: internship3._id,
      student: student2._id,
      company: company2._id,
      matchScore: match3.matchScore,
      matchedSkills: match3.matchedSkills,
      missingSkills: match3.missingSkills,
      status: 'shortlisted',
      coverNote: 'My research background in PyTorch transformers fits the team perfectly.',
      resumeSnapshot: student2.studentDetails.resumeText,
      statusHistory: [
        { status: 'submitted', updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000), notes: 'Application received' },
        { status: 'shortlisted', updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), notes: 'Shortlisted by hiring manager' }
      ]
    });

    // 9. Seed Interview for Student 1 (Alex Rivera)
    const slot1 = new Date(Date.now() + 2 * 24 * 3600 * 1000);
    slot1.setHours(14, 0, 0, 0); // 2:00 PM
    const slot2 = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    slot2.setHours(16, 30, 0, 0); // 4:30 PM
    const slot3 = new Date(Date.now() + 4 * 24 * 3600 * 1000);
    slot3.setHours(11, 0, 0, 0); // 11:00 AM

    await Interview.create({
      application: app1._id,
      internship: internship1._id,
      company: company1._id,
      student: student1._id,
      proposedSlots: [slot1, slot2, slot3],
      selectedSlot: null, // Ready for student to test confirmation!
      status: 'proposed',
      meetingLink: 'https://meet.google.com/pathforge-apex-tech',
      interviewType: 'Technical',
      notes: 'Initial 45-minute technical system design and React discussion with Marcus Thorne.'
    });

    // 10. Seed Notifications for Student 1
    await Notification.create({
      user: student1._id,
      title: 'Interview Invitation Received! 📅',
      message: 'Apex Cloud Systems proposed 3 interview slots for "Full-Stack Software Engineering Intern". Choose your preferred time!',
      type: 'interview',
      link: '/student/interviews',
      read: false
    });

    await Notification.create({
      user: student1._id,
      title: 'Application Shortlisted! 🎉',
      message: 'Your application for "Full-Stack Software Engineering Intern" at Apex Cloud Systems has been shortlisted.',
      type: 'status_change',
      link: '/student/applications',
      read: true
    });

    console.log('✅ Demo seed data created successfully!');
    console.log('   👑 Admin:    admin@pathforge.com / password123');
    console.log('   🏢 Company:  company@pathforge.com / password123 (Apex Cloud Systems)');
    console.log('   🎓 Student:  student@pathforge.com / password123 (Alex Rivera)');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};
