/**
 * Normalizes a tech skill keyword for fuzzy canonical comparison.
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  let s = skill.toLowerCase().trim();
  s = s.replace(/\.js\b/g, '');
  s = s.replace(/js\b/g, '');
  s = s.replace(/\+/g, 'p'); // c++ -> cpp
  s = s.replace(/#/g, 'sharp'); // c# -> csharp
  s = s.replace(/[^a-z0-9]/g, '');
  return s;
};

/**
 * Calculates match score between candidate skills/resume and internship required skills.
 * @param {Array<string>} studentSkills - Array of student profile skills
 * @param {string} resumeText - Raw resume text (optional)
 * @param {Array<string>} requiredSkills - Array of internship required skills
 * @returns {Object} { matchScore, matchedSkills, missingSkills, totalRequired }
 */
export const calculateMatchScore = (studentSkills = [], resumeText = '', requiredSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchScore: 100,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      recommendation: 'No specific requirements specified for this position.'
    };
  }

  const normalizedStudentSkills = new Set(
    (studentSkills || []).map(s => normalizeSkill(s)).filter(Boolean)
  );

  const normalizedResumeText = (resumeText || '').toLowerCase();

  const matchedSkills = [];
  const missingSkills = [];

  for (const rawReqSkill of requiredSkills) {
    const canonicalReq = normalizeSkill(rawReqSkill);
    const rawLower = rawReqSkill.toLowerCase().trim();

    // Check 1: Direct match in student's declared skills
    const hasInDeclared = normalizedStudentSkills.has(canonicalReq) ||
      (studentSkills || []).some(s => s.toLowerCase().trim() === rawLower);

    // Check 2: Word boundary or substring match in resume text
    let hasInResume = false;
    if (normalizedResumeText.length > 0) {
      // Escape regex special chars
      const escaped = rawLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:\\b|\\s|_|-)${escaped}(?:\\b|\\s|_|-)`, 'i');
      hasInResume = regex.test(normalizedResumeText) || normalizedResumeText.includes(rawLower);
    }

    if (hasInDeclared || hasInResume) {
      matchedSkills.push(rawReqSkill);
    } else {
      missingSkills.push(rawReqSkill);
    }
  }

  const totalRequired = requiredSkills.length;
  const matchScore = Math.round((matchedSkills.length / totalRequired) * 100);

  let recommendation = '';
  if (matchScore >= 80) {
    recommendation = 'Excellent profile alignment! You meet almost all core technical requirements.';
  } else if (matchScore >= 50) {
    recommendation = `Strong match. Adding experience in ${missingSkills.slice(0, 2).join(' and ')} would maximize your candidacy.`;
  } else {
    recommendation = `Consider upskilling in ${missingSkills.slice(0, 3).join(', ')} or tailoring your resume to highlight relevant projects.`;
  }

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    totalRequired,
    recommendation
  };
};
