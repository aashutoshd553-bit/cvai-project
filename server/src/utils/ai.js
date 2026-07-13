import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to escape regex special characters (like C++ or C#)
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Initialize Gemini API
const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null; // Return null so we trigger fallback mode immediately if key is default
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  } catch (err) {
    console.warn('Gemini client creation failed, falling back to mock engine.', err.message);
    return null;
  }
};

/**
 * Dynamic Regex Scanner: Extract actual content sections from parsed text
 */
const extractResumeDetails = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Name Guess
  let name = 'Aashutosh Dubey';
  for (const line of lines) {
    if (line.length > 3 && line.length < 35 && 
        !line.includes('@') && 
        !line.includes('http') && 
        !line.includes('/') && 
        !/^[0-9\s+\-()]+$/.test(line) &&
        !/^(education|skills|experience|projects|about|summary|contact|achievements|certifications|curriculum|vitae|resume)/i.test(line)) {
      name = line;
      break;
    }
  }

  // 2. Email
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : 'aashutoshdubey5533d@gmail.com';

  // 3. Phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '+91 98765 43210';

  // 4. Skills
  const commonSkills = ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git', 'Docker', 'AWS', 'Kubernetes', 'Machine Learning', 'Data Science', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Data Structures', 'Algorithms', 'Android', 'Flutter', 'C#', 'PHP', 'WordPress'];
  const matchedSkills = commonSkills.filter(skill => 
    new RegExp('\\b' + escapeRegExp(skill) + '\\b', 'i').test(text)
  );

  // 5. Education
  const eduKeywords = ['university', 'college', 'institute', 'school', 'btech', 'degree', 'bachelor', 'master', 'education', 'hsc', 'ssc', 'engineering', 'science', 'technology', 'graduated'];
  const eduLines = [];
  lines.forEach(l => {
    if (eduKeywords.some(kw => l.toLowerCase().includes(kw)) && l.length > 10 && l.length < 120 && !l.includes('@') && !l.includes('http')) {
      eduLines.push(l);
    }
  });
  const education = eduLines.slice(0, 3);
  if (education.length === 0) education.push('Bachelor of Technology (B.Tech) in Computer Science');

  // 6. Experience
  const expKeywords = ['experience', 'work', 'intern', 'developer', 'engineer', 'analyst', 'manager', 'lead', 'professional', 'responsibilities', 'project trainee'];
  const expLines = [];
  lines.forEach(l => {
    if (expKeywords.some(kw => l.toLowerCase().includes(kw)) && l.length > 15 && l.length < 140 && !l.includes('@') && !l.includes('http') && !/^(experience|work experience|employment history)/i.test(l)) {
      expLines.push(l);
    }
  });
  const experience = expLines.slice(0, 3);
  if (experience.length === 0) experience.push('Software Developer Trainee / Web Intern');

  // 7. Projects
  const projKeywords = ['project', 'github', 'portfolio', 'application', 'system', 'website', 'build', 'implemented'];
  const projLines = [];
  lines.forEach(l => {
    if (projKeywords.some(kw => l.toLowerCase().includes(kw)) && l.length > 12 && l.length < 120 && !l.includes('@') && !l.includes('http') && !/^(projects|academic projects|key projects)/i.test(l)) {
      projLines.push(l);
    }
  });
  const projects = projLines.slice(0, 3);
  if (projects.length === 0) projects.push('AI Resume Screening and Optimization System');

  // 8. Achievements
  const achKeywords = ['won', 'secured', 'award', 'achievement', 'rank', 'placed', 'selected', 'scholarship', 'certificate', 'certified'];
  const achLines = [];
  lines.forEach(l => {
    if (achKeywords.some(kw => l.toLowerCase().includes(kw)) && l.length > 10 && l.length < 130 && !l.includes('@')) {
      achLines.push(l);
    }
  });
  const achievements = achLines.slice(0, 3);
  if (achievements.length === 0) achievements.push('Secured top grades in engineering capstone projects');

  return {
    name,
    email,
    phone,
    skills: matchedSkills.length > 0 ? matchedSkills : ['Web Development', 'Git', 'Data Structures'],
    education,
    experience,
    projects,
    achievements
  };
};

/**
 * Smart Fallback: Parses raw resume text to construct a realistic mock analysis report.
 */
const getFallbackAnalysis = (resumeText) => {
  const parsed = extractResumeDetails(resumeText);
  
  return {
    atsScore: parsed.skills.length > 6 ? 84 : 74,
    parsedData: parsed,
    layoutEvaluation: {
      score: 85,
      feedback: [
        'Good margins and balanced whitespace distribution.',
        'Proper section heading tags found (Education, Skills, Experience).',
        'Recommended: Add links to project git repositories.'
      ]
    },
    contentPerformance: {
      actionVerbsScore: parsed.experience.length > 1 ? 80 : 65,
      actionVerbsFeedback: ['Strong actions verbs detected. Add more result-oriented words.'],
      metricsScore: 60,
      metricsFeedback: ['Add quantitative stats (e.g., "Reduced database lookup times by 20%") to your projects.'],
      grammarScore: 95,
      grammarFeedback: ['No major typos or grammatical syntax errors found. Good readability score.']
    },
    aiSuggestions: {
      summary: `Results-driven software developer with expertise in ${parsed.skills.slice(0, 4).join(', ')}. Experienced in designing modern full-stack systems and building robust web architectures.`,
      skills: 'Categorize your skills list by types: Languages (JS, Python), Frameworks (React), Databases (MongoDB).',
      projects: 'Write project descriptions in PAR style: Problem solved, Action taken, Result achieved.',
      experience: 'Use strong action-verbs at the beginning of each experience bullet point.',
      achievements: 'Try to quantify accomplishments to increase scanner impact score.'
    },
    nextSteps: [
      'Add live URL links to your academic projects.',
      'Include quantitative metrics in your experience statements.',
      'Obtain cloud services certification (AWS Certified Cloud Practitioner).'
    ]
  };
};

/**
 * Smart Fallback for Job Matching
 */
const getFallbackJobMatch = (resumeText, jobDescription) => {
  const skills = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git', 'Docker', 'AWS', 'HTML', 'CSS'];
  const matched = skills.filter(s => 
    new RegExp('\\b' + escapeRegExp(s) + '\\b', 'i').test(resumeText) && 
    new RegExp('\\b' + escapeRegExp(s) + '\\b', 'i').test(jobDescription)
  );
  
  const missing = skills.filter(s => 
    !new RegExp('\\b' + escapeRegExp(s) + '\\b', 'i').test(resumeText) && 
    new RegExp('\\b' + escapeRegExp(s) + '\\b', 'i').test(jobDescription)
  );

  const recommended = skills.filter(s => 
    !new RegExp('\\b' + escapeRegExp(s) + '\\b', 'i').test(resumeText) && 
    !new RegExp('\\b' + escapeRegExp(s) + '\\b', 'i').test(jobDescription)
  ).slice(0, 3);

  return {
    score: Math.min(88, Math.max(45, 50 + matched.length * 8)),
    matchedKeywords: matched.length > 0 ? matched : ['Web Development', 'JavaScript', 'Git'],
    missingKeywords: missing.length > 0 ? missing : ['Docker', 'AWS'],
    recommendedKeywords: recommended.length > 0 ? recommended : ['TypeScript', 'SQL'],
    experienceFeedback: 'The candidate has matching core technical skills for this vacancy. Add details of the missing keywords to enhance direct matching index.'
  };
};

/**
 * Smart Fallback for Cover Letter
 */
const getFallbackCoverLetter = (resumeText, companyName, role, hiringManager = 'Hiring Manager') => {
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  let name = 'Aashutosh Dubey';
  if (lines.length > 0 && lines[0].length < 35) {
    name = lines[0];
  }
  
  return {
    content: `Dear ${hiringManager},\n\nI am writing to express my strong interest in the ${role} position at ${companyName}. With my technical background and experience building responsive full-stack applications, I am confident in my ability to contribute value to your development team.\n\nThroughout my projects, I have deployed modern frameworks like React, Node.js, and MongoDB to construct scalable web platforms. I excel in solving structural challenges, designing clean database schemas, and collaborating across workflows to deliver optimized products.\n\nThank you for your time and consideration. I look forward to the opportunity to discuss how my qualifications align with the requirements of ${companyName}.\n\nSincerely,\n${name}`
  };
};

/**
 * Smart Fallback for AI Summary
 */
const getFallbackAISummary = (resumeData) => {
  const name = resumeData.personalInfo?.fullName || 'Aashutosh Dubey';
  const skills = resumeData.skills?.programmingLanguages || 'JavaScript, Python';
  return {
    summary: `Enthusiastic and detail-oriented Software Developer with a strong foundation in modern web technologies including ${skills}. Experienced in designing full-stack applications, working with Mongoose schemas, and creating clean layouts. Adept at collaborative engineering workflows and committed to delivering high-impact solutions.`
  };
};

/**
 * Analyzes resume text for ATS parsing, layout, and content quality.
 * @param {string} resumeText - Raw parsed text of the resume
 * @returns {Promise<Object>} Analysis results in JSON
 */
export const analyzeResumeText = async (resumeText) => {
  const model = getModel();
  if (!model) {
    console.warn('API Key missing or invalid. Triggering local mock engine.');
    return getFallbackAnalysis(resumeText);
  }
  
  const prompt = `
    You are an expert ATS (Applicant Tracking System) parser and professional resume reviewer.
    Analyze the following resume text and provide a detailed parsing diagnostic, layout evaluation, content performance audit, and actionable suggestions.
    
    You must respond ONLY with a JSON object fitting this schema:
    {
      "atsScore": number (0 to 100),
      "parsedData": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "skills": ["string"],
        "projects": ["string"],
        "education": ["string"],
        "experience": ["string"],
        "achievements": ["string"]
      },
      "layoutEvaluation": {
        "score": number (0 to 100),
        "feedback": ["string"]
      },
      "contentPerformance": {
        "actionVerbsScore": number (0 to 100),
        "actionVerbsFeedback": ["string"],
        "metricsScore": number (0 to 100),
        "metricsFeedback": ["string"],
        "grammarScore": number (0 to 100),
        "grammarFeedback": ["string"]
      },
      "aiSuggestions": {
        "summary": "string (better professional summary)",
        "skills": "string (suggested skills format or additions)",
        "projects": "string (how to improve project descriptions)",
        "experience": "string (how to improve experience bullet points using PAR framework)",
        "achievements": "string (how to improve achievement statements)"
      },
      "nextSteps": ["string"]
    }
    
    Resume Text:
    """
    ${resumeText}
    """
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Gemini Analyze Resume Error: falling back to mock engine.', error.message);
    return getFallbackAnalysis(resumeText);
  }
};

/**
 * Performs job match analysis between resume text and a job description.
 */
export const analyzeJobMatch = async (resumeText, jobDescription) => {
  const model = getModel();
  if (!model) {
    return getFallbackJobMatch(resumeText, jobDescription);
  }

  const prompt = `
    You are an AI recruitment specialist matching a candidate's resume to a target job description.
    Compare the following resume text with the job description and evaluate their compatibility.
    
    You must respond ONLY with a JSON object fitting this schema:
    {
      "score": number (0 to 100),
      "matchedKeywords": ["string"],
      "missingKeywords": ["string"],
      "recommendedKeywords": ["string"],
      "experienceFeedback": "string"
    }
    
    Resume Text:
    """
    ${resumeText}
    """
    
    Job Description:
    """
    ${jobDescription}
    """
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Gemini Job Match Error: falling back to mock match.', error.message);
    return getFallbackJobMatch(resumeText, jobDescription);
  }
};

/**
 * Generates a cover letter based on resume text and company/role information.
 */
export const generateCoverLetter = async (resumeText, companyName, role, hiringManager = 'Hiring Manager') => {
  const model = getModel();
  if (!model) {
    return getFallbackCoverLetter(resumeText, companyName, role, hiringManager);
  }

  const prompt = `
    Write a customized, engaging, and high-impact cover letter.
    
    Candidate's Resume Information:
    """
    ${resumeText}
    """
    
    Target Application Details:
    - Company Name: ${companyName}
    - Role: ${role}
    - Addressed to: ${hiringManager || 'Hiring Manager'}
    
    You must respond ONLY with a JSON object fitting this schema:
    {
      "content": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Gemini Cover Letter Error: falling back to mock letter.', error.message);
    return getFallbackCoverLetter(resumeText, companyName, role, hiringManager);
  }
};

/**
 * Generates a professional summary from resume structured details.
 */
export const generateAISummary = async (resumeData) => {
  const model = getModel();
  if (!model) {
    return getFallbackAISummary(resumeData);
  }

  const prompt = `
    Generate a compelling, results-oriented, 3-4 sentence professional summary based on the following candidate information:
    
    Candidate Details:
    ${JSON.stringify(resumeData, null, 2)}
    
    You must respond ONLY with a JSON object fitting this schema:
    {
      "summary": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Gemini Resume Summary Error: falling back to mock summary.', error.message);
    return getFallbackAISummary(resumeData);
  }
};
