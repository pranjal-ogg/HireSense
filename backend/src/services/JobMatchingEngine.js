'use strict';

/**
 * Job Matching Algorithm
 * Calculates a match score between a candidate's resume and a job's requirements.
 * Considers Skill Overlap, Experience Match, and Degree Relevance.
 */
class JobMatchingEngine {
  constructor(weights = { skills: 50, experience: 30, education: 20 }) {
    this.weights = weights;
  }

  /**
   * @param {Object} resumeData - Parsed resume JSON
   * @param {Object} job - Job document
   * @returns {Object} Match details { score, breakdown, analysis }
   */
  calculateMatch(resumeData, job) {
    const analysis = [];
    
    const skillScore = this.#calculateSkillOverlap(resumeData.skills || [], job.requirements?.requiredSkills || [], analysis);
    const experienceScore = this.#calculateExperienceMatch(resumeData.experience || [], job.requirements?.minExperienceYears || 0, analysis);
    const educationScore = this.#calculateDegreeRelevance(resumeData.education || [], job.requirements?.educationLevel || 'any', analysis);

    const overallScore = Math.round(
      (skillScore * (this.weights.skills / 100)) +
      (experienceScore * (this.weights.experience / 100)) +
      (educationScore * (this.weights.education / 100))
    );

    return {
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      overallScore,
      breakdown: {
        skills: skillScore,
        experience: experienceScore,
        education: educationScore,
      },
      analysis,
    };
  }

  // ─── 1. Skill Overlap (50%) ──────────────────────────────────────────────
  #calculateSkillOverlap(candidateSkills, requiredSkills, analysis) {
    if (!requiredSkills || requiredSkills.length === 0) return 100;

    const candSkillsNorm = candidateSkills.map((s) => s.name.toLowerCase());
    const reqSkillsNorm = requiredSkills.map((s) => s.toLowerCase());

    const matched = reqSkillsNorm.filter((req) => candSkillsNorm.includes(req));
    const score = (matched.length / reqSkillsNorm.length) * 100;

    if (score === 100) {
      analysis.push('100% Skill match.');
    } else if (score > 0) {
      analysis.push(`Matches ${matched.length} out of ${reqSkillsNorm.length} required skills.`);
    } else {
      analysis.push('No required skills matched.');
    }

    return Math.round(score);
  }

  // ─── 2. Experience Match (30%) ───────────────────────────────────────────
  #calculateExperienceMatch(experiences, minYearsRequired, analysis) {
    if (minYearsRequired === 0) return 100;

    // Heuristic: Estimate total years from parsed experience array
    // Since parsing dates perfectly is hard without AI, we count entries as ~1.5 years average
    // or use exact calculations if dates are parsed.
    let estimatedYears = 0;
    experiences.forEach((exp) => {
      if (exp.startDate && exp.endDate) {
        estimatedYears += (new Date(exp.endDate) - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365);
      } else {
        estimatedYears += 1.5; // Fallback estimate per role
      }
    });

    if (estimatedYears >= minYearsRequired) {
      analysis.push(`Meets experience requirement (${Math.round(estimatedYears)} yrs detected).`);
      return 100;
    }

    const ratio = estimatedYears / minYearsRequired;
    analysis.push(`Short on experience: Has ~${Math.round(estimatedYears)} yrs, requires ${minYearsRequired} yrs.`);
    return Math.round(ratio * 100);
  }

  // ─── 3. Degree Relevance (20%) ───────────────────────────────────────────
  #calculateDegreeRelevance(educationEntries, requiredLevel, analysis) {
    if (requiredLevel === 'any') return 100;

    // Define hierarchy of degrees
    const hierarchy = { high_school: 1, associate: 2, bachelor: 3, master: 4, phd: 5 };
    const reqValue = hierarchy[requiredLevel] || 0;

    // Determine candidate's highest degree
    let highestCandValue = 0;
    educationEntries.forEach((edu) => {
      const deg = (edu.degree || '').toLowerCase();
      if (deg.includes('phd') || deg.includes('doctorate')) highestCandValue = Math.max(highestCandValue, 5);
      else if (deg.includes('master') || deg.includes('m.tech') || deg.includes('msc')) highestCandValue = Math.max(highestCandValue, 4);
      else if (deg.includes('bachelor') || deg.includes('b.tech') || deg.includes('bsc')) highestCandValue = Math.max(highestCandValue, 3);
      else if (deg.includes('associate')) highestCandValue = Math.max(highestCandValue, 2);
      else highestCandValue = Math.max(highestCandValue, 1);
    });

    if (highestCandValue >= reqValue) {
      analysis.push(`Meets or exceeds education requirement (${requiredLevel}).`);
      return 100;
    }
    
    if (highestCandValue === reqValue - 1) {
      analysis.push('Education is one tier below the exact requirement.');
      return 70; // Partial credit
    }

    analysis.push(`Does not meet education requirement of ${requiredLevel}.`);
    return 30; // Base credit for having some education
  }
}

module.exports = JobMatchingEngine;
