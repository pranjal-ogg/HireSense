'use strict';

/**
 * Resume Scoring Engine
 * Evaluates the quality, completeness, and ATS-readiness of a parsed resume.
 * Also supports optional matching against job requirements.
 */
class ResumeScoringEngine {
  /**
   * @param {Object} customWeights - Optional overrides for scoring weights
   */
  constructor(customWeights = {}) {
    // Default weights (must sum to 100 for easy percentage calculation)
    this.weights = {
      skillsPresence: 25,
      experience: 25,
      projects: 20,
      toolsAndTech: 15,
      completeness: 15,
      ...customWeights,
    };
  }

  /**
   * Evaluates a resume and returns a detailed score out of 100.
   * @param {Object} resumeData - The structured JSON from ResumeParser
   * @param {Object} jobRequirements - Optional job requirements to benchmark against
   * @returns {Object} { score, breakdown, feedback }
   */
  evaluate(resumeData, jobRequirements = null) {
    const feedback = [];
    const breakdown = {
      skillsPresence: this.#scoreSkills(resumeData, jobRequirements, feedback),
      experience: this.#scoreExperience(resumeData, feedback),
      projects: this.#scoreProjects(resumeData, feedback),
      toolsAndTech: this.#scoreToolsAndTech(resumeData, jobRequirements, feedback),
      completeness: this.#scoreCompleteness(resumeData, feedback),
    };

    // Calculate weighted overall score
    let overallScore = 0;
    for (const [category, score] of Object.entries(breakdown)) {
      overallScore += (score / 100) * this.weights[category];
    }

    return {
      score: Math.round(overallScore),
      breakdown,
      feedback,
    };
  }

  // ─── Individual Scoring Modules ───────────────────────────────────────────

  #scoreSkills(resumeData, jobRequirements, feedback) {
    let score = 0;
    const skills = resumeData.skills || [];

    if (skills.length === 0) {
      feedback.push('No skills detected. Add a dedicated skills section.');
      return 0;
    }

    if (jobRequirements && jobRequirements.requiredSkills) {
      // Benchmark against job requirements
      const candidateSkills = skills.map((s) => s.name.toLowerCase());
      const required = jobRequirements.requiredSkills.map((s) => s.toLowerCase());
      
      const matched = required.filter((req) => candidateSkills.includes(req));
      score = required.length > 0 ? (matched.length / required.length) * 100 : 100;

      if (score < 100) {
        feedback.push(`Missing required skills: ${required.filter((r) => !candidateSkills.includes(r)).join(', ')}`);
      } else {
        feedback.push('Excellent! All required skills are present.');
      }
    } else {
      // Generic quality check
      score = Math.min(skills.length * 10, 100); // 10 skills = 100%
      if (skills.length < 5) feedback.push('Consider adding more core skills to your profile.');
    }

    return Math.round(score);
  }

  #scoreExperience(resumeData, feedback) {
    const exp = resumeData.experience || [];
    if (exp.length === 0) {
      feedback.push('No work experience found. If you have internships, add them here.');
      return 0;
    }

    // Check depth of experience (descriptions, bullet points)
    let qualityScore = 0;
    exp.forEach((job) => {
      if (job.description && job.description.length > 50) qualityScore += 30;
      if (job.rawLine && job.rawLine.length > 20) qualityScore += 20; // fallback if poorly parsed
    });

    const finalScore = Math.min(qualityScore, 100);
    if (finalScore < 50) {
      feedback.push('Your experience descriptions are too brief. Add measurable achievements (e.g., "Increased sales by 20%").');
    }
    return finalScore;
  }

  #scoreProjects(resumeData, feedback) {
    // Assuming parser extracts projects (or we infer from experience/raw text)
    const projects = resumeData.projects || [];
    const rawText = (resumeData.rawText || '').toLowerCase();
    
    // If no explicit projects array, look for "projects" keyword in raw text as fallback
    if (projects.length === 0 && !rawText.includes('project')) {
      feedback.push('Adding a "Projects" section can significantly boost your profile, especially for tech roles.');
      return 0;
    }

    if (projects.length > 0) {
      const score = Math.min(projects.length * 33.3, 100); // 3 projects = 100%
      if (projects.length < 2) feedback.push('Consider adding more projects to showcase your practical experience.');
      return Math.round(score);
    }

    // Fallback if keyword found but not structured
    feedback.push('Project section detected but lacks structure. Ensure you list technologies used in each project.');
    return 70; 
  }

  #scoreToolsAndTech(resumeData, jobRequirements, feedback) {
    const skills = resumeData.skills || [];
    const techKeywords = ['git', 'aws', 'docker', 'kubernetes', 'linux', 'jira', 'ci/cd', 'webpack', 'figma'];
    
    const candidateTech = skills.map((s) => s.name.toLowerCase());
    const matchedTech = techKeywords.filter((tech) => candidateTech.includes(tech));

    let score = Math.min(matchedTech.length * 20, 100); // 5 recognized tools = 100%

    if (score < 50) {
      feedback.push('Your resume lacks mentions of standard industry tools (e.g., Git, Docker, Cloud platforms). Include them if you know them.');
    }

    return score;
  }

  #scoreCompleteness(resumeData, feedback) {
    let score = 0;
    const checks = [
      { field: resumeData.contactInfo?.email, weight: 20, msg: 'Missing Email.' },
      { field: resumeData.contactInfo?.phone, weight: 20, msg: 'Missing Phone Number.' },
      { field: resumeData.contactInfo?.linkedin, weight: 20, msg: 'Missing LinkedIn profile link.' },
      { field: resumeData.summary, weight: 20, msg: 'Missing Professional Summary.' },
      { field: resumeData.education?.length > 0, weight: 20, msg: 'Missing Education details.' },
    ];

    checks.forEach((check) => {
      if (check.field) {
        score += check.weight;
      } else {
        feedback.push(`Completeness issue: ${check.msg}`);
      }
    });

    if (score === 100) feedback.push('Great job! Your resume has all the essential sections.');
    return score;
  }
}

module.exports = ResumeScoringEngine;
